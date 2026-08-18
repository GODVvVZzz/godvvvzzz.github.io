---
title: "FD 持续增长时，先别急着调高 ulimit"
description: "从描述符曲线、socket 状态到 HTTP 连接生命周期，建立一条可验证的泄露排查链路。"
slug: fd-leak-investigation
date: 2024-12-10T00:00:00+08:00
lastmod: 2026-08-18T00:00:00+08:00
categories:
    - 可靠性
tags:
    - Go
    - Linux
    - HTTP
    - Incident Analysis
comments: true
---

“Too many open files” 只是最后一张多米诺骨牌。

真正值得关注的信号通常出现得更早：流量已经回落，进程持有的文件描述符却没有回到基线；重启能够恢复，但曲线会以几乎相同的斜率再次上升。此时调高 `ulimit` 只能延后故障，无法解释资源为什么没有结束生命周期。

## 先区分容量问题和生命周期问题

单个 FD 数值很难说明问题。连接池、日志文件、监听端口都会合法占用描述符。更有价值的是三个维度：

1. **趋势**：FD 是否随请求累计，而不是随并发量涨落；
2. **类型**：增长来自普通文件、socket、pipe，还是匿名 inode；
3. **状态**：如果是 socket，它们集中在哪些 TCP 状态和远端地址。

```bash
# 当前数量与限制
ls /proc/$PID/fd | wc -l
cat /proc/$PID/limits | grep "open files"

# 描述符类型
lsof -nP -p "$PID"

# socket 状态与对端
ss -tanp | grep "pid=$PID"
```

排障的关键不是多执行几个命令，而是让每条证据缩小假设空间：

```text
FD 持续增长
  ├─ regular file  → 文件、日志轮转、临时文件
  ├─ pipe          → 子进程、I/O 管道、未结束的 reader
  └─ socket
       ├─ CLOSE_WAIT → 对端已关闭，本地仍未 close
       ├─ ESTABLISHED → 请求仍在进行或连接池过大
       └─ SYN_SENT    → 建连阻塞或网络不可达
```

如果绝大多数新增 FD 都指向同一类 socket，并且远端集中在同一个依赖服务，范围就从“整个进程”缩小到了“一条调用链”。

## HTTP 调用中最容易被忽略的边界

下面这段代码看起来已经处理了错误，资源生命周期却是不完整的：

```go
func verify(ctx context.Context, url string) error {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return err
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("unexpected status: %s", resp.Status)
    }

    return nil
}
```

当 `Do` 返回成功时，`Response.Body` 一定需要关闭。对于 HTTP/1.x，如果响应体既没有读取到 EOF，也没有关闭，底层连接还可能失去复用机会。结果不一定表现为一个永久不释放的 FD，也可能表现为连接反复新建、短时间内数量快速膨胀。

一个更完整的调用边界如下：

```go
var transport = &http.Transport{
    MaxIdleConns:        100,
    MaxIdleConnsPerHost: 20,
    MaxConnsPerHost:     50,
    IdleConnTimeout:     90 * time.Second,
}

var client = &http.Client{
    Transport: transport,
    Timeout:   5 * time.Second,
}

func verify(ctx context.Context, url string) error {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return err
    }

    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    // 读取到 EOF，允许 Transport 在条件满足时复用连接。
    if _, err := io.Copy(io.Discard, resp.Body); err != nil {
        return err
    }

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("unexpected status: %s", resp.Status)
    }
    return nil
}
```

这里有三个不同的控制面：

- `Context` 控制一次业务调用何时取消；
- `Client.Timeout` 给完整 HTTP 往返设置上界；
- `Transport` 控制连接池规模和空闲连接寿命。

三者不能互相替代。只有超时而没有连接上限，依赖抖动时仍可能瞬间创建大量连接；只有连接上限而没有超时，请求可能长期占着池中的槽位。

另一个细节是，`defer resp.Body.Close()` 不应该堆在一个长期循环的最外层函数里。把单次请求封装成独立函数，让 `defer` 在每次迭代结束时执行，资源边界才和请求边界一致。

## 修复是否有效，不能只看“没有再报错”

一次可靠的验证至少包含四层：

1. 用固定并发和固定请求数复现增长；
2. 同时记录请求速率、在途请求、FD 总数和 socket 状态；
3. 停止流量后观察 FD 是否回落到稳定基线；
4. 对超时、非 2xx、响应体读取失败分别加入回归测试。

期望看到的不是 FD 永远不增长，而是它与并发量相关、有明确上界，并且负载结束后能够回落。

## 最后才讨论限制值

提高 `RLIMIT_NOFILE` 有时是合理的容量规划，但顺序不应该反过来。先证明每一种 FD 都有所有者、结束条件和数量上界，再决定系统需要多大的余量。

资源泄露很少只是“忘记调用一次 Close”。更常见的根因是：代码定义了成功路径，却没有完整定义取消、超时、失败和清理路径。

### 延伸阅读

- [Go `net/http` package documentation](https://pkg.go.dev/net/http)
- [Linux `/proc` process filesystem](https://docs.kernel.org/filesystems/proc.html)
