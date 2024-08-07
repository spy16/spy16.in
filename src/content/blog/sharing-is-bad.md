---
title: "When sharing is bad"
pubDate: 2024-08-07T11:03:59+05:30
publish: true
description: |
  A small experiment on effects of cacheline false-sharing in highly concurrent systems.
tags: [perf, optimization, golang]
no_toc: false
---

In this article, I will show you a fun little experiment with Go to see effects of [false-sharing](https://en.wikipedia.org/wiki/False_sharing#Multiprocessor_CPU_caches). 

Take a look at the following, simple, Go code:

```go
type Counters struct {
	c1 int64
	c2 int64
}

func main() {
	counts := Counters{}
	go reportCounts(&counts)

	wg := sync.WaitGroup{}
	wg.Add(2)
	go runIncrLoop(&wg, &counts.c1)
	go runIncrLoop(&wg, &counts.c2)
	wg.Wait()
}

func reportCounts(counts *Counters) {
	// We print no. of updates to both counters every
	// second and reset the counters to 0.
	for range time.Tick(1 * time.Second) {
		log.Printf("c1: %d incr/s, c2: %d incr/s\n", atomic.SwapInt64(&counts.c1, 0), atomic.SwapInt64(&counts.c2, 0))
	}
}

func runIncrLoop(wg *sync.WaitGroup, c *int64) {
	defer wg.Done()
	for {
		atomic.AddInt64(c, 1)
	}
}
```

To give you a summary:

1. It launches a groutine, that reads current value of both `c1` and `c2` counters, reset them to 0 atomically and then logs both values. It does this every second effectively giving us the rate of updates to both counters.
2. It also launches 2 more goroutines that independenlty & continously increment `c1` and `c2` counters.

<details>
<summary>Atomics</summary>
 We are using `atomic.AddInt64` and `atomic.SwapInt64` functions to ensure that the counters are updated atomically. This is needed because we are updating the counters from multiple goroutines concurrently.
</details>

When I run this program on my MacBook Air M2 8 Core, 16GB hardware, this is the output I get:

```
2024/08/07 11:56:36 c1: 23165341 incr/s, c2: 49398648 incr/s
2024/08/07 11:56:37 c1: 36560873 incr/s, c2: 41893883 incr/s
2024/08/07 11:56:38 c1: 30752833 incr/s, c2: 47741915 incr/s
2024/08/07 11:56:39 c1: 39369005 incr/s, c2: 34729565 incr/s
2024/08/07 11:56:40 c1: 38441497 incr/s, c2: 35583684 incr/s
```

Now, I will make a very simple change to the `Counter` struct above:

```diff
type Counter struct {
	c1 int64
+   _  [56]byte
	c2 int64
}
```
The rest of the code remains exactly the same. And now when I run this program, I get this output:

```
2024/08/07 11:57:02 c1: 242405985 incr/s, c2: 242274776 incr/s
2024/08/07 11:57:03 c1: 249417973 incr/s, c2: 248833780 incr/s
2024/08/07 11:57:04 c1: 249689673 incr/s, c2: 250421678 incr/s
2024/08/07 11:57:05 c1: 249226602 incr/s, c2: 249007715 incr/s
2024/08/07 11:57:06 c1: 250307251 incr/s, c2: 249906569 incr/s
```

If you compare this with previsous numbers, you will realise these are roughly ~10x higher than the previous iteration 🤯. 

How did this happen? How did we get a 10x performance boost just by adding a field that seemingly does nothing? Let's delve into the details.

## Cache lines

When a CPU core executes an instruction that requires data from main memory, it doesn't access the memory directly. Instead, it retrieves a **cache-line sized** chunk of memory into its L1 cache. This approach enables the CPU to access the data more quickly in the future. The cache-line size is typically 64 bytes on modern CPUs. Even if an instruction only requires a single byte of data, the CPU still fetches the entire cache line, which includes that byte.

### Cache Coherence

If a single core is accessing (reading/writing) a part of memory and no other core is reading/writing to that same part of memory, then that core can easily both read & write directly in the cache without needing to go to main memory on every update operation.

Imagine a scenario where one core is reading a piece of memory while another core is simultaneously updating the same memory location. When the writing core updates the memory in its L1 cache, it must ensure that the outdated cached versions of the same memory are no longer used by other cores. This is where the **cache-coherence protocol** comes into play, ensuring that all cores have a consistent view of the memory.

Now, recall that the core will always fetch an entire cache-line sized chunk of memory. This applies to reading, writing and invalidations as well. So, if a core fetched a byte of memory at location 0, and updated it, it will have to invalidate all cached versions of any memory that is starting between the offsets 0-63. This is how false-sharing can occur.

### False Sharing

False sharing occurs when two or more cores are updating parts of memory locations that happen to be on the same cache line but are different pieces of data. As a result of this sharing, the cores will repeatedly invalidate each other's cache lines even though, logically they are not accessing same pieces of data, causing unnecessary cache misses and main memory accesses.

This false-sharing is exactly what caused the first iteration to be 10x slower than the second.

If you look at the initial version of the `Counter` struct, it had 2 `int64` fields, effectively making it 16-bytes in size. This would fit easily on a single cache line (assuming the most common 64-byte cache-line on modern CPUs). 

Since we have 2 goroutines updating `c1` and `c2` independently, it is likely that they are scheduled on different cores (although, not guaranteed). 

When `c1` is modified, the cache-coherence protocol invalidates the entire cache line that includes both `c1` and `c2`. This results in a cache miss for the core updating `c2`, necessitating a re-fetch of the cache line from main memory, even though `c2` itself has not changed. Similarly, when `c2` is updated, `c1` is also re-fetched from main memory due to the cache line invalidation. So both cores are constantly invalidating each other's cache lines, causing unnecessary cache misses and main memory accesses.

In the second iteration of the struct, we introduced **padding** (specifically, `_    [56]byte`). This adjustment ensured that `c1`, with its size of 8 bytes, plus the padding, now spans a total of 64 bytes, effectively placing `c2` on a distinct cache line. Consequently, when `c1` is updated, it no longer triggers the invalidation of `c2`, and vice versa.
This deliberate design change enabled the cores to operate independently, resulting in a significant 10x increase in throughput.

In conclusion, sharing is bad sometimes 😅. False-sharing can have a significant impact on the performance of highly concurrent systems. It is important to be aware of these issues and design your data structures accordingly to avoid such pitfalls.