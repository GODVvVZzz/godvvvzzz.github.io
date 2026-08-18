---
title: "pprof 很正常，RSS 却很高：Go 进程的几本内存账"
description: "Heap profile、runtime metrics、RSS 与 cgroup 并不矛盾；它们回答的是不同问题。"
slug: go-memory-ledgers
date: 2025-11-04T00:00:28+08:00
lastmod: 2026-08-18T00:00:00+08:00
categories:
    - Go
tags:
    - Go
    - Memory
    - pprof
    - Linux
    - Performance
comments: true
---

堆 profile 只有几十 MiB，容器监控里的 RSS 却接近数 GiB。两个数字都没有错，它们只是来自不同的账本。

把“内存高”直接等同于“Go 堆泄露”，往往会让排查从一开始就走偏。更稳妥的做法是先回答：高的是哪一种内存，由谁管理，它是否仍被引用，以及它有没有归还操作系统。

## 五个经常被混用的数字

| 指标 | 回答的问题 | 看不到什么 |
|---|---|---|
| `pprof inuse_space` | 当前仍可归因到采样堆栈的 Go 堆对象 | runtime 元数据、线程栈、cgo、文件映射 |
| `HeapAlloc` / heap objects | Go 堆中仍在使用的对象 | 已空闲但仍保留的地址空间 |
| `Sys - HeapReleased` | Go runtime 估算的物理内存占用 | cgo 和通过 syscall 建立的外部映射 |
| RSS / `smaps_rollup` | 内核认为当前驻留的进程页面 | 哪段 Go 代码分配了对象 |
| cgroup `memory.current` | 容器被计费的内存 | 单个进程内部的归属关系 |

Go 官方 GC 指南给出的 runtime 内存估算是：

```text
runtime.MemStats.Sys - runtime.MemStats.HeapReleased
```

使用 `runtime/metrics` 时，等价表达为：

```text
/memory/classes/total:bytes
  - /memory/classes/heap/released:bytes
```

它仍然不是 RSS 的同义词，但比单看 heap profile 更接近 runtime 实际向物理内存施加的压力。

## 先建立差值，再寻找解释

一组有用的采样通常同时包含：

```bash
# 进程视角
cat /proc/$PID/smaps_rollup
cat /proc/$PID/status

# 容器视角（cgroup v2）
cat /sys/fs/cgroup/memory.current
cat /sys/fs/cgroup/memory.stat

# Go 视角
curl -s http://127.0.0.1:6060/debug/pprof/heap > heap.pb.gz
go tool pprof -top heap.pb.gz
```

然后计算两个差值：

```text
runtime gap = (Sys - HeapReleased) - HeapAlloc
external gap = RSS - (Sys - HeapReleased)
```

- `runtime gap` 较大，通常需要继续看空闲堆、goroutine 栈和 runtime 元数据；
- `external gap` 较大，优先检查 cgo、mmap、共享库、线程栈和文件页；
- `HeapAlloc` 本身持续上涨，才进入“对象为什么仍然存活”的经典堆泄露路径。

这个分层的价值在于：每个工具只负责解释它看得见的那部分，不要求 pprof 为整个进程背锅。

## 一个常见的峰值模型

定时上传任务很容易写成下面这样：

```go
func upload(path string) error {
    data, err := os.ReadFile(path)
    if err != nil {
        return err
    }
    return putObject(bytes.NewReader(data))
}
```

如果任务并发处理多个大文件，峰值内存近似为：

```text
文件大小 × 并发数
+ HTTP/TLS 缓冲
+ Go 堆增长余量
+ runtime 与进程固定成本
```

任务结束后，对象可能已经不可达，heap profile 也会恢复正常，但 RSS 不一定与它同步下降。此时重点不应该是“怎样强迫 GC 更勤快”，而是先避免制造不必要的峰值：

```go
func upload(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()

    return putObject(f) // 让上传链路消费流，而不是完整 []byte
}
```

流式处理改变的不是 GC 参数，而是内存复杂度：从 `O(file size × concurrency)` 收敛为 `O(buffer size × concurrency)`。这类结构性修改通常比调小 `GOGC` 更可靠。

## `GOMEMLIMIT` 是护栏，不是根因修复

在具有明确容器内存上限的服务中，可以使用 `GOMEMLIMIT` 或 `runtime/debug.SetMemoryLimit` 给 Go runtime 设置软限制。这个限制覆盖 Go runtime 管理的内存，但不包含 cgo 等外部内存来源。

```bash
GOMEMLIMIT=900MiB ./service
```

合理的限制需要给二进制映射、线程栈、内核计费和瞬时波动留出空间。限制设置得过低，会把 OOM 风险换成高频 GC，最终表现为吞吐下降和延迟抖动。

因此顺序应该是：

1. 降低峰值分配与并发放大；
2. 确认是否存在外部内存；
3. 为可控部署环境设置带余量的软限制；
4. 同时监控内存和 GC CPU，避免进入 thrashing。

`debug.FreeOSMemory()` 可以用于诊断“runtime 保留”是否构成主要差值，但不适合作为周期性业务逻辑。一个依赖强制归还内存才能稳定的服务，通常还有更上游的分配模型需要修正。

## 排查结束的标准

“重启后恢复”不是结论，“手动 GC 后下降”也不是。更完整的验证标准是：

- 相同输入与并发下，峰值可重复；
- heap、runtime、RSS 和 cgroup 四个视角能够对账；
- 负载结束后，各层指标符合预期的回落方式；
- 修改后，峰值由业务数据大小解耦为有界缓冲；
- 内存限制不会让 GC CPU 长时间触顶。

内存排查最难的部分通常不是读懂某个 profile，而是先确认手里的数字究竟在描述哪一层现实。

### 延伸阅读

- [A Guide to the Go Garbage Collector](https://go.dev/doc/gc-guide)
- [`runtime/metrics` memory classes](https://pkg.go.dev/runtime/metrics)
- [`runtime/debug.SetMemoryLimit`](https://pkg.go.dev/runtime/debug#SetMemoryLimit)
