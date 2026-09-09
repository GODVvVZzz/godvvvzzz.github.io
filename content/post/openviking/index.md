---
title: "OpenViking：AI Agent 的上下文数据库"
description: "OpenViking 把记忆、知识资源和 Skills 统一成 viking:// 虚拟文件系统，三层按需加载，检索轨迹可观察。火山引擎开源。"
slug: openviking
date: 2026-09-09T20:15:00+08:00
lastmod: 2026-09-09T20:15:00+08:00
categories:
    - 开源仓库
tags:
    - AI Coding
    - Agent
    - Memory
    - RAG
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/volcengine/OpenViking](https://github.com/volcengine/OpenViking) · **站点**：[openviking.ai](https://openviking.ai) · **许可**：主项目 AGPL-3.0（CLI / examples 为 Apache-2.0）

## 它是什么

OpenViking 是火山引擎开源的 **AI Agent 上下文数据库**（Context Database）。

它把三类东西统一进一个 `viking://` 虚拟文件系统：

- **Memories**：用户偏好、会话沉淀
- **Resources**：项目文档、仓库、网页等知识
- **Skills**：可复用技能

Agent 用 `ls` / `tree` / `find` **像开发者翻目录一样**定位上下文，而不是对黑盒向量库发一句 query、拿回一个莫名其妙的片段。

## 设计上最有意思的几点

**三层内容抽象**。写入时就拆好：

| 层 | 内容 | 量级 |
|----|------|------|
| L0 Abstract | 一句话摘要，快速判相关 | ~100 tokens |
| L1 Overview | 核心信息与使用场景 | ~2k tokens |
| L2 Details | 全文，按需读 | 原始数据 |

目录自己也带 L0/L1，可以先判「这个目录相关吗」再决定下不下去——直接砍 token。

**目录递归检索**。向量搜索先定位最高分目录，再逐层下钻，结果保留周边上下文。

**检索可观察**。每次查询留下「目录浏览轨迹」。结果不对时，你能看到是哪条路径出来的，而不是只能耸耸肩。

**会话变记忆**。session commit 后异步抽取用户偏好与 Agent 经验进长期记忆。

**官方集成面广**。Claude Code、Codex、OpenClaw、Hermes、Cursor、OpenCode、**pi**、MCP clients、LangChain/LangGraph 等。

**开源版不阉割**。无功能开关、无需账号激活；商业版答的是「谁运维、跑在哪」，不是「能不能用」。

## 官方 benchmark 摘要

在 LoCoMo（长对话用户记忆）和 tau2-bench（多轮 Agent 任务）上：

- 接上 OpenViking 后，多个 Agent 集成记忆准确率从原生 24–57% 拉到 **80–83%**
- 输入 token 下降 34.3–91.0%，查询延迟下降约 58–66%
- 经验记忆在 tau2-bench 上带来零售 +6.87pp、航空 +11.87pp 的任务成功率提升

（评测配置与复现脚本见仓库 `benchmark/` 与官方报告。）

## 上手

需要 Python 3.10+。

```bash
pip install openviking --upgrade
openviking-server init      # 交互配置 provider / 模型
openviking-server doctor
openviking-server

# 另一终端
ov status
ov add-resource https://github.com/volcengine/OpenViking
ov ls viking://resources/
ov find "what is openviking"
```

`init` 支持火山引擎、OpenAI、Codex OAuth、Kimi、GLM、本地 Ollama 等。

浏览器可先玩 [OpenViking Studio](https://openviking.ai/studio)，无需安装。

## 适合谁

- Agent 跨会话失忆，同一天重复解释上下文
- 知识库/项目文档希望 Agent **确定性浏览**而不是纯向量搜
- 需要可调试、可审计的检索轨迹
- 想把会话沉淀成可复用的长期记忆与 Skills

注意：主项目是 **AGPL-3.0**，对外提供服务前先看清传染范围。

## 和收藏夹里其他项目的关系

- 给 [Pi](/p/pi/)、Claude Code 等编码 Agent 补记忆
- 和 [Multica](/p/multica/) 的 Skills 体系可互补（Multica 管工作流剧本，OpenViking 管知识/记忆存储）
- [herdr](/p/herdr/) / [CodexHost](/p/codex-host/) 管「Agent 跑在哪」，OpenViking 管「Agent 记得什么」

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
