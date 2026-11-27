---
title: "Long-running workflows are mostly failure handling"
pubDate: 2026-11-27
publish: true
description: |
  Ops-heavy, compliance-heavy flows with 20+ steps, each a state machine of its own. Why a table per step stops working, and what I built instead.
tags: [golang, workflows, architecture]
---

The flows I worked on had 20+ independent steps. Each step was a big state machine on its own: uploading data to a vendor and tracking what happened to it, handling its failures, pausing while a third party was down for maintenance, and getting rewound when we found a problem weeks later. I ended up building a workflow engine, **flux**, for them.

This post is about why this kind of workflow gets complicated, and why the simple design stops working.

## One step

Take one step: submit a customer's record to an external registry. On a good day it's one API call. Here is what it can look like over its lifetime:

1. We build the payload and upload it. The request times out. Did the upload land or not?
2. It did. The registry says "processing", and keeps saying it for hours.
3. It rejects the record because a field doesn't match its own data. Retrying won't help: the user has to fix it, or ops has to approve the mismatch.
4. The user fixes it days later. The registry is down for its nightly maintenance window, so the resubmission has to wait until morning without counting as a failure.
5. The registry allows only a few attempts per day per record. We hit the limit.
6. It finally goes through. Weeks later, someone finds that the submitted data was wrong. Now we need to redo this step, and every step after it that used its result.

Now multiply that by 20 steps, by every customer who is somewhere in the middle, and by a deploy every few days.

## The failures have different shapes

Steps fail in several different ways, and each one needs a different response:

| Failure | Example | What it needs |
| --- | --- | --- |
| Transient | timeout, 5xx | retry with backoff |
| Unknown outcome | sent, no answer | check status or use an idempotency key, never a blind retry |
| Rejection | data mismatch | a person or the user, not a retry |
| Not now | maintenance window, daily limit | wait until a time, don't count it as a failure |
| Waiting on a human | user uploads, ops review | hours to weeks, then expiry |
| Found later | succeeded, but was wrong | redo the step and everything that depended on it |
| Concurrent actors | worker retry, webhook and ops click at once | exactly one of them wins |
| Code changes | new rule while thousands are mid-flow | in-flight state stays valid |

And because these are compliance-heavy flows, every transition and every manual override needs a record of who did what, and when.

## A table per step

The obvious design is a table per step, with its own schema:

```sql
CREATE TABLE registry_submissions (
    customer_id     BIGINT PRIMARY KEY,
    status          TEXT NOT NULL,  -- pending, uploaded, processing, rejected, done
    vendor_ref      TEXT,
    attempts        INT  NOT NULL DEFAULT 0,
    attempts_today  INT  NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ,
    locked_until    TIMESTAMPTZ,
    last_error      TEXT,
    updated_at      TIMESTAMPTZ NOT NULL
);
```

Plus a job that picks rows where `next_attempt_at` has passed and nobody holds the lock. For one or two steps, this is the right answer. It's simple, and you can read everything with SQL.

At 20 steps, this is what goes wrong:

1. Only `status` values and `vendor_ref` are specific to this step. `attempts`, `next_attempt_at`, `locked_until`, `last_error` are machinery, and the machinery is copied into every table. Each copy is a new chance to get the backoff, the lock expiry or the retry count wrong.
2. The flow exists nowhere. "When the registry submission is done, create the bank verification row" lives inside the success path of the previous step. To find out what happens after step 7, you grep.
3. Rewind is an incident. Which rows in which tables were derived from the bad one? Nothing records that, so someone works it out and writes SQL by hand.
4. Every table needs its own admin screen, metrics and audit trail. Ops can only do what someone built a button for, so they end up asking engineers for `UPDATE` statements. That's exactly what compliance doesn't want.
5. Every time a step's state grows, it's another migration.

## One table for every step

Look at what's actually different between those tables: the stage names, the step's own data, and the code that runs in each stage. Everything else is the same.

So flux has one `tasks` table. A row has a `kind`, a `stage`, its `data` as JSON, a status, an attempt count, the next time it should run, a revision, and the tasks it depends on. Each kind registers a state machine:

```go
task.BindFSM(mgr, SubmitSpec, task.FSM[SubmitData, SubmitResult]{
    "pending":          {task.ActionSync: upload},
    "pending.uploaded": {task.ActionSync: pollStatus, "callback": onCallback},
    "pending.rejected": {"resubmit": upload, "approve": approve},
})
```

