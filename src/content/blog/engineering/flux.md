---
title: "Why our onboarding doesn't run on Temporal"
pubDate: 2026-11-27
publish: true
description: |
  We already ran Temporal, and I still built a workflow engine for account onboarding. The reason is where the state machine for each step has to live.
tags: [golang, workflows, architecture]
---

At work, I built **flux**, the workflow engine our account onboarding runs on. The same service already ran Temporal for account closures and a few back-office flows. So the obvious question is: why build another one?

My first answer was "onboarding isn't deterministic, Temporal needs deterministic workflows". That turned out to be the wrong way to put it, and this post is the better answer.

## Problem

Opening a trading account in India is a long chain of checks and registrations: PAN verification, KRA lookup, Aadhaar, liveness and selfie, bank verification, e-sign, then registration with the exchanges (NSE, BSE) and the depository. Our onboarding flow has over 30 kinds of tasks.

The thing that makes it hard is not the length of the chain. It's that almost every step is a conversation with three parties:

1. **The user**, who submits a PAN, fixes a typo, comes back two days later.
2. **A vendor**, which answers slowly, calls back on a webhook, or rate-limits us (e.g., the PAN check has a daily attempt limit).
3. **An ops person**, who sometimes needs to step in: reset a PAN to manual entry, approve a selfie, skip a fund proof.

Take a look at the dispatch table for the PAN verification task (trimmed):

```go
task.FSM[Data, Output]{
    stagePending:     {ActionSync: handleAutoStart(deps)},
    stagePANFetch:    {ActionSync: handleAutoStart(deps), actionManual: manual},
    stagePANInput:    {ActionSubmit: handlePANSubmit(), ActionSync: noop},
    stageConfirmation: {ActionSubmit: handleConfirmSubmit(), actionManual: manual, ActionSync: noop},
    stageCorrection:  {ActionSubmit: handleNSDLCorrectionSubmit(), actionManual: manual, ActionSync: noop},
    stageFailedLimitExhausted: {ActionStart: startToCorrection, ActionSync: handleLimitExhaustedSync()},
    // ... 18 stages in total
}
```

To give you a summary:

1. One step of onboarding is itself a state machine with 18 stages.
2. It moves on actions from different sources: `sync` from a background worker, `submit` from the user, `manual` from ops.
3. Handlers call vendors directly, and some stages park themselves (e.g., "daily limit hit, try again in an hour").

So the real question is: where does this state machine live?

## Where it lives in Temporal

Temporal's rule is that workflow code must be deterministic. On replay, the SDK re-runs your workflow code and compares what it does with the recorded event history, and a mismatch is a non-determinism error [^1]. Anything non-deterministic (API calls, I/O) goes into **activities**, which run outside the replay path and are retried [^1].

So "onboarding isn't deterministic" is not a reason by itself: the vendor calls would simply be activities. The PAN state machine is the problem. There are two places to put it:

**In an activity.** An activity is one call that eventually finishes. It can hand its completion to an outside system with a task token (`client.CompleteActivity`) [^2], and it can carry heartbeat details across retries [^3]. But it can't sit in `pending.correction` for two days and accept a `submit` from the user and later a `manual` from ops, dispatching each to a different handler.

**In the workflow** (or a child workflow per step), with Signals for user/ops actions and Updates where the caller needs an answer [^4]. This works, and it's how Temporal wants you to do it. But now all 18 stages are workflow code. Every user tap is an event in the history. And changing the state machine for users who are already mid-flow needs versioning (`workflow.GetVersion` in Go) [^5].

That last part is what hurt for us. Onboarding rules change all the time (compliance, vendor behaviour, product), and the per-step logic changes much more often than the order of steps. Temporal puts the replay constraint exactly on the code we change the most.

## What flux does

Flux splits Temporal's "workflow" into two layers.

### The workflow is a thin scheduler

A flux workflow is a Go function that only decides which tasks run and in what order. It is replayed from the start on every wake-up, and it has the same determinism rules as Temporal: no `time.Now()`, no random, no I/O. This is what the end of our onboarding looks like (trimmed):

