---
title: "Pi：可自我扩展的 AI 编码 Agent 工具包"
description: "earendil-works/pi 把多模型 API、Agent 循环、终端 UI 和编码 CLI 拆成可复用包，是当前社区最活跃的开源编码 Agent 之一。"
slug: pi
date: 2026-09-09T20:10:00+08:00
lastmod: 2026-09-09T20:10:00+08:00
categories:
    - 开源仓库
tags:
    - AI Coding
    - Agent
    - Harness
    - TypeScript
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/earendil-works/pi](https://github.com/earendil-works/pi) · **站点**：[pi.dev](https://pi.dev) · **许可**：MIT

## 它是什么

Pi 是一个开源 AI Agent 工具包，核心交付物是「可自我扩展的编码 Agent」。它不是单一 CLI，而是一组分层清晰的包：

| 包 | 职责 |
|----|------|
| `@earendil-works/pi-ai` | 统一多 provider LLM API（OpenAI / Anthropic / Google…） |
| `@earendil-works/pi-agent-core` | Agent 运行时：工具调用、状态管理 |
| `@earendil-works/pi-coding-agent` | 交互式编码 Agent CLI |
| `@earendil-works/pi-tui` | 差分渲染的终端 UI 库 |
| `@earendil-works/chord` | 应用组装运行时：服务、复制状态、RPC、插件 |

社区里常见的 `pi-mono` 指的就是这套 monorepo；官方现在以 `earendil-works/pi` 为主仓库。

## 为什么值得看

**分层可复用**。很多编码 Agent 把「模型接入 + 循环 + TUI + 产品逻辑」揉在一起。Pi 把这些拆开：你可以只用 `pi-ai` 做多模型统一调用，也可以嵌 `pi-agent-core` 自己包一层产品，或者直接用完整 CLI。

**生态被广泛对接**。Multica 把它列为一等 runtime；Plannotator 有官方 `pi-extension`；CodexHost 用 Pi 官方 RPC 接入。当多个基础设施项目都选择「原生适配」而不是「ACP 削平」时，说明它的协议边界设计得比较干净。

**供应链认真**。直接依赖锁死精确版本、`save-exact` + `min-release-age`、CLI 包发布 shrinkwrap、安装默认 `--ignore-scripts`、定时 `npm audit`。在 Agent 工具链里这种严谨度不多见。

## 权限与边界

Pi **不内置**文件系统 / 进程 / 网络 / 凭证权限系统，默认以启动它的用户权限运行。需要更强边界时官方给了三条路：

1. **Gondolin 扩展**：`pi` 和 provider 认证留在 host，内置工具与 `!` 命令路由进本地 Linux micro-VM
2. **纯 Docker**：整个 `pi` 进程跑在本地容器
3. **OpenShell**：策略控制的沙箱里跑

选型时要把「默认全权 + 外置沙箱」和 Claude Code 内置审批模式对比清楚。

## 上手

```bash
npm install -g @earendil-works/pi-coding-agent
# 或按官方文档用独立二进制
```

文档在 [pi.dev/docs](https://pi.dev/docs/latest)，也支持直接问 Agent 自己「你怎么工作」。

## 和收藏夹里其他项目的关系

- 想给 Pi 加计划/代码评审 → [Plannotator](/p/plannotator/)
- 想多 Agent 并行、会话持久化 → [herdr](/p/herdr/)
- 想在 Codex Desktop 里跑 Pi → [CodexHost](/p/codex-host/)
- 想把 Pi 当队友派 Issue → [Multica](/p/multica/)
- 想给 Pi 加长期记忆 → [OpenViking](/p/openviking/)

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