And a handler is plain Go:

```go
func upload(ctx context.Context, tc task.Ctx[SubmitData, SubmitResult]) (task.Ctx[SubmitData, SubmitResult], error) {
    if until, down := registry.MaintenanceUntil(time.Now()); down {
        return tc.SyncAfter(time.Until(until)), nil // not now, and not a failure
    }
    ref, err := registry.Upload(ctx, tc.Data.Payload, tc.Task.UID) // task UID as idempotency key
    if err != nil {
        return tc, err // retried with backoff, then parked as faulted
    }
    tc.Data.VendorRef = ref
    return tc.Goto("pending.uploaded", tc.Data).SyncAfter(5 * time.Minute), nil
}
```

To give you a summary of what every step now gets once, instead of 20 times:

1. Retries with backoff only when the handler returns an error. `SyncAfter` without an error just reschedules, so "not now" doesn't burn attempts.
2. A task that runs out of retries goes to `faulted` and waits for a human, without failing the flow around it.
3. Actions from anywhere: a worker sends `sync`, a webhook sends `callback`, the user's app or an ops tool sends `resubmit`/`approve`. An action that isn't valid in the current stage is rejected, so an ops override goes through the same rules as everything else.
4. Every write checks the revision, so when a retry, a webhook and an ops click land at once, one wins and the others see a conflict.
5. One admin API, one set of metrics, and one event log. Every transition and every manual patch is written as an event, which is the audit trail.

## The order in one place

The steps still need an order. Some run in parallel, some wait for others, some race a deadline. Instead of "on success, insert the next row", the order lives in one Go function:

```go
func accountOpening(env flux.Env, in Input) error {
    if _, err := flux.SpawnAwait(env, "submit-registry", SubmitSpec, in.Record); err != nil {
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

This function never does I/O. It's replayed from the top every time a task finishes: `Spawn` finds an existing task by name or creates it, and `Await` returns the stored result or suspends.

Because `Spawn` records which tasks each new task depends on, rewind stops being an incident. `Rewind` on a task with `dry_run` lists that task and everything that transitively depended on it. Applying it discards them, and the next replay doesn't find them by name, so it creates them again. Problem 6 from the start of this post becomes one API call.

## Why not Temporal?

Temporal gives you the "order in one place" part, and more. Its rule is that workflow code is deterministic: on replay it's re-run and checked against the recorded history, and non-deterministic work goes into activities [^1].

The trouble is the 20 state machines. In Temporal there are two places to put one. An activity is one call that eventually finishes. It can be completed from outside with a task token [^2] and keep heartbeat details across retries [^3], but it can't sit in `pending.rejected` for two days and take a `resubmit` from the user or an `approve` from ops. The other place is workflow code, with Signals and Updates for those actions [^4]. That works, but then every stage of every step is replayed code, and changing a step's rules for people already in it needs versioning [^5].

In these flows, the order of steps rarely changes. The rules inside each step change every few weeks. In flux, only the thin scheduler is replayed. The task handlers, the code that changes most, never are.

## What it cost

Temporal records every decision in the history. Flux re-derives every decision from task state on each replay, which is simpler and also bit me in production. How that replay works, with a plain Go function suspended by a `panic`, is in [part 2](/posts/engineering/flux-internals/).

Matching tasks by name also cuts both ways. A flow whose branch changes mid-flight doesn't crash. It quietly leaves the old branch's tasks orphaned.

And the UI, metrics, retention and expiry were all mine to build, with their own bugs.

Most of the code in these flows is about the many ways a step can be not done yet.

[^1]: Temporal docs, [Workflow Definition](https://docs.temporal.io/workflow-definition): deterministic constraints, replay compares Commands with the Event History, and Activities "execute outside the replay path and are automatically retried".
[^2]: Temporal Go SDK v1.33.0, `client.Client.CompleteActivity` and `activity.ErrResultPending` (`client/client.go`, `internal/error.go`).
[^3]: Temporal docs, [Activity timeouts and heartbeats](https://docs.temporal.io/develop/python/activities/timeouts): a retried Activity can read the `details` from the last heartbeat.
[^4]: Temporal docs, [Sending messages](https://docs.temporal.io/sending-messages): Signals, Queries and Updates.
[^5]: Temporal docs, [Versioning in Go](https://docs.temporal.io/develop/go/versioning).
