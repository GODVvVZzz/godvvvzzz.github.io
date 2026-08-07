---
title: "开源仓库收藏夹"
description: "持续更新的开源仓库收藏，按分类记录好用的开源项目：简介、亮点、使用场景"
slug: awesome-open-source-repos
date: 2026-07-30T00:00:00+08:00
comments: true
categories:
    - 资源收藏
tags:
    - 开源
    - 收藏夹
    - 工具
    - 持续更新
---

> 这是一篇持续更新的开源仓库收藏夹。每次发现好用的开源项目，会按分类追加记录到这里。
>
> 每条记录包含：仓库链接、一句话简介、核心亮点、适用场景。

## 前端

<!-- 示例格式，后续追加按此模板：
### [仓库名](仓库链接)
- **简介**：一句话说明它是什么
- **亮点**：核心特性 / 解决了什么问题
- **场景**：什么情况下适合用
-->

*（暂无记录，待收录）*

## 后端

*（暂无记录，待收录）*

## 工具与效率

### [Kaneo](https://github.com/usekaneo/kaneo)
- **简介**：开源、自托管的极简项目管理平台（MIT License），slogan 是 "All you need. Nothing you don't."——只保留真正有用的功能，砍掉花哨的「dashboard theater」，定位是 Jira/Trello/Linear 的极简开源替代品。
- **亮点**：看板 + 列表双视图同一数据源（状态/优先级/标签同步）；原生 GitHub Issues 集成；Docker/drim CLI/Helm Chart 多种自托管部署方式，数据完全自有；内置 MCP Server（`/api/mcp` 端点 + npm `@kaneo/mcp` 包），Claude/Cursor 等 AI 工具可直接管理任务、项目、标签；隐私优先，极简分析透明架构；同时提供 Cloud 托管版。
- **场景**：受不了 Jira/Linear 臃肿、想要「极简但够用」项目管理工具的团队；需要自托管、数据完全自控；想用 AI 直接管理项目任务（通过 MCP）；个人或小团队做轻量任务追踪。

## DevOps 与部署

*（暂无记录，待收录）*

## AI 与大模型

### [Yoda](https://github.com/lovstudio/yoda)
- **简介**：把 Claude Code、Codex、Gemini 等 31 种编码 agent 客户端收进同一个工作区的桌面应用，本质是 agent 与真实世界之间的"harness"层（进程、会话、Skills、Hooks、Memory、上下文）。
- **亮点**：统一编排多客户端，按任务挑选、并行开工、互相 review；Linear/GitHub/Jira 工单直接进会话，CI/CD 状态挨着 diff；支持主分支直跑（快）和 worktree 隔离（稳）两种模式；把 Skills/Hooks/Memory/上下文完整摊开可查可覆写，agent 不再是黑盒。
- **场景**：同时用多个 AI coding agent、想做对比或互相 review、需要管理 agent 的 Skills/Memory 行为、希望工单与代码改动联动的开发者。

### [cmux](https://github.com/manaflow-ai/cmux)
- **简介**：专为 AI Coding Agent 设计的开源原生 macOS 终端，基于 libghostty 渲染、Swift/AppKit 构建，通过垂直标签页聚合 Git 分支、PR 状态、端口和 Agent 通知。
- **亮点**：智能通知环系统（Agent 卡住时面板亮蓝色光环 + 侧边栏高亮 + 桌面通知）；内置可编程浏览器（Agent 可直接操作本地服务，抓无障碍树/点击/填表/跑 JS）；一键 Claude Code Teams 多 Agent 分屏并行；CLI + Unix Socket API 支持自动化编排；SSH 远程工作区；会话恢复。
- **场景**：同时跑多个 Claude Code/Codex 会话、需要精准知道哪个 Agent 待确认、想让 Agent 直接验证 web 改动的 macOS 开发者。

