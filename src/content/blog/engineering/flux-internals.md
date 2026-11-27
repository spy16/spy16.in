---
title: "Pausing a Go function for weeks"
pubDate: 2026-11-27
publish: true
description: |
  How flux lets a plain Go function, with normal ifs and for loops, wait weeks for a task and resume on another machine: replay, a lookup by name, and a panic.
tags: [golang, workflows, concurrency]
---

In [the previous post](/posts/engineering/flux/) I wrote about why long-running, failure-heavy flows ended up on **flux**, a workflow engine I built. This one is about the part I enjoyed building the most: how a workflow is just a Go function, with normal `if`s and `for` loops, that can stop in the middle, wait weeks for a task, and continue on a different machine after a deploy.

## Problem

This is what I wanted a workflow to look like:

```go
func accountOpening(env flux.Env, in Input) error {
    res, err := flux.SpawnAwait(env, "verify-identity", VerifySpec, in.Identity) // may take weeks
    if err != nil {
        return err
    }
    if !res.Match {
        _, err = flux.SpawnAwait(env, "manual-review", ReviewSpec, in)
    }
    return err
}
```

Go has no way to pause a function and pick it up later somewhere else. A goroutine blocked on a channel lives in one process's memory, and the next deploy kills it. There are no continuations to serialise, and no `yield`.

Temporal's Go SDK solves this by running your workflow code as coroutines on goroutines, blocking and unblocking them over channels with its own deterministic dispatcher [^1], and keeping them alive in a cache on the worker between tasks [^2]. When the cache misses, it rebuilds the state by replaying history.

Flux takes the blunt version of that idea: **never resume, always re-run.**

## Run it again from the top

Every time something changes (a task finished, a timer fired), the engine loads a snapshot of the workflow, which is its input plus every task it has created so far, and calls the Go function again from the first line.

Every flux call is a lookup **by task name** in that snapshot:

```
tick 1:  Spawn("verify-identity")  not in snapshot → create it (pending)
         Await                     pending → stop here

         ... days pass, a worker finishes the task ...

tick 2:  Spawn("verify-identity")  found, done → return the handle
         Await                     done → return its output
         if !res.Match             a normal Go if, on a stored output
         Spawn("manual-review")    not in snapshot → create it
         Await                     pending → stop here
```

Code before the stopping point runs again, but everything it asks for is already in the snapshot, so it just returns stored results and walks forward. The function only ever does real work at its frontier: the first call whose answer isn't known yet.

The one hard question is: how do you stop at that `Await`?

## Stopping with panic

The function is somewhere deep in user code, maybe three helpers down and inside a loop. We need to get out of all of it and back to the engine, right now. Go has exactly one tool that unwinds an arbitrary stack: `panic`.

This is `Await`'s core (trimmed):

```go
func (f *futureImpl) wait() error {
    if f.record.IsTerminal() && !f.record.FinishedAt.IsZero() {
        f.env.advanceClock(f.record.FinishedAt)
    }
    switch f.record.Status {
    case task.StatusDone:
        updateFrontier()
        return nil
    case task.StatusFailed:
        updateFrontier()
        return &fluxerr.Error{Code: f.record.Error.Code, Message: f.record.Error.Message}
    case task.StatusCancelled:
        updateFrontier()
        return &fluxerr.Error{Code: "cancelled", Message: "task was cancelled"}
    default:
        panic(suspendNow{}) // not ready: unwind back to the engine
    }
}
```

And this is the engine side that catches it:

```go
func (d *replayDriver[I]) safeInvoke(ctx context.Context, env Env, input I) (effects Patch, faulted bool, err error) {
    defer func() {
        if v := recover(); v != nil {
            if _, ok := v.(suspendNow); ok {
                effects = *env.patch() // everything this run decided before it stopped
                return
            }
            // any other panic is a bug: fault the workflow, keep the stack
        }
    }()
    deciderErr := d.fn(env, input)
    // nil → completed, flux.Fail(...) → failed, any other error → faulted
}
```

When `recover` stops the panic, "the state of functions called between G and the call to panic is discarded" [^3]. That's the whole trick. The stack is thrown away and nothing on it needed to survive, because the only thing a run produces is the **patch**: tasks to create, tasks to cancel, events to emit. The engine writes that patch in one transaction, guarded by the workflow's revision, so two reconcilers can't both apply a tick.

The same mechanism gives you the rules for free:

1. Never `recover()` inside a workflow function. It would swallow the suspension.
2. No goroutines. `recover` only catches a panic "on the same goroutine" [^3], so a suspension inside a goroutine you started would crash the process. It wouldn't be deterministic anyway.
3. `defer` in workflow code runs on every suspension, i.e., many times.
4. The usual determinism rules: no `time.Now()`, no random, no I/O. Use `env.Clock()` and tasks.

## Normal Go control flow

