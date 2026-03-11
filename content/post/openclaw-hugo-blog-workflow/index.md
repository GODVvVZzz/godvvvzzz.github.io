---
title: "OpenClaw + Hugo + GitHub Actions：一套全自动的博客工作流"
description: "用 AI 写文章、自动发布到 GitHub Pages，零运维的博客搭建全流程"
slug: openclaw-hugo-blog-workflow
date: 2026-03-11T15:50:00+08:00
lastmod: 2026-03-11T16:39:00+08:00
comments: true
categories:
    - 技术笔记
tags:
    - openclaw
    - hugo
    - github
    - 自动化
    - 博客
comments: true
---

## 前言：为什么要这套方案？

写博客这件事，说简单也简单，说麻烦也麻烦。以前的流程是这样的：

> 打开编辑器 → 写 Markdown → 本地预览 → 手动部署 → 祈祷别出错

中间任何一个环节卡住，就可能放弃。

最近搭了一套新的工作流，核心就一句话：**用 AI 写，git push 后自动上线，零运维。**

本文会从头讲清楚这套方案是怎么跑起来的，包括：
- 用了哪些工具，各自做什么
- 如何一次搭建，终身使用
- 日常怎么写、怎么发
- OpenClaw 的 Skill 机制如何让整个流程自动化

---

## 一、整体思路：四个组件各司其职

这套方案由四个组件组成，每个组件只做一件事：

| 组件 | 角色 | 一句话解释 |
|------|------|-----------|
| **OpenClaw** | AI 助手 | 本地运行的 AI，能读写文件、执行命令、帮你写内容 |
| **Hugo** | 静态网站生成器 | 把 Markdown 文件转换成漂亮的静态网页 |
| **GitHub Actions** | 自动化 CI/CD | 代码推送后自动构建和部署网站 |
| **GitHub Pages** | 静态托管 | GitHub 免费提供的静态网页托管服务 |

**核心思想：你只管写，剩下的全自动。**

### 整体架构

```
OpenClaw (写内容)
    │
    ▼ git push
本地博客仓库 (Markdown)
    │
    ▼
GitHub (代码托管)
    │
    ▼ GitHub Actions (自动构建)
GitHub Pages (网站上线)
    │
    ▼
访问你的博客地址
```

数据流向：
1. 用 OpenClaw 写 Markdown 文章
2. `git push` 到 GitHub 仓库
3. GitHub Actions 自动构建 Hugo 站点
4. 自动部署到 GitHub Pages
5. 博客自动更新，无需人工干预

---

## 二、一次搭建：从零到上线

这部分只需要做一次，之后就是日常使用。

### Step 1：创建 GitHub 仓库

1. 登录 GitHub，创建一个新仓库
2. 仓库名建议：`username.github.io`（这样 GitHub Pages 会自动启用）
3. 选择 Public（私有仓库的 GitHub Pages 需要付费）

### Step 2：初始化 Hugo 博客

在本地安装 Hugo（Windows 示例）：

```bash
# 用 Scoop 安装
scoop install hugo-extended

# 或者用 Chocolatey
choco install hugo-extended
```

创建博客站点：

```bash
# 创建博客目录
hugo new site my-blog
cd my-blog

# 添加 Stack 主题（简洁现代）
git init
git submodule add https://github.com/CaiJimmy/hugo-theme-stack themes/hugo-theme-stack
```

### Step 3：配置 Hugo

编辑 `hugo.toml`：

```toml
baseURL = "https://你的用户名.github.io/"
languageCode = "zh-cn"
title = "你的博客名称"
theme = "hugo-theme-stack"

# Stack 主题基础配置
[params]
  defaultTheme = "auto"
  [params.sidebar]
    emoji = "📖"
  [params.article]
    math = false
    readingTime = true

# 菜单配置
[[menu.main]]
  identifier = "home"
  name = "首页"
  url = "/"
  weight = 1

[[menu.main]]
  identifier = "posts"
  name = "文章"
  url = "/post/"
  weight = 2
```

### Step 4：连接 GitHub 远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git