```go
nse := flux.Spawn(env, "nse-activate", registernse.Spec, nseData)
bse := flux.Spawn(env, "bse-activate", registerbse.Spec, bseData)

// At least one exchange must be active before the back-office push.
flux.Select(nse, bse)
bo := flux.Spawn(env, "bo-activate", registerbo.Spec, boData)

if err := flux.AwaitAll(nse, bse); err != nil {
    return err
}
```

`Spawn` looks the task up by name in the stored snapshot and creates it only if it isn't there. `Await` returns the stored result if the task is done, and suspends the workflow if it isn't.

### The task is the durable state machine

A task is a row in Postgres with a `stage`, its data, and a revision. Its handlers are plain Go: they call vendors, read the clock, do whatever they need. **Task handlers are never replayed.** Each action runs the handler for the current stage once, and the result (`Goto(stage)`, `Done`, `Fail`, optionally `SyncAfter(d)`) is written back with an optimistic-concurrency check on the revision.

Actions come from anywhere: a worker sends `sync`, our API sends the user's `submit`, a webhook sends `callback`, the admin API sends `manual`. A task marked `External` never runs on its own and only moves when someone acts on it. When a task reaches a terminal status, it bumps the workflow's wake counter, a reconciler claims the workflow, replays the thin scheduler, and the scheduler sees the result.

This is the whole point: **the code we change the most is code that is never replayed**. A deploy changes how the next action on a task is handled. The task's stored stage is all that has to stay compatible, which is the same kind of compatibility as any database row.

### Escape hatches are just API

Because a task is a row with a stage, the things ops needs are small, boring operations:

- Send an action to a task (`POST /tasks/{id}/execute`), the same path the user's app takes.
- Patch a task's data, stage or status (e.g., mark it done with an output).
- **Rewind**: discard a task and everything that depended on it. The next replay doesn't find them by name, so it creates them again.
- Terminate a workflow.
- A task that runs out of retries goes to `faulted` and waits for a human, without failing the workflow.

Temporal's closest tool is Reset, which ends the execution and starts a new one that replays the history up to a chosen point [^6]. That's the right tool for "redo everything after here". Rewind is for "redo the PAN check and only what came from it".

## What it cost

There's a reason Temporal records decisions in the history. Flux doesn't: every decision is re-derived from task state on each replay. That bit me. `flux.Race` cancelled the losing tasks with the winner's exact `finished_at`. On the next replay, all of them were terminal at the same instant, the timestamp comparison tied, and the index tie-break picked task 0, so the workflow took the wrong branch. A large number of flows failed before we caught it. The fix was to cancel losers 1ms after the winner, but the lesson is the general one: **in a replayed workflow, every timestamp you write is an input to a decision you will make again.** Temporal can't hit that bug, because the winner is in the history.

Matching tasks by name also has two sides. A workflow whose branch changes mid-flight doesn't crash with a non-determinism error. It quietly leaves the old branch's tasks orphaned. That's friendlier on a deploy, and much harder to notice.

And everything Temporal gives you for free (a UI, metrics, retention, expiry) we had to build, and each one came with its own bugs.

For a flow where every step is a long conversation with a user, a vendor and an ops person, the state wanted to live in the task, not in the replay.

[^1]: Temporal docs, [Workflow Definition](https://docs.temporal.io/workflow-definition): deterministic constraints, replay compares Commands with the Event History, and Activities "execute outside the replay path and are automatically retried". Also [Activity Definition](https://docs.temporal.io/activity-definition).
[^2]: Temporal Go SDK v1.33.0, `client.Client.CompleteActivity` and `activity.ErrResultPending` (`client/client.go`, `internal/error.go`).
[^3]: Temporal docs, [Activity timeouts and heartbeats](https://docs.temporal.io/develop/python/activities/timeouts): a retried Activity can read the `details` from the last heartbeat.
[^4]: Temporal docs, [Sending messages](https://docs.temporal.io/sending-messages): Signals, Queries and Updates.
[^5]: Temporal docs, [Versioning in Go](https://docs.temporal.io/develop/go/versioning).
[^6]: Temporal docs, [Events and Event History](https://docs.temporal.io/workflow-execution/event): "A Reset terminates a Workflow Execution and creates a new Workflow Execution with the same Workflow Type and Workflow ID."
