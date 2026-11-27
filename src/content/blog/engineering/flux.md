---
title: "Workflows where every step is a conversation"
pubDate: 2026-11-27
publish: true
description: |
  Why I built flux, a workflow engine that keeps each step's state machine in the task, for ops-heavy and compliance-heavy flows where Temporal's model puts the replay constraint on the code that changes most.
tags: [golang, workflows, architecture]
---

I built **flux**, a durable workflow engine in Go. The first question anyone asks is: why not Temporal?

My first answer used to be "these workflows aren't deterministic, and Temporal needs deterministic workflows". That turned out to be the wrong way to put it. This post is the better answer.

## Problem

Some workflows are mostly automation: charge the card, reserve stock, send the email. Temporal is great at these.

Others are mostly people. Think of account opening with KYC, loan underwriting, insurance claims, vendor onboarding. They are **ops-heavy** and **compliance-heavy**, and almost every step is a conversation with three parties:

1. **The user**, who uploads a document, fixes a typo, and comes back two days later.
2. **A third party** (e.g., a government registry or a credit bureau), which answers slowly, calls back on a webhook, or allows only a few attempts a day.
3. **An ops or compliance person**, who sometimes has to step in: approve a mismatch, reset a step to manual entry, waive a document.

Take something as small as "verify an identity document". Written as a state machine, it looks like this:

```go
task.BindFSM(mgr, VerifyDocSpec, task.FSM[DocData, DocResult]{
    "pending":        {task.ActionSync: autoFetch, "manual": resetToInput},
    "pending.input":  {"submit": handleSubmit},
    "pending.verify": {task.ActionSync: callRegistry},
    "pending.review": {"approve": approve, "reject": reject, "manual": resetToInput},
    "failed.limit":   {task.ActionSync: retryLater},
})
```

To give you a summary:

1. One step of the workflow is itself a state machine with several stages.
2. It moves on actions from different sources: `sync` from a background worker, `submit` from the user, `approve`/`reject`/`manual` from ops.
3. Handlers talk to the outside world, and some stages park themselves (e.g., "daily limit hit, try again in an hour").

A real flow has dozens of steps like this, and the rules inside each step change all the time: a new regulation, a vendor that changed its response, a product tweak.

So the real question is: where does this state machine live?

## Where it lives in Temporal

Temporal's rule is that workflow code must be deterministic. On replay, the SDK re-runs your workflow code and compares what it does with the recorded event history, and a mismatch is a non-determinism error [^1]. Anything non-deterministic (API calls, I/O) goes into **activities**, which run outside the replay path and are retried [^1].

So "it isn't deterministic" is not a reason by itself: the registry call would simply be an activity. The state machine is the problem. There are two places to put it:

**In an activity.** An activity is one call that eventually finishes. It can hand its completion to an outside system with a task token (`client.CompleteActivity`) [^2], and it can carry heartbeat details across retries [^3]. But it can't sit in `pending.review` for two days and accept a `submit` from the user and later an `approve` from compliance, each going to a different handler.

**In the workflow** (or a child workflow per step), with Signals for user/ops actions and Updates where the caller needs an answer [^4]. This works, and it's how Temporal wants you to do it. But now every stage of every step is workflow code. Every user tap is an event in the history. And changing a step's rules for the people already halfway through it needs versioning (`workflow.GetVersion` in Go) [^5].

That last part is what hurts in these flows. The order of steps rarely changes. The logic inside the steps changes every few weeks. Temporal puts the replay constraint exactly on the code you change the most.

## What flux does

Flux splits Temporal's "workflow" into two layers.

### The workflow is a thin scheduler

A flux workflow is a Go function that only decides which tasks run and in what order. It is replayed from the start every time something changes, and it has the same determinism rules as Temporal: no `time.Now()`, no random, no I/O.

```go
func accountOpening(env flux.Env, in Input) error {
    if _, err := flux.SpawnAwait(env, "verify-identity", VerifyDocSpec, in.Identity); err != nil {
        return err
    }

    address := flux.Spawn(env, "verify-address", VerifyAddressSpec, in.Address)
    bank := flux.Spawn(env, "verify-bank", VerifyBankSpec, in.Bank)
    if err := flux.AwaitAll(address, bank); err != nil {
        return err
    }

    review := flux.Spawn(env, "compliance-review", ReviewSpec, in)
    sla := flux.Timer(env, "review-sla", 48*time.Hour)
    if flux.Select(review, sla) == 1 {
        flux.Emit(env, "review.sla_breached", in)
    }
    // ...
}
```