# 创建 .gitignore（忽略构建产物）
echo "public/" >> .gitignore
echo "resources/" >> .gitignore
echo ".hugo_build.lock" >> .gitignore

# 首次提交
git add .
git commit -m "init: 初始化 Hugo 博客"
git push -u origin main
```

### Step 5：配置 GitHub Actions 自动部署

在仓库中创建文件 `.github/workflows/hugo.yml`：

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 6：启用 GitHub Pages

1. 进入仓库 → Settings → Pages
2. Source 选择 **GitHub Actions**
3. 等待首次部署完成

### Step 7：验证

打开 `https://你的用户名.github.io`，看到 Hugo 默认页面，搭建完成。

---

## 三、日常使用：从写到上线只需一步

搭建完成后，日常流程变得极其简单：

```
1. 在 OpenClaw 中说："帮我写一篇关于 XX 的博客"
       │
       ▼
2. OpenClaw 创建/编辑 content/post/文章名/index.md
       │
       ▼
3. 你确认内容满意后
       │
       ▼
4. OpenClaw 执行 git add/commit/push
       │
       ▼
5. GitHub Actions 自动构建（约 1-2 分钟）
       │
       ▼
6. 网站自动更新，新文章上线
```

### 本地预览

写完想先看看效果：

```bash
hugo server -D
# 浏览器访问 http://localhost:1313
```

### OpenClaw 的优势

- 可以直接读写 Markdown 文件
- 可以执行 git 命令
- 可以帮你润色文章、生成内容
- 可以搜索资料辅助写作

---

## 四、OpenClaw Skill：让 AI 掌握工作流

前面说的"用 OpenClaw 写文章"，背后靠的是 **Skill 机制**。

### 什么是 Skill？

Skill 是 OpenClaw 的扩展能力模块，本质上是一个包含 `SKILL.md` 配置文件和相关脚本的文件夹。通过 Skill，你可以让 AI 掌握特定的工作流程。

**核心组成：**
- `SKILL.md` — 定义技能名称、描述、使用场景、工作流
- `scripts/` — 可执行脚本（Python、Shell 等）
- `references/` — 参考文档（可选）

### 如何编写一个 Skill

**目录结构：**
```
skills/
└── my-skill/
    ├── SKILL.md        # 技能定义文件
    ├── scripts/        # 脚本目录
    │   └── do_something.py
    └── references/     # 参考资料（可选）
```

**SKILL.md 格式：**
```yaml
---
name: my-skill
description: |
  技能描述，说明适用场景。
  (1) 场景一
  (2) 场景二
---

# My Skill

## 工作流
...

## 使用方法
...
```

编写完成后放到 `~/.openclaw/workspace/skills/` 目录下，OpenClaw 会自动识别。

### Hugo 博客发布 Skill 详解

我们实际使用的是 `hugo-blog-publisher` 这个 Skill，它封装了整个博客发布的工作流。

**功能概览：**

| 功能 | 说明 |
|------|------|
| **内容提取** | 从网页、微信、小红书等平台提取文章内容 |
| **自动创建文章** | 生成 Hugo 文章（含 frontmatter、标签、分类） |
| **四种记录模式** | 详细记、随手记、简要记、融合记 |
| **GitHub 自动提交** | 自动 add/commit/push |

### 四种记录模式

这个 Skill 最核心的设计是 **四种记录模式**，覆盖从碎片想法到完整文章的所有场景：

**1. 详细记（完整博客）**

写一篇完整的独立博客文章，适用深度技术文章、教程。

```
用户说："帮我写一篇关于 Docker 的博客"
→ AI 调用 create_post.py → 生成文章 → 提交 GitHub
```

**2. 随手记（即时想法）**

记录一闪而过的念头，按分类自动归档（thought/tech/todo/inspiration/unsorted）。

```
用户说："随手记一下：今天学到了 Linux 的 pipe 机制"
→ AI 调用 sui_shou_ji.py → 按分类归档
```

**3. 简要记（链接速记）**

收藏链接，记录一句话摘要。

```
用户说："简要记这个链接：https://xxx.com 文章讲的是 Kubernetes 入门"
→ AI 调用 jian_yao_ji.py → 提取内容 → 生成摘要
```

