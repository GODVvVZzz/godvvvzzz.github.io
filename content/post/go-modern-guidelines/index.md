---
title: "go-modern-guidelines：教 AI Agent 写现代 Go"
description: "JetBrains 官方的 Agent 指南：显式引用 Go 1.0–1.27 现代惯用法，对抗训练数据滞后与频率偏置，让编码 Agent 一上来就写新写法。"
slug: go-modern-guidelines
date: 2026-09-09T20:30:00+08:00
lastmod: 2026-09-09T20:30:00+08:00
categories:
    - 开源仓库
tags:
    - Agent Skill
    - Go
    - AI Coding
    - Guidelines
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/JetBrains/go-modern-guidelines](https://github.com/JetBrains/go-modern-guidelines) · **许可**：Apache-2.0 · **来源**：JetBrains 官方项目

## 它是什么

给**编码 Agent** 用的现代 Go 写法指南。装上之后，Agent 会：

- 用 `max(a, b)` 而不是 if-else 取大
- 用 `slices.Contains` 而不是手写循环
- 用 `cmp.Or(a, b, c)` 而不是一串 nil 检查
- 知道 `new(42)` 取值指针、`errors.AsType[T](err)` 类型安全错误匹配（Go 1.26）

覆盖 **Go 1.0 → 1.27** 最有用的特性，包括 Go 官方 `modernize` analyzer 的全部目标。完整清单在 [FEATURES.md](https://github.com/JetBrains/go-modern-guidelines/blob/main/FEATURES.md)。

Agent 行为约定：

1. 从 `go.mod` **检测项目 Go 版本**
2. 只用 ≤ 该版本的语言/标准库特性
3. **优先现代惯用法**，而不是老写法

## 动机写得很准

Agent 生成「过时 Go」几乎必然，原因只有两个：

| 问题 | 含义 |
|------|------|
| **训练数据滞后** | 训练截止后加的 API（如 `errors.AsType[T]`）模型根本没见过 |
| **频率偏置** | 见过也不一定用：语料里 `for i := 0; i < n; i++` 远多于 `for i := range n` |

指南的解法很直接：**给 Agent 一份显式参考**，而不是指望模型「自己想起来」。

这也和 Go 团队方向对齐：`modernize` 负责把旧代码改新，这份指南负责让**新代码一开始就新**。

## 形态：小 CLI + 多端插件

不是纯 Markdown 甩给模型——各 market 集成会在首次使用时 `go install` 一个小 CLI，装进本地缓存（如 `~/.cache/go-modern-guidelines`），**不改动你的项目**。

要求：PATH 上有 Go toolchain，目标 **Go 1.25+**；更旧版本在 `GOTOOLCHAIN=auto`（默认）下也能拉兼容 toolchain。

支持面：

| 客户端 | 方式 |
|--------|------|
| Junie | `/extensions marketplace add JetBrains/go-modern-guidelines` |
| Claude Code | `/plugin marketplace add` + `modern-go-guidelines@goland-claude-marketplace` |
| Codex | `codex plugin marketplace add` + `goland-codex-marketplace` |
| Cursor | `cursor-agent plugin marketplace add …` |
| 其他（OpenCode 等） | `npx skills add JetBrains/go-modern-guidelines` |

Claude Code 装完后 Go 任务会**自动触发**；也可显式 `/modern-go-guidelines:use-modern-go`。

## 值得学的两个工程细节

**1. 按 `go.mod` 探测版本**  
避免 Agent 在 Go 1.21 项目里写出 1.26 才有的 API——这是「知识」和「项目约束」分开的干净做法。

**2. 构建脚本与 Agent 隔离**  
`scripts/dev-install.sh` 故意和面向 Agent 的 wrapper 分开：**Agent 永远不能触发本地构建**。本地调试靠 `make dev-install` + `GO_MODERN_GUIDELINES_DEV=1`，与 Claude Code / Codex / Cursor 走同一套缓存路径。

## 上手（Claude Code 示例）

```text
/plugin marketplace add JetBrains/go-modern-guidelines
/plugin install modern-go-guidelines@goland-claude-marketplace
```

其他客户端安装与更新见 [仓库 README](https://github.com/JetBrains/go-modern-guidelines#instructions)。

## 适合谁

- 用 Agent 写 Go，不想再 review「上古写法」
- 团队想统一「新项目直接用新惯用法」，而不是事后 `modernize` 改
- 在做 **language-specific Agent guideline** 时，可当范本看：动机、版本门控、多端分发、CLI 与 agent 隔离

## 和收藏夹里其他项目的关系

- 同为「给 Agent 的技能/指南」→ [pptx-generator](/p/pptx-generator/)（产物向）vs 本文（语言向）
- 跑在各种 Harness 里 → [Pi](/p/pi/)、Claude Code、Codex 等
- 指南/技能沉淀与检索 → [OpenViking](/p/openviking/)

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
