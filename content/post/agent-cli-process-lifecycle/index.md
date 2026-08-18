---
title: "超时已经触发，为什么 Agent CLI 还没有结束"
description: "当直接子进程、进程树、I/O 管道和结果协议拥有不同生命周期时，一个 context deadline 并不能定义完整的终止语义。"
slug: agent-cli-process-lifecycle
date: 2026-08-18T10:00:00+08:00
categories:
    - Agent Infra
tags:
    - Go
    - Agent Runtime
    - os-exec
    - Process
    - Reliability
comments: true
---

超时已经触发，命令的直接子进程也退出了，调用却仍然没有返回。

真正没有结束的可能不是那个子进程，而是等待 stdout EOF 的 I/O 链路。只要某个孙进程仍持有管道的写端，负责收集输出的 goroutine 就无法确认输出结束，`Wait` 也就没有完成条件。

这类问题在 Agent Runtime 中尤其容易出现。运行时调用的不是行为完全可控的函数，而是各种 CLI、shell shim、Node.js 启动器和它们派生的辅助进程。把 `context deadline` 直接理解成“任务已经终止”，会漏掉中间至少三层生命周期。

## 一个足够小的复现

下面的 shell 在后台启动一个进程，然后立即打印结果并退出：

```bash
sh -c 'sleep 30 & echo "/tmp/agent.json"'
```

如果通过 Go 的 `Output` 捕获结果：

```go
ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
defer cancel()

cmd := exec.CommandContext(ctx, "sh", "-c", `sleep 30 & echo "/tmp/agent.json"`)
out, err := cmd.Output()
```

shell 很快退出，业务需要的路径也已经打印出来，但后台 `sleep` 继承了 stdout 的文件描述符。对 `os/exec` 来说，输出管道仍可能继续产生数据，因此复制 stdout 的 goroutine 还在等待 EOF。

Go 文档对这个边界描述得很明确：当 `Stdout` 或 `Stderr` 不是 `*os.File` 时，`os/exec` 会启动 goroutine 在管道和目标 Writer 之间复制；`Wait` 需要等这些 goroutine 到达 EOF、遇到错误，或者非零 `WaitDelay` 到期。

这暴露出四个经常被合并成一个词的事件：

```text
context done
    ≠ direct child exited
    ≠ output collection finished
    ≠ process tree terminated
```

## `CommandContext` 管的是直接子进程

`exec.CommandContext` 默认会在 context 结束时调用直接子进程的 `Kill`。它并不天然拥有整棵进程树。

```text
runtime
└── shell shim          ← cmd.Process
    └── node
        └── helper      ← 仍可能持有 stdout / lock / socket
```

杀掉 shell 不等于杀掉 Node.js，更不等于清理 helper。孙进程可能被重新托管，也可能继续持有管道、端口或工作目录中的锁。

这意味着“取消”至少需要定义两件事：

1. 调用方是否停止等待；
2. 被调用方留下的计算和资源是否被回收。

只实现第一件事，任务表面上返回了，泄露的进程仍会在后台累积。

## `WaitDelay` 解决等待上界，不等于进程树治理

`Cmd.WaitDelay` 可以限制两类异常等待：context 已取消但子进程没有退出，以及子进程退出后 I/O 管道仍未关闭。

它适合给 `Wait` 建立一个最终上界，但需要接受其语义：当管道因 `WaitDelay` 被强制关闭时，调用可能返回 `exec.ErrWaitDelay`。对于“输出一个值然后退出”的探测命令，这会产生一个棘手问题：结果已经完整出现，辅助进程却迟迟不退出，究竟算成功还是失败？

这不是超时参数能够回答的问题，而是结果协议需要回答的问题。

