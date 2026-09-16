---
title: "pptx-generator：给编码 Agent 用的 PPT 生成技能"
description: "MiniMax-AI/skills 里的 pptx-generator：用 PptxGenJS 从零做 PPT、XML 编辑模板、markitdown 读内容，附完整设计系统与五类页面规范。"
slug: pptx-generator
date: 2026-09-09T20:20:00+08:00
lastmod: 2026-09-09T20:20:00+08:00
categories:
    - 开源仓库
tags:
    - Agent Skill
    - AI Coding
    - PPT
    - Productivity
comments: true
---

> 收录于：[开源仓库收藏夹](/p/awesome-open-source-repos/)

**技能路径**：[MiniMax-AI/skills · pptx-generator](https://github.com/MiniMax-AI/skills/tree/main/skills/pptx-generator)  
**所在仓库**：[MiniMax-AI/skills](https://github.com/MiniMax-AI/skills) · **许可**：MIT

## 它是什么

`pptx-generator` 是 MiniMax 官方 skills 集合里的一项 **Agent Skill**，覆盖 PowerPoint 全流程：

| 任务 | 做法 |
|------|------|
| 读 / 分析现有 PPT | `python -m markitdown presentation.pptx` |
| 基于模板编辑 | XML 工作流（见 `references/editing.md`） |
| 从零创建 | **PptxGenJS**，按页面类型生成 slide 模块再编译 |

它不是「让模型随便画几页」，而是一套**有约束的生成规范**：设计系统、五类页面、主题契约、页码规则、QA 流程都写死在 skill 里。

## 为什么值得看

### 1. 五类页面 + 视觉多样性

所有 slide 必须归入五种类型之一：

1. **Cover** 封面  
2. **TOC** 目录  
3. **Section Divider** 分节页  
4. **Content** 内容页  
5. **Summary** 总结页  

并明确要求：**不要连续多页用同一 layout**——避免 Agent 生成「十页长得一样」的 PPT。

### 2. Theme 对象契约（强制）

编译脚本向每页传入固定五色主题：

| Key | 用途 |
|-----|------|
| `primary` | 最深色，标题 |
| `secondary` | 深色强调、正文 |
| `accent` | 中间调强调 |
| `light` | 浅色强调 |
| `bg` | 背景 |

**禁止**自创 `background` / `text` / `muted` 等 key。Agent 被死死绑在统一主题模型上，多页并行生成时才不会各画各的。

### 3. 一页一文件，可并行

每页是独立可运行的 JS：

```javascript
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  // ...使用 theme.primary / theme.bg 等
  return slide;
}
module.exports = { createSlide, slideConfig };
```

- 函数**必须同步**（不能 async）
- 文件可单独 `node slide-01.js` 预览
- 有 subagent 时最多 5 页并发生成
- 最后 `compile.js` 统一写入 `output/presentation.pptx`

这是「结构化输出 + 模块化并行」在文档生成上的干净落地。

### 4. 设计系统不是空话

`references/` 里拆得很细：

| 文件 | 内容 |
|------|------|
| `slide-types.md` | 五类页面 + 额外 layout 模式 |
| `design-system.md` | 色板、字体、Sharp/Soft/Rounded/Pill 风格配方、排版间距 |
| `editing.md` | 模板编辑、XML、常见坑 |
| `pitfalls.md` | QA 流程、PptxGenJS 陷阱 |
| `pptxgenjs.md` | 完整 API 参考 |

中文固定 **Microsoft YaHei**，英文默认 Arial；16:9（10" × 5.625"）；页码徽章除封面外必有，且只显示当前页码（不是 `3/12`）。

### 5. 和「只会改 Markdown 的 Skill」不同

多数 Agent Skill 只动文本。这个 skill 管的是**二进制办公文档**：生成、改、读，还带 QA 门槛。属于 productivity 类 skill 里工程化程度较高的样本。

## 上手（Claude Code）

```bash
claude plugin marketplace add https://github.com/MiniMax-AI/skills
claude plugin install minimax-skills
```

依赖：

```bash
pip install "markitdown[pptx]"   # 读 PPT
npm install -g pptxgenjs         # 从零创建
```

Cursor / Codex / OpenCode 的安装方式见 [仓库 README](https://github.com/MiniMax-AI/skills#installation)。

触发词：PPT、PPTX、PowerPoint、presentation、slide、deck。

## 同仓库其他技能（顺带一提）

MiniMax skills 里还有同一思路的办公套件：`minimax-pdf`、`minimax-xlsx`、`minimax-docx`，以及前端/全端/移动端/shader 等开发技能。如果你要做「Agent 生成 Office 全家桶」，可以整包接入再按需挑。

## 适合谁

- 想让 Claude Code / Codex 直接产出**结构稳定、风格统一**的 PPT，而不是随机排版
- 需要「模板编辑 + 从零生成 + 读回分析」三条链路
- 在研究 Agent Skill 怎么管二进制产物、怎么做多页并行、怎么定 theme 契约

## 和收藏夹里其他项目的关系

- Skill 被 Multica 等平台当作可复用剧本 → [Multica](/p/multica/)
- 运行这些 Skill 的编码 Agent → [Pi](/p/pi/)、Claude Code 等
- Skill 本体的知识/记忆沉淀 → [OpenViking](/p/openviking/)

---

*最后更新：2026-09-09。信息基于公开 SKILL.md 与仓库 README，使用前请以官方为准。*