Since a replay is just running Go, branches and loops are plain Go. The only rule is that **task names are the program counter**: they must be the same on every replay, and unique per loop iteration. So you derive them from loop variables, never from time or randomness.

A retry-then-escalate loop:

```go
for attempt := 1; ; attempt++ {
    res, err := flux.SpawnAwait(env, fmt.Sprintf("verify-bank-%d", attempt), VerifyBankSpec, in.Bank)
    if err == nil && res.Match {
        break
    }
    if attempt == 3 {
        _, err = flux.SpawnAwait(env, "bank-manual-review", ReviewSpec, in.Bank)
        return err
    }
}
```

A daily reminder until the user does something:

```go
upload := flux.Spawn(env, "collect-document", CollectDocSpec, in)
for day := 1; ; day++ {
    wait := flux.Timer(env, fmt.Sprintf("reminder-wait-%d", day), 24*time.Hour)
    if flux.Select(upload, wait) == 0 {
        break // the user uploaded
    }
    flux.Emit(env, fmt.Sprintf("reminder.day-%d", day), in)
    if day == 7 {
        return flux.Fail("expired", "no document after a week")
    }
}
```

On replay, the loop runs through the days that already happened without waiting, because those timers are done in the snapshot, and stops at today's.

## Concurrency as a function of stored state

### Spawn doesn't stop, Await does

`Spawn` never suspends. It finds the task by name or adds a "create" to the patch, and returns a future. So three `Spawn`s followed by an `Await` create all three tasks in one tick, and workers run them in parallel. That's how you get parallelism with no goroutines.

`AwaitAll` is just `wait()` on each future in turn. The first one that isn't done panics, so it's a barrier.

### Select has no memory

`Select` returns the index of the first future to finish. In flux, it's a pure function of the snapshot:

```go
for i, f := range futures {
    if rec := f.getTask(); rec.IsTerminal() {
        candidates = append(candidates, candidate{i, rec})
    }
}
if len(candidates) == 0 {
    panic(suspendNow{})
}
// sort: earliest FinishedAt first, missing FinishedAt last, then lowest index
```

Nothing records "the winner was 1". Every replay works it out again from timestamps. That's elegant, and it means `Select` must give the same answer on every replay, forever, from whatever was written to the database.

### Race, and the bug that taught me this

`Race` is `Select` plus cancelling the losers. The first version stamped each cancelled loser with the winner's exact `finished_at`. On the next replay, every participant was terminal at the same instant, the timestamps tied, the index tie-break picked task 0, and the workflow went down the wrong branch.

The fix is a constant:

```go
// cancelSkew places a Race loser's cancellation after the winner's completion,
// far enough above the microsecond timestamptz quantum to survive a coarser hop.
const cancelSkew = time.Millisecond
```

Postgres stores timestamps with 1 microsecond resolution [^4], so a microsecond is the smallest gap that survives a round trip, and 1ms gives margin. `Cancel` does the same with the latest completion the workflow has seen. **In a replayed workflow, every timestamp you write is an input to a decision you will make again.**

### Timers are tasks

`flux.Timer` creates a built-in task whose `execute_at` is `env.Clock() + d`. A worker completes it when it's due. To the workflow, a timer, a user upload and a vendor call are the same thing: a task that will be terminal some day. That's why `Select(upload, wait)` needs no special case.

### The clock

`env.Clock()` starts at the workflow's creation time and moves forward only when `Await` or `Select` observes a finished task, to that task's `finished_at`. Every replay sees the same sequence of clock values. That's what makes `Timer(env, ..., 24*time.Hour)` inside the reminder loop land 24 hours after the previous reminder fired, not 24 hours after whenever the replay happens to run.

### Emit happens once

`flux.Emit` checks the event name against what the workflow has already emitted, and skips it if it's there. So the loop above sends each day's reminder event exactly once, no matter how many times it replays.

## What this leaves out

1. Replays get longer as a flow grows, and finding a task by name is a linear scan of the snapshot. For flows with tens of steps that's nothing, but it is quadratic.
2. Renaming a task in code means in-flight workflows can't find it, and create a new one.
3. If a branch changes mid-flight, the old branch's tasks don't cause an error. They stay in the snapshot, orphaned.

So the core of the engine is a lookup by name, a `panic` and a `recover`. Everything else is bookkeeping, and making sure the bookkeeping says the same thing every time you ask.

[^1]: Temporal Go SDK v1.33.0, `internal/internal_workflow.go`: `coroutineState` with `aboutToBlock` and `unblock` channels, and a `dispatcher` that "executes coroutines one by one in deterministic order".
[^2]: Temporal Go SDK v1.33.0, `internal/internal_task_pollers.go`: the sticky workflow cache (`stickyCacheSize`).
[^3]: The Go Programming Language Specification, [Handling panics](https://go.dev/ref/spec#Handling_panics).
[^4]: PostgreSQL docs, [Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html): `timestamp` has 1 microsecond resolution.
