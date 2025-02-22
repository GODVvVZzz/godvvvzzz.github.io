---
title: "记录本博客搭建过程"
description: 
slug: hugo-stack-study
date: 2024-12-11T09:44:53+08:00
# image: cover.png
categories:
    - 建站
tags:
    - Stack
comments: true
weight: 1
---

## Hugo Stack Starter

https://github.com/CaiJimmy/hugo-theme-stack-starter

这是一个为 **Hugo Stack** 主题设计的快速上手模板，使用了 **Hugo 模块** 来加载主题。它提供了基础的主题结构和配置，同时配置了 **GitHub Actions**，可以自动将网站部署到 GitHub Pages。还包含一个每天自动更新主题的定时任务（cron job）。

### 创建 GitHub 仓库

1. 点击 GitHub 上的 **Use this template** 按钮。
2. 将新仓库命名为 `<用户名>.github.io`。其中，用户名建议为全小写。

### 创建 GitHub Codespace

1. 仓库创建完成后，创建一个与之关联的 **GitHub Codespace**。
2. Codespace 已经配置好了 Hugo 的最新扩展版本。
3. 在终端中运行命令 `hugo server`，即可在浏览器中预览你的网站。

### 配置站点信息

1. 检查仓库中的 `config` 文件夹，里面是站点的配置文件。
2. 修改 `config/_default/config.toml` 文件中的 `baseurl` 属性，填入你的网站 URL。

### 部署到 GitHub Pages

1. 打开仓库的 **Settings -> Pages** 页面。
2. 将构建分支从 `master` 改为 `gh-pages`。
3. 每次编辑完网站后，只需将更改提交并推送到仓库，GitHub Actions 会自动将网站部署到对应的 GitHub Pages。

## 如何写博客

### 本地下载hugo

以ububtu为例

**1. 下载 Hugo 最新版**

访问 Hugo 的 GitHub Releases 页面找到最新版下载链接：
[Hugo Releases](https://github.com/gohugoio/hugo/releases)

或者直接通过命令行下载 `hugo_extended` 的 Linux 64 位版本：

```bash
wget https://github.com/gohugoio/hugo/releases/download/v0.139.3/hugo_extended_0.139.3_Linux-64bit.tar.gz
```

**2. 解压下载的文件**

解压 `.tar.gz` 文件：

```bash
tar -xvzf hugo_extended_0.139.3_Linux-64bit.tar.gz
```

解压后会生成一个 `hugo` 二进制文件。

**3. 安装 Hugo**

将解压后的 `hugo` 二进制文件移动到系统路径（如 `/usr/local/bin`），以便全局使用：

```hugo
sudo mv hugo /usr/local/bin/
```

**4. 验证安装**

运行以下命令验证安装并检查版本：

```bash
hugo version
```

输出示例：

```plaintext
hugo v0.139.3+extended linux/amd64 BuildDate=2024-12-09T10:00:00Z
```

### **创建新文章**

```bash
hugo new post/react-study-plan/index.md
```

在 `content/post/react-study-plan/index.mdd` 中编辑内容，例如：

```yaml
---
title: "My First Post"
date: 2024-12-09
draft: false
tags: ["hugo", "theme"]
categories: ["blog"]
---
This is my first post with Hugo Stack theme!
```

### **启用评论**

Stack 主题默认支持 Utterances评论系统，只需要在 `/config/params.toml`配置以下参数：

```toml
## Comments
[comments]
enabled = true
provider = "utterances"

[comments.utterances]
repo = "GODVvVZzz/blog-comments"
issueTerm = "pathname"           # 评论与文章的关联方式，可选 title, pathname, url
label = "Comments"               # GitHub Issue 的标签名称
theme = "github-light"           # 评论框的主题风格
```

### 本地预览

在项目根目录下执行hugo server，访问http://localhost:1313/ 

### 标签&tag配置

直接在文章 Front Matter中添加即可

```yaml
---
title: "测试文章"
date: 2024-12-18
categories:
  - 测试分类
tags:
  - 标签1
  - 标签2
---
```



## 其他

### 配置项目git忽略文件

```
# Hugo 缓存目录
.cache/
hugo_stats.json
resources/
# 构建输出目录
public/
# Node.js 和前端工具生成的文件（如适用）
node_modules/
dist/
# 临时文件和日志
*.log
*.lock
.DS_Store
Thumbs.db
*.tmp
*.bak
# TypeScript 或编辑器相关配置文件
tsconfig.json
jsconfig.json
# 操作系统或编辑器生成的文件
.idea/
.vscode/
*.swp
*~
# Hugo 模块缓存
go.sum
go.mod
```

