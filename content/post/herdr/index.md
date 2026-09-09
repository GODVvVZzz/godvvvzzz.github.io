---
title: "herdr：给编码 Agent 用的终端运行时"
description: "herdr 是 Rust 写的终端多路复用器，不替换你的终端，而是接管 Agent 跑在里面的 pane——detach 仍在跑、多机一窗、状态一眼可见。"
slug: herdr
date: 2026-09-09T20:11:00+08:00
lastmod: 2026-09-09T20:11:00+08:00
categories:
    - 开源仓库
tags:
    - AI Coding
    - Agent
    - Terminal
    - Rust
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/herdrdev/herdr](https://github.com/herdrdev/herdr) · **站点**：[herdr.dev](https://herdr.dev) · **许可**：Apache-2.0

## 它是什么

herdr 官方定位是 **the runtime your coding agents live on**。它不是又一个终端模拟器，而是一层 Agent 会话运行时：

- 你继续用现有终端（iTerm、Ghostty、Windows Terminal…）
- herdr 在后台起一个 server，所有 Agent pane 挂在上面
- 关掉客户端、断 SSH，Agent 还在跑；`ctrl+b q` detach，`herdr` reattach

Rust 单二进制，无 Electron，约 10MB 量级。

## 核心能力

**Detach 不停工**。后台服务托管终端；机器或 server 重启后能恢复保存的布局，受支持的 Agent 会话可 resume（原进程本身不跨重启存活）。

**多机一窗**。本地工作区和已保存的 SSH 机器合在一个窗口，Agent 列表统一，各自可独立重连。

**状态感知**。每个 pane 标记 working / blocked / idle；Agent 停下来等人回答时，herdr 会明确告诉你，不用一个个窗口翻。

**Agent-native**。Agent 可以通过 CLI 和 Socket API 驱动 herdr：spawn pane、互相 prompt、等另一个 Agent 真的 blocked。这是「Agent 编排 Agent」的基础设施位。

**原样运行现有 Agent**。Claude Code、Codex、Cursor、OpenCode、Grok 等——不包装、不替换，只接管它们的终端。

**键盘鼠标双一等公民**。tmux 风格 prefix，也支持点击、拖拽、分屏；按场景选，不绑死工具。

**插件市场**。可扩展 pane 与工作流；[Plannotator 的 Herdr Annotate](https://github.com/plannotator/herdr-annotate) 就是典型插件——在终端里做 Markdown/回复标注并回传 Agent。

## 上手

```bash
curl -fsSL https://herdr.dev/install.sh | sh
# 或 brew install herdr

herdr   # 在工作目录启动
# 跑 Agent、分屏、走开；ctrl+b q detach，herdr reattach
```

完整文档：[herdr.dev/docs](https://herdr.dev/docs/)

## 适合谁

- 同时开多个编码 Agent，需要知道「哪个在等你」
- SSH 远程跑 Agent、笔记本合盖后继续干活
- 希望 Agent 之间能通过 socket/CLI 互相协作
- 偏好纯终端、不想再换一个 Electron 桌面壳

## 和收藏夹里其他项目的关系

- 在 herdr 里做 plan/diff 标注 → [Plannotator](/p/plannotator/)（herdr-annotate 插件）
- 想要看板/Issue 派工而不是终端 pane → [Multica](/p/multica/)
- 想在图形桌面里跑多 Harness → [CodexHost](/p/codex-host/)
- 常跑的那个 Agent 本体可能是 → [Pi](/p/pi/)

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