### [herdr](https://github.com/ogulcancelik/herdr)
- **简介**：终端原生的 AI 编码 Agent 多路复用器，用 Rust 写成单个二进制，跑在你现有终端里（不替换终端），为多 Agent 并行场景设计。
- **亮点**：Agent 状态感知（blocked/working/done/idle 四色信号，侧边栏按 workspace 汇总）；workspace/tab/pane 三层组织；detach/reattach 持久化（关掉笔记本 Agent 继续跑，可从手机/SSH 重连）；Socket API + CLI 让 Agent 也能编排 Agent；跨平台（macOS/Linux/Windows）；~10MB 单二进制无 Electron。
- **场景**：多 Agent 并行开发、SSH 远程跑 Agent、需要会话持久化和跨设备重连、偏好纯终端工作流的开发者。

### [qm](https://github.com/yc-software/qm)
- **简介**：面向团队/公司的 multiplayer agent harness，在 Slack 和 Web 上运行。每个员工有独立隔离的工作区，又能在频道、群消息、项目里与 agent 协作，定位是创业公司的共享 AI 工作助手。
- **亮点**：个人与共享双层 scope（每人/每房间独立 memory、文件、keychain、权限、crons、web apps、沙箱）；Slack 与 Web 同一身份贯通；管理员可控 org 级配置和安全策略；支持 Pi/OpenCode/Codex/Claude Code 多种 harness 与模型切换，不绑单一厂商；Skills 按作用域拥有、可授权共享、支持从 git 仓库导入 skill packs；三档安全策略（Strict/Auto/Dangerous）+ 预声明命令策略防破坏性操作；部署在自己云账户，核心与定制分离便于上游同步。
- **场景**：想给整个团队部署共享 AI 助手、希望员工既独立又协作使用 agent、需要 org 级安全管控和审计、想用 Slack 作为 agent 入口的创业公司或团队。

### [AionUi](https://github.com/iOfficeAI/AionUi)
- **简介**：免费开源的 AI Agent 协作桌面应用（Apache-2.0），把散落在终端里的命令行 AI 工具（CLI Agent）统一收纳到一个图形界面里，定位是「AI Cowork 协同办公平台」。
- **亮点**：内置 Agent 引擎零配置开箱即用（粘贴任意 API Key 即可干活）；自动检测本机 Claude Code/Codex/Qwen Code/Gemini CLI 等 18+ CLI Agent 并统一界面并行协作；21 个专业助手（PPT/Word/Excel/论文/UI/数据看板）即点即用；Team Mode 多 Agent 分工；支持 30+ 模型平台；WebUI + Telegram/飞书/钉钉/微信 远程访问；Cron 定时任务 7×24 无人值守；10+ 格式即时预览编辑；数据本地 SQLite 存储安全可控。
- **场景**：重度使用多个 Code Agent 想统一管理、想让多个 AI 协作而非轮流问、需要定时自动化和远程访问、偏好图形界面而非终端的用户。

## AI 自驱开发

> 这类工具能独立走完「软件开发闭环」：接收 Issue → 理解代码库 → 改代码 → 跑测试 → 开 PR → 处理反馈。区别于 Copilot/Cursor 这类「人主导、AI 辅助」的编程助手，自驱机器人是「AI 主导、人类兜底」。

### [Qwen Code](https://github.com/QwenLM/qwen-code)
- **简介**：千问官方开源的编程 agent，配合 GitHub Actions 和定时工作流，能自动拉取 Issue、打标签、修复、开 PR、跑测试，甚至迭代自己的代码——一个「AI 自己养活的仓库」。
- **亮点**：自驱闭环示范（Issue 自动触发 → 完成 → 开 PR）；scheduled autofix 定时扫描待办；靠成熟开源框架拼装，可接入千问/DeepSeek 等模型；PR 列表里混着「AI 为自己写的代码」。
- **场景**：想复刻「AI 自动维护开源项目」流程、让仓库自我迭代的参考实现。

### [OpenHands](https://github.com/OpenHands/OpenHands)
- **简介**：最接近「全家桶」的自驱开发平台（原名 OpenDevin，70k+ stars），能写代码、跑 shell、浏览网页、操作浏览器、开 PR，任务跑在 Docker 沙箱里。
- **亮点**：Agent Canvas 控制台 + SDK + CLI + Web UI；支持多 Agent 协作；模型随便换；可连接本地/Docker/VM/云多种 backend；Slack/GitHub/Linear 自动化集成；配置 GitHub 集成即变成「Issue 自动触发 → 完成 → 开 PR」的无人值守流水线。
- **场景**：想要完整平台型方案、需要 Web UI 和多 backend、想把 agent 接入 Slack/GitHub 自动化的团队和个人。