`Spawn` looks the task up by name in the stored snapshot and creates it only if it isn't there. `Await` returns the stored result if the task is done, and suspends the workflow if it isn't.

### The task is the durable state machine

A task is a row in Postgres with a `stage`, its data, and a revision. Its handlers are plain Go: they call vendors, read the clock, do whatever they need. **Task handlers are never replayed.** Each action runs the handler for the current stage once, and the result is written back with an optimistic-concurrency check on the revision:

```go
func callRegistry(ctx context.Context, tc task.Ctx[DocData, DocResult]) (task.Ctx[DocData, DocResult], error) {
    if tc.Data.AttemptsToday >= dailyLimit {
        return tc.Goto("failed.limit", tc.Data).SyncAfter(time.Hour), nil
    }
    res, err := registry.Verify(ctx, tc.Data.Number)
    if err != nil {
        return tc, err // retried with backoff, then parked as faulted
    }
    if !res.Match {
        return tc.Goto("pending.review", tc.Data), nil
    }
    return tc.Done(DocResult{Verified: true}), nil
}
```

Actions come from anywhere: a worker sends `sync`, your API forwards the user's `submit`, a webhook sends `callback`, an admin tool sends `approve`. A task marked `External` never runs on its own and only moves when someone acts on it. When a task reaches a terminal status, it bumps the workflow's wake counter, a reconciler claims the workflow, replays the thin scheduler, and the scheduler sees the result.

This is the whole point: **the code that changes most is code that is never replayed**. A deploy changes how the next action on a task is handled. The task's stored stage is all that has to stay compatible, which is the same kind of compatibility as any database row.

### Ops and compliance get an API, not a database console

Because a task is a row with a stage, the things ops needs are small, boring operations:

- **Send an action** to a task, the same path the user's app takes. The state machine decides whether it's allowed: an action that isn't valid in the current stage is rejected. So an override can't skip rules the way a raw `UPDATE` can.
- **Patch** a task's data, stage or status (e.g., mark it done with an output), as a last resort. The patch is written as an event, so "who changed what, and when" has an answer.
- **Rewind**: discard a task and everything that depended on it. The next replay doesn't find them by name, so it creates them again.
- **Terminate** a workflow.
- A task that runs out of retries goes to `faulted` and waits for a human, without failing the workflow around it.

Temporal's closest tool is Reset, which ends the execution and starts a new one that replays the history up to a chosen point [^6]. That's the right tool for "redo everything after here". Rewind is for "redo the address check and only what came from it".

## What it cost

There's a reason Temporal records decisions in the history. Flux doesn't: every decision is re-derived from task state on each replay. That bit me in production. `flux.Race` cancelled the losing tasks with the winner's exact `finished_at`. On the next replay, all of them were terminal at the same instant, the timestamp comparison tied, and the index tie-break picked task 0, so the workflow took the wrong branch. The fix was to cancel losers 1ms after the winner. The lesson is the general one: **in a replayed workflow, every timestamp you write is an input to a decision you will make again.** Temporal doesn't have this problem, because the winner is in the history.

Matching tasks by name also has two sides. A workflow whose branch changes mid-flight doesn't crash with a non-determinism error. It quietly leaves the old branch's tasks orphaned. That's friendlier on a deploy, and much harder to notice.

And everything Temporal gives you out of the box (a UI, metrics, retention, expiry) I had to build, and each one came with its own bugs.

If a flow is mostly automation, Temporal's model costs very little. For flows where every step is a long conversation with a user, a third party and a compliance team, the state wanted to live in the task, not in the replay.

[^1]: Temporal docs, [Workflow Definition](https://docs.temporal.io/workflow-definition): deterministic constraints, replay compares Commands with the Event History, and Activities "execute outside the replay path and are automatically retried". Also [Activity Definition](https://docs.temporal.io/activity-definition).
[^2]: Temporal Go SDK v1.33.0, `client.Client.CompleteActivity` and `activity.ErrResultPending` (`client/client.go`, `internal/error.go`).
[^3]: Temporal docs, [Activity timeouts and heartbeats](https://docs.temporal.io/develop/python/activities/timeouts): a retried Activity can read the `details` from the last heartbeat.
[^4]: Temporal docs, [Sending messages](https://docs.temporal.io/sending-messages): Signals, Queries and Updates.
[^5]: Temporal docs, [Versioning in Go](https://docs.temporal.io/develop/go/versioning).
[^6]: Temporal docs, [Events and Event History](https://docs.temporal.io/workflow-execution/event): "A Reset terminates a Workflow Execution and creates a new Workflow Execution with the same Workflow Type and Workflow ID."