| 边界 | 可以确定什么 | 不能确定什么 |
|---|---|---|
| context deadline | 调用预算耗尽 | 输出是否完整、后代是否退出 |
| direct child exit | leader 已结束 | 管道是否 EOF、进程树是否清理 |
| `WaitDelay` | `Wait` 最终有上界 | 业务结果是否有效 |
| decoder success | 输出满足协议 | 后台进程是否被回收 |

## 结果边界和进程边界应该分开设计

对普通编译命令，进程退出码通常就是结果边界；对一次性探测命令，真正的结果可能是一行路径或一段 JSON；对流式 Agent 协议，结果边界可能是一个明确的 terminal event。

因此运行时需要先判断命令属于哪一类：

- **exit-bound**：必须等进程退出并检查 exit code；
- **value-bound**：成功解码一个完整值即可得到业务结果；
- **protocol-bound**：必须观察到协议定义的终态事件。

“stdout 有内容就算成功”仍然太宽松。超时前打印的半段 JSON、错误提示或进度日志都可能被误判为结果。value-bound 命令必须使用命令专属的完整性规则：路径需要通过校验，JSON 需要完整解码，枚举结果需要满足 schema。

```go
type Boundary[T any] interface {
    Feed(chunk []byte) (value T, complete bool, err error)
}
```

输出安静一段时间可以作为读取策略，却不应该单独成为成功条件。决定成功的是 decoder，而不是计时器。

## 运行时必须拥有自己启动的进程树

在 Unix 上，常见做法是让命令成为新进程组的 leader，并在取消时向整个进程组发送信号：

```go
cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

// 负 pid 表示进程组。实际实现还需要处理启动失败、竞态与降级。
_ = syscall.Kill(-cmd.Process.Pid, syscall.SIGTERM)
```

经过宽限期仍未退出时，再升级为 `SIGKILL`。Windows 没有相同的进程组语义，通常需要 Job Object。跨平台 runtime 如果只在 Unix 上实现整树回收，就应该明确暴露这一能力差异，而不是让相同 API 在两个平台上暗含不同保证。

这里还有一个容易忽略的竞态：直接子进程退出后 PID 可能被复用。信号发送、`Wait`、管道回收和进程组清理的顺序需要由一个组件统一管理，不能让调用方各自拼接。

## 回归测试要构造“错误的生命周期”

正常命令很难覆盖这些问题。有效测试需要故意制造违反直觉的进程行为：

1. leader 退出，孙进程继续持有 stdout；
2. 结果完整打印后进程永久不退出；
3. 输出持续到 deadline，只留下半段结果；
4. 打印看似合法的结果后以非零状态退出；
5. context 取消时，确认整棵进程树都被回收；
6. 并发运行多次，确认没有遗留 goroutine、FD 或进程。

测试通过的标准也不只是“函数返回了”：

```text
返回时间有上界
+ 结果语义正确
+ stderr / exit status 未丢失
+ 管道全部关闭
+ 后代进程归零
```

## 一个更准确的抽象

Agent Runtime 执行 CLI 时，管理的不是一条命令，而是一段临时的资源租约：

```text
lease = process tree
      + pipes
      + working directory
      + credentials
      + result boundary
      + cancellation policy
```

context 只是租约的截止时间，不是清理动作本身。只有当这些资源都有明确所有者和结束条件，“任务完成”才是一个可以被运行时保证的状态。

这组问题来自 [Multica](https://github.com/multica-ai/multica) 中围绕 OpenClaw CLI 生命周期的一组修复与回归测试：

- [#6275：进程树所有权与 deadline](https://github.com/multica-ai/multica/pull/6275)
- [#6276：以完整结果作为一次性命令的边界](https://github.com/multica-ai/multica/pull/6276)
- [#6320：让 `ErrWaitDelay` 回归测试保持确定性](https://github.com/multica-ai/multica/pull/6320)

### 延伸阅读

- [Go `os/exec` documentation](https://pkg.go.dev/os/exec)
- [Go issue #23019: process and pipe waiting behavior](https://github.com/golang/go/issues/23019)
