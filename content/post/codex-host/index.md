---
title: "CodexHost：在 Codex Desktop 里跑其他 Harness"
description: "CodexHost 用 CDP 增强官方 Codex Desktop，把 Pi、Claude Code 等原生接入，保留流式、Diff、审批等能力，而不是削平成 ACP。"
slug: codex-host
date: 2026-09-09T20:12:00+08:00
lastmod: 2026-09-09T20:12:00+08:00
categories:
    - 开源仓库
tags:
    - AI Coding
    - Agent
    - Harness
    - Desktop
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/BytePioneer-AI/codex-host](https://github.com/BytePioneer-AI/codex-host) · **许可**：MIT

## 它是什么

CodexHost 的出发点很直接：**Codex Desktop 的桌面交互很好，但 Codex 不是唯一优秀的 Harness**。

它让你在官方 Codex Desktop 窗口里选择真正执行任务的 Agent——Pi、Claude Code、OpenCode、Oh My Pi、Grok、DeepSeek Harness、Antigravity CLI 等——同时保留 Codex 的原生界面体验，并支持跨 Agent 委派协作。

## 设计上最值得学的一点

多数「多 Agent 客户端」走 ACP（Agent Client Protocol）快速接入，但工具状态、审批、权限、Diff、提问等原生能力会被削平。

CodexHost **故意不走这条路**：

| 层 | 做法 |
|----|------|
| Desktop | CDP / Electron Inspector 在官方 Codex Desktop 上增强，不重做聊天壳、不改官方安装包 |
| 协议 | CLI Shim 透明接入官方 app-server，Codex 请求原样转发 |
| Harness | 按各自原生接口：Pi 走官方 RPC，Claude Code 走 Agent SDK / CLI |
| 编排 | 委派时为目标 Harness 创建独立 Native Session，创建与结果观察分离 |

目标是**保真**，不只是「能聊」：流式、工具状态、可靠 Patch、原生审批和提问，尽量来自 Harness 自己。

## 主要能力

- 流式回复、工具状态、Edit Diff、提问/取消、Model/Thinking 选择、工具审批、Fork、上下文压缩、斜杠命令、修订上一条消息
- **跨 Agent 协作**：让 `claude-code` 独立审查、让 `pi` 排查偶发失败、让 `omp` 实现功能——各自独立 Thread
- **多账号与额度**：统一管理多个账号；macOS 菜单栏 / Windows 任务栏显示剩余配额
- **远程**：SSH 连接 Mac/Linux 远程节点上的 Harness；Windows 侧有实验性 Remote Control
- Mermaid 等图表可视化渲染

## 上手

```bash
npm install -g @codexhost/cli
codexhost
```

或从 [Releases](https://github.com/BytePioneer-AI/codex-host/releases) 下载安装包（macOS / Windows）。需要本机已装官方 Codex Desktop。

## 适合谁

- 喜欢 Codex Desktop 的交互，日常又在 Pi / Claude Code 等之间切换
- 想在一个窗口里让多个 Agent 分工协作
- 需要在本地桌面操作远程机器上的 Harness

## 和收藏夹里其他项目的关系

- 被接入的常见 Harness → [Pi](/p/pi/)
- 更偏终端 pane 运行时、而不是桌面壳 → [herdr](/p/herdr/)
- 想把 Agent 当队友派 Issue 而不是本地会话 → [Multica](/p/multica/)
- 接入后的 plan/diff 评审 → [Plannotator](/p/plannotator/)

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
