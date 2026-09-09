---
title: "Multica：让人和 AI Agent 当队友的工作区"
description: "Multica 是可自托管的开源工作区：给 Agent 派 Issue，它自己接活、汇报、求助，结果交回给人 review。支持 26 种 Agent CLI。"
slug: multica
date: 2026-09-09T20:14:00+08:00
lastmod: 2026-09-09T20:14:00+08:00
categories:
    - 开源仓库
tags:
    - AI Coding
    - Agent
    - Self-hosted
    - Workspace
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/multica-ai/multica](https://github.com/multica-ai/multica) · **站点**：[multica.ai](https://multica.ai) · **许可**：Apache-2.0 附加条件（见 LICENSE）

## 它是什么

Multica 的 slogan 是 **Agents that show up on the board**。

你已经同时在跑 Claude Code、Codex 和另外三个 Agent；每个住在自己的终端 tab 里，会话结束就失忆，同一天要你重复讲第四遍上下文。Agent 越多，你的时间越多花在「看着它们」。

Multica 把 Agent 和人类队友放进同一个工作区：

1. 给 Agent 派一个 Issue（像派给同事）
2. Agent 自己接活，在你控制的 runtime 上跑
3. 过程中评论、求助、汇报
4. 结果进 review，人拍板才合并

意图、运行、决策、diff 都挂在同一个 Issue 上——不用重建上下文，也没有人说「OK」就不进 main。

## 关键能力

**26 种 Agent CLI**。Claude Code、Codex、Cursor、Copilot、Kimi、OpenCode、Pi、Qwen Code、DeepSeek Harness… 换 provider 是下拉框，不是迁移。Multica **不带模型**，驱动你已装好并登录的 CLI。

**Agent 即队友**。每个 Agent 有名字、provider、runtime，像同事一样上板；Squads 把人和 Agent 编队，leader 路由工作。

**你的机器当 runtime**。daemon 跑在你的笔记本或云主机上，代码不出去。

**过程可观测**。执行日志可回放每次工具调用、命令、错误；token 用量按 Agent / Issue 统计；失败可自动重试或停下说明原因。

**Review gate**。工作落进 review 而不是 main；Inbox 只在 Agent 需要你决策时才打扰。

**自托管**。Docker Compose 或 Helm；支持 GitHub / GitLab / Gitea / Forgejo；Slack、飞书、钉钉、企微、Telegram 触发；Web / 桌面 / iOS。

**Skills**。把解过的问题沉淀成每个 Agent 都能复用的 playbook。

## 架构速览

```text
Web / Desktop / iOS
        │
        ▼
  Next.js frontend ──► Go backend (Chi + WS) ──► PostgreSQL 17
                            │
                     WebSocket tasks
                            │
                     Agent daemon  ←── 你机器上的本地进程
                            │
              Claude Code · Codex · Cursor · Pi · …
```

## 上手

无需终端：注册 [multica.ai](https://multica.ai)，或下载 Desktop（会自动把本机注册为 runtime）。

自托管：

```bash
curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash -s -- --with-server
multica setup self-host
```

前提是跑 Agent 的机器上至少装好并登录一个受支持的 Agent CLI。

## 适合谁

- 已经被多个编码 Agent 的「babysitting 成本」淹没
- 想要 Issue → 自动执行 → 人审合并 的闭环，而不是聊天窗口
- 需要团队级权限、审计、自托管、多 Git host
- 想把踩过的坑做成 Skills 给所有 Agent 复用

## 和收藏夹里其他项目的关系

- 常被派活的 Agent → [Pi](/p/pi/)
- 本地多会话终端运行时 → [herdr](/p/herdr/)
- 本地会话的计划/代码评审 → [Plannotator](/p/plannotator/)
- 给 Agent 补长期记忆与知识 → [OpenViking](/p/openviking/)
- 想在 Codex Desktop 里操作多 Harness → [CodexHost](/p/codex-host/)

## 延伸阅读

Multica 的 Go 后端演进里有不少值得学的工程设计（不变量、边界、证据），本博客另有长文分析：从 Multica 的 Go 后端演进看高级工程设计。

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
