---
title: "Context Cancellation in Go"
pubDate: 2023-12-05
publish: true
description: |
    This article explores different cancellation patterns that can be achieved using contexts.
tags: [golang, patterns, practices]
no_toc: false
---

One of the most important use-cases of context in Go is propagating/handling cancellation. Cancellation is the process of terminating or stopping the execution of a task or operation. With context, we can propagate cancellation signals across API boundaries and between goroutines to gracefully stop the execution of a task when it is no longer needed or when an error occurs.

Context cancellation is a mechanism usually used to **inform goroutines in concurrent-safe way that they need to save or discard their work and safely exit.**

It's important to note that the context is not inherently tied to the runtime, and passing a context to a goroutine does not automatically make it stoppable. The function running in the goroutine needs to explicitly check the context at appropriate points and make the decision to exit.

We can make any context value "cancellable" using different ways:

```go
// Manual: Cancel manually by calling the `cancel` func returned.
ctx, cancel := context.WithCancel(baseCtx)

// Timeout: Cancel automatically after 10 seconds.
ctx, cancel := context.WithTimeout(baseCtx, 10 * time.Second)

// Deadline: Cancel when current time reaches the deadline set.
// For e.g., this context will be valid until Tue Aug 3 11:09:16 GMT 2055
ctx, cancel := context.WithDeadline(baseCtx, time.Unix(2700904156, 0))
```

**Note**: It is important to note that, in all the above cases, the `ctx` will be cancelled if `baseCtx` is
cancelled as well.

You might notice that each `With` variant returns a `cancel` function. This is because these variants internally set up a goroutine to monitor the time/deadline and perform the actual cancellation. The `cancel` function can be used to stop these goroutines and perform any necessary cleanup when the `ctx` is no longer needed. To ensure proper cleanup, it is recommended to call `cancel` using `defer` right after the `WithX()` line.

And we can check if a context is cancelled using a `select` statement:

```go
select {
    case <-ctx.Done():
        // context has been cancelled.
    
    default:
        // context is still valid. 
}
```

## Stopping Goroutines

Consider this function: 

```go
func printTime() {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    for t := range ticker.C {
        fmt.Println(t.String())
    }
}
```

If you call this in your `main()`, it would block forever and keep printing time. But of course if you don't want that, you can launch it to run concurrently as a separate gouroutine using the `go printTime()` construct.

But what if you wanted to be able to stop it when needed. This is one of the use-cases where context comes in handy.

We could refactor as shown below:

```go
func printTime(ctx context.Context) {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for {
        select {
            case <-ctx.Done():
                return

            case t := <-ticker.C:
                fmt.Println(t.String())
        }
    }
}
```

The behaviour of the function remains the same except now it also considers the `ctx` on every iteration. If the `ctx` is cancelled at any time, the next check will exit the function, thus allowing us to stop the work when needed.

## HTTP Requests

Let's consider an example where we have an HTTP endpoint `POST /compute` with the following Go handler:

```go
func computeHandler(w http.ResponseWriter, r *http.Request) {
    // Read parameters sent by the client (as JSON body)
    var params ComputeParams
    _ = json.NewDecoder(r.Body).Decode(&params) 

    // Perform some computation.
    result, ok := veryExpensiveComputation(params)

    if ok {
        // Send the result back to the client
        _ = json.NewEncoder(w).Encode(result)
    }
}
```

In this scenario, we want to send user input from a mobile app to the server, perform a computation, and then send the result back to the client. However, there are cases where the user may close the app or the request may be dropped due to a network issue. In such situations, it is unnecessary to complete the computation and send the result back, as the client is no longer there to receive it. We could potentially save a lot of unnecessary work by using context here.

Let's say we refactored our `veryExpensiveComputation` to accept and use a context, we can pass it `r.Context()` to ensure it receives a cancellation when the request ends.

```go
func computeHandler(w http.ResponseWriter, r *http.Request) {
    // ...

    result, ok := veryExpensiveComputation(r.Context(), params)

    // ...
}
```

Just passing the context is not enough of course. In our `veryExpensiveComputation` function, we should ensure we check context cancellation at various stages of our compute logic to see if the client has cancelled the request. For example, if this function has a for loop to process a large array, we could do something like this:

```go
func veryExpensiveComputation(ctx context.Context, params Params) (*Result, bool) {
    var result Result
    for i := 0; i < params.Iterations; i++ {
        select {
            case <-ctx.Done():
                return nil, false

            default:
                // do some number crunching and push it into `result`
        }
    }

    return &result, true // successfully completed.
}
```

This way, if user cancels the request when we have only processed 10 iterations out of 100,000 required, we will avoid doing the remaining 99,990 iterations.

## Graceful Shutdown

One important aspect that often gets overlooked is what happens when your server restarts (e.g., due to deployment, scaling down, etc.) and there are ongoing requests. If you do not implement graceful shutdown on your server, these requests could terminate abruptly giving a very bad experience to the end-user. 

We can use contexts for graceful shutdown as well. For example, I use this for HTTP servers:

```go
func GracefulServe(ctx context.Context, srv *http.Server) error {
    errCh := make(chan error, 1)

    go func() {
        err := srv.ListenAndServe();
        if  err != nil && !errors.Is(err, http.ErrServerClosed) {
            errCh <- err
        }
    }()

    select {
    case <-ctx.Done():
        // we use a new context with timeout to allow the server to
        // finish already accepted requests.
        ctx, cancel := context.WithTimeout(
            context.Background(), 5*time.Second,
        )
        defer cancel()

        return srv.Shutdown(ctx)

    case err := <-errCh:
        return err
    }
}
```

It can be used to shutdown when process receives `SIGINT` as shown below:

```go
func main() {
    ctx, cancel := signal.NotifyContext(
        context.Background(), os.Interrupt,
    )
    defer cancel()

    server := &http.Server{
        Addr: ":8080",
        Handler: myRouter,
    }

    if err := GracefulServe(ctx, server); err != nil {
        log.Fatalf("server exited with error: %v", err)
    }
}
```

The same `ctx` value can be passed to database drivers, gRPC server instances, worker goroutines, etc. to signal a graceful shutdown across the whole system. 

## Conclusion

As we have seen, contexts are really powerful primitives provided by Go, which when used correctly helps us build very  efficient systems in Go. In addition to the different use-cases I have detailed above, more can be built on these basic ideas of context usage.