**4. 融合记（追加到已有博客）**

找到已有博客，把新内容加进去，不覆盖只追加。

```
用户说："把这段内容记到养虾技巧博客里"
→ AI 搜索现有博客 → 找到目标文章 → 追加内容 → 提交
```

### 内容提取策略

| 平台 | 方法 | 说明 |
|------|------|------|
| 普通网页 | Python 脚本（requests + readability） | 自动提取正文 |
| 微信公众号 | 浏览器工具 | SPA 页面，需浏览器渲染 |
| 小红书 | 浏览器工具 + Chrome Relay | 需登录，操作用户浏览器 |
| 需登录页面 | 浏览器工具 + Chrome Relay | 操作已登录的浏览器 |

### 代码示例

```bash
# 详细记：创建文章
python scripts/create_post.py "标题" "正文内容" "标签1,标签2" "分类"

# 随手记：记录想法
python scripts/sui_shou_ji.py "今天学到了..." --category thought

# 简要记：收藏链接
python scripts/jian_yao_ji.py "https://example.com" "文章摘要" --tags 技术,AI

# 提交 GitHub
python scripts/commit_to_github.py "发布文章"
```

### 博客目录结构

```
content/post/
├── jian-yao-ji/          # 简要记（链接速记）
├── sui-shou-ji/          # 随手记（碎片想法）
├── openclaw-complete-guide/  # OpenClaw 完全指南
└── {post-slug}/          # 其他文章
    ├── index.md          # 文章正文
    └── images/           # 图片资源
```

### 标签体系

**按来源：**
`微信` / `小红书` / `知乎` / `GitHub` / `转载`

**按主题：**
`技术` / `后端` / `前端` / `DevOps` / `AI` / `Go` / `Python` / `生活` / `读书笔记` / `学习笔记` / `教程`

**记录类：**
`简要记` / `随手记` / `想法` / `待办`

---

## 五、常见问题

### Q1：文章发布后网站没更新？

检查 GitHub Actions 是否成功运行。进入仓库 → Actions 标签页查看构建日志。

### Q2：图片怎么放？

把图片放在文章目录下：
```
content/post/my-article/
├── index.md
└── image.png
```

在 Markdown 中引用：`![描述](image.png)`

### Q3：想换主题怎么办？

换主题只需：
1. `git submodule remove` 旧主题
2. `git submodule add` 新主题
3. 修改 `hugo.toml` 的 `theme` 字段

### Q4：私有仓库能用 GitHub Pages 吗？

GitHub Pages 免费版只支持 Public 仓库。私有仓库需要 GitHub Pro。

---

## 六、总结

### 流程回顾

| 阶段 | 操作 | 一次性/每次 |
|------|------|------------|
| 搭建 | 创建 GitHub 仓库 | 一次性 |
| 搭建 | 初始化 Hugo + 主题 | 一次性 |
| 搭建 | 配置 GitHub Actions | 一次性 |
| 搭建 | 启用 GitHub Pages | 一次性 |
| 日常 | 用 OpenClaw 写文章 | **每次** |
| 日常 | git push | **每次** |
| 日常 | 等自动部署 | **每次（自动）** |

### 核心优势

- ✅ **零运维成本**：GitHub 免费托管，无需服务器
- ✅ **AI 辅助写作**：效率翻倍，润色、生成、资料搜索全搞定
- ✅ **四种记录模式**：覆盖碎片想法到完整文章的所有场景
- ✅ **自动化部署**：写完就上线，不需要手动操作
- ✅ **技能可扩展**：按需定制 Skill，扩展能力

### 完整工作流总览

```
用户需求 → OpenClaw 匹配 Skill → 调用对应脚本
    │
    ▼
生成/编辑文章 → 写入 content/post/
    │
    ▼
git add/commit/push → GitHub Actions 自动构建
    │
    ▼
GitHub Pages 部署 → 文章上线
```

**从想法到上线，最快只需一次对话。**

---

*本文由龙虾 🦞 整理，基于实际搭建经验。有问题可以问我。*
