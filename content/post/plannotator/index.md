---
title: "Plannotator：编码 Agent 的计划与代码评审台"
description: "Plannotator 在本地浏览器里打开 plan、文档和 diff，让你可视化标注后把反馈一键送回 Claude Code、Codex、Pi 等 Agent。"
slug: plannotator
date: 2026-09-09T20:13:00+08:00
lastmod: 2026-09-09T20:13:00+08:00
categories:
    - 开源仓库
tags:
    - AI Coding
    - Agent
    - Code Review
    - Plan Mode
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**仓库**：[github.com/backnotprop/plannotator](https://github.com/backnotprop/plannotator) · **站点**：[plannotator.ai](https://plannotator.ai) · **许可**：Apache-2.0 / MIT 双许可

## 它是什么

Plannotator 是一个**本地、浏览器里的 Agent 评审界面**。它通过各 harness 的 hooks 和 slash 命令直接接入：

- Agent 提出 plan、或写完代码时，工作自动在浏览器打开
- 你做可视化标注、批注、建议修改
- 反馈结构化送回 Agent，它照着改

覆盖三大场景：**Markdown/计划评审**、**代码 diff 评审**、**HTML 产物标注**。

## 支持的 Agent

Claude Code、Codex、Copilot CLI、Gemini CLI、OpenCode、Kiro、Droid、Amp、**Pi**。

安装器会自动检测已装 Agent 并配置 hooks、skills、slash 命令。也可以 `--minimal` 只装二进制。

## 核心流程

**Plan review（无需命令）**

```text
Agent 调用 ExitPlanMode
  → PermissionRequest hook
  → 本地 server 读 plan
  → 浏览器打开评审 UI
  → 你标注并 approve / deny
  → Approve：继续执行
  → Deny：结构化反馈给 Agent
```

**Code review**

```text
/plannotator-review
  → git diff（或按 URL 拉 PR/MR）
  → 浏览器 diff 视图
  → 标注、stage/unstage
  → 反馈回 Agent；LGTM 即通过
```

支持 Git、GitButler、Jujutsu、Perforce，以及 GitHub PR / GitLab MR URL。

## 几个设计细节

**隐私默认本地**。不收集使用遥测；plan、diff、标注、历史默认留在本机。分享、Ask AI 等网络能力边界在文档里写得很清楚。

**终端版**。[Herdr Annotate](https://github.com/plannotator/herdr-annotate) 把同类评审带进终端，标注存同一数据目录，浏览器版与终端版可叠加。

**安全发布**。二进制带 SHA256 sidecar，有 SLSA provenance 与 CycloneDX SBOM attestation，可选安装时校验。

**Obsidian / VS Code 集成**。已批准的 plan 可自动存进 vault；VS Code 可在编辑器里看 diff 和标注。

## 上手

```bash
# macOS / Linux / WSL
curl -fsSL https://plannotator.ai/install.sh | bash
```

然后在 Agent 里：

```text
/plannotator-last          # 标注 Agent 上一条回复
/plannotator-review        # 审当前 diff
/plannotator-annotate README.md
```

Plan mode 不需要命令——下次 Agent 提 plan 会自动打开。

Pi 用户也可以跳过安装器：`pi install npm:@plannotator/pi-extension`。

## 适合谁

- 不想在终端里干瞪纯文本 plan，希望「看图说话」再放行
- 需要 PR 级 diff 评审，且意见要直接喂回当前 Agent 会话
- 团队想把 plan 决策归档、可回溯

## 和收藏夹里其他项目的关系

- 在终端里同样评审 → [herdr](/p/herdr/) + herdr-annotate
- 被评审的 Agent 常是 → [Pi](/p/pi/) / Claude Code / Codex
- 想把评审放进更大工作流（Issue→Agent→Review）→ [Multica](/p/multica/)

---

*最后更新：2026-09-09。信息基于公开 README 与仓库状态，使用前请以官方文档为准。*
