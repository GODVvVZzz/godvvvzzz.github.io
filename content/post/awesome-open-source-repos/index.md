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

*（暂无记录，待收录）*

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

## 学习资源

*（暂无记录，待收录）*

## 其他

*（暂无记录，待收录）*

---

> **收录标准**：实际用过觉得好用，或设计思路值得学习的开源项目。
>
> 最后更新：2026-08-04