### [SWE-agent](https://github.com/SWE-agent/SWE-agent)
- **简介**：普林斯顿团队出品的专精选手，只做一件事——真实 GitHub Issue 的端到端自动解决，SWE-bench 开源项目 SoTA。
- **亮点**：专为 LLM 设计的 Agent-Computer Interface（文件浏览/编辑/搜索/测试工具接口，比裸 shell 更适合大模型操作）；输入 Issue URL 自动 clone/定位/修改/跑测试/输出 patch 或开 PR；官方推荐更轻量的 mini-SWE-agent（100 行 Python 达到 65% SWE-bench verified）。
- **场景**：想快速复现「Issue → 修复 → patch」、做学术研究、需要专精型而非全家桶方案的开发者。

### [Aider](https://github.com/Aider-AI/aider)
- **简介**：终端里的 AI 结对编程工具，Git-native——每次改动自动 commit，适合当自动化流程的底层引擎。
- **亮点**：支持云端和本地 LLM；与 Git 深度集成（改动自动提交、可随时回滚）；可操作本地代码库、运行命令、跑测试；OpenRouter Top 20、周处理 15B tokens；新版本 88% 代码由 Aider 自己写（自我迭代示范）。
- **场景**：喜欢终端交互、想把 AI 当底层引擎嵌入自动化流程、需要 Git 原生体验的开发者。

### [Autonomous Dev Team](https://github.com/zxkane/autonomous-dev-team)
- **简介**：全自动流水线型方案，多 Agent 协作（调度 + 开发 + 审查），打标签的 Issue 自动一路走到合并 PR。
- **亮点**：多 Agent 分工（规划/编码/测试/审查）；Git Worktree 隔离支持并行；完整流水线从 Issue 到合并 PR；GitHub Action 驱动。
- **场景**：想要「Issue → 自动合并」的全自动流水线、希望多 Agent 分工产出高质量 PR 的团队。

### [issue-agent](https://github.com/clover0/issue-agent)
- **简介**：轻量实用的 Issue 自动解决工具，支持 CLI 与 GitHub Action 两种形态。
- **亮点**：轻量易上手；Issue 自动解决 + 开 PR；CLI 与 GitHub Action 双模式。
- **场景**：想快速给现有仓库挂一个「Issue 自动修复」机器人、不想上重型平台的开发者。

### [Phoenix](https://github.com/kkipngenokoech/phoenix)
- **简介**：多 Agent 全自动流水线（规划、复现、编码、测试、PR），带安全检查与 webhook 状态机，学术 + 工程结合。
- **亮点**：多 Agent 覆盖完整闭环；内置安全检查；webhook 状态机驱动流程。
- **场景**：研究多 Agent 自驱流水线设计、需要安全检查机制的开发者。

### [Sweep AI](https://github.com/sweepai/sweep)
- **简介**：早期「Issue → PR」开拓者，社区仍在维护。
- **亮点**：最早一批做 Issue 到 PR 自动化的方案；社区持续维护。
- **场景**：了解 Issue → PR 自动化演进历史、评估早期方案设计的参考。

### [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent)
- **简介**：千问官方 Agent 框架，支持工具调用、MCP、RAG、代码解释器，是造轮子的积木。
- **亮点**：官方维护，与千问模型深度适配；工具调用/MCP/RAG/代码解释器齐全；再包一层「GitHub Issue 拉取 + 自动执行」即可复刻 Qwen Code。
- **场景**：想自己造自驱开发轮子、需要 Agent 框架做底座、用千问模型的开发者。

## 学习资源

*（暂无记录，待收录）*

## 其他

*（暂无记录，待收录）*

---

> **收录标准**：实际用过觉得好用，或设计思路值得学习的开源项目。
>
> 最后更新：2026-08-07
