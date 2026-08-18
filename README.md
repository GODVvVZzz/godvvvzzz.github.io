# VvVzzz Blog

这是 [VvVzzz Blog](https://godvvvzzz.github.io/) 的源码仓库，使用 Hugo 和
[Hugo Theme Stack v4](https://github.com/CaiJimmy/hugo-theme-stack) 构建，并通过
GitHub Actions 发布到 GitHub Pages。

## 本地预览

需要安装 Go、Hugo Extended 以及 Dart Sass。主题要求 Hugo `0.157.0` 或更高版本。

```bash
hugo server --buildDrafts
```

访问 <http://localhost:1313/>。

## 构建

```bash
hugo --gc --minify
```

生产环境构建由 [deploy.yml](.github/workflows/deploy.yml) 完成。推送到 `master` 或
`main` 后，GitHub Actions 会构建并部署站点。

## 更新主题

主题通过 Hugo Module 管理：

```bash
hugo mod get -u github.com/CaiJimmy/hugo-theme-stack/v4
hugo mod tidy
```

仓库中的定时工作流也会检查并提交 v4 范围内的主题更新。
