---
title: "OpenClaw 完全指南：满权限配置与浏览器自动化"
date: 2026-03-08T02:00:00+08:00
draft: false
tags: ["OpenClaw", "AI工具", "浏览器自动化", "权限配置", "教程"]
categories: ["技术"]
description: "详细介绍 OpenClaw 的满权限配置和浏览器自动化操作，包含安装步骤、权限放开、Chrome扩展配置等完整教程"
---

> 本文内容整合自微信公众号文章，记录了 OpenClaw 2026.3.2 版本的完整配置和使用方法。

## 前言

OpenClaw（被戏称为"小龙虾"）是一款开源 AI Agent 项目，近期在全球爆火。但由于安全考虑，2026.3.2 版本默认禁用了许多功能。本文将介绍如何满血复活 OpenClaw，包括权限配置和浏览器自动化。

---

## 一、OpenClaw 安装

### 1.1 一键安装

以管理员身份运行 PowerShell：

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

### 1.2 解决执行策略问题

如果出现报错，执行：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后重新执行安装命令。

### 1.3 验证安装

```bash
openclaw --version
# 输出：2026.3.2（或更新版本）
```

---

## 二、放开 Agent 权限（满血复活）

由于安全考虑，新版 OpenClaw 默认禁用了许多功能，需要手动开启满权限。

### 2.1 编辑配置文件

打开 `~/.openclaw/openclaw.json`，修改 `tools` 配置：

```json
{
  "tools": {
    "profile": "full"
  }
}
```

这会让 OpenClaw 获得完整的工具访问权限，包括文件系统、网络、浏览器等操作。

### 2.2 重启服务

```bash
openclaw gateway restart
```

---

## 三、浏览器自动化配置

### 3.1 查看浏览器状态

```bash
openclaw browser status
```

### 3.2 启动 Chrome 扩展中继模式

这种方式让 AI 控制你正在使用的 Chrome 标签页，而非启动独立浏览器。

**步骤1：启动 chrome 配置文件**

```bash
openclaw browser --browser-profile chrome start
```

**步骤2：查看实际端口**

```bash
openclaw browser --browser-profile chrome status
```

输出示例：
```
profile: chrome
running: true
cdpPort: 18801
cdpUrl: http://127.0.0.1:18801
```

**步骤3：安装 Chrome 扩展**

- 访问 Chrome Web Store 搜索 "OpenClaw Browser Relay"
- 或访问：https://chromewebstore.google.com/detail/openclaw-browser-relay/nglingapjinhecnfejdcpihlpneeadjp

**步骤4：配置扩展**

- 中继 URL：`http://127.0.0.1:18801`（根据实际 cdpPort 调整）
- Token：从 `openclaw.json` 的 `gateway.auth.token` 获取

**步骤5：使用**

- 打开任意网页
- 点击 Chrome 工具栏上的 OpenClaw 扩展图标
- 图标显示 "ON" 表示已连接，AI 可以控制该标签页

---

## 四、使用示例

### 4.1 查看当前浏览器状态

```bash
openclaw browser --browser-profile chrome status
```

### 4.2 打开指定网页

```bash
openclaw browser --browser-profile chrome open https://example.com
```

### 4.3 通过 AI 对话控制

在飞书或其他接入的聊天窗口中：

```
我已经打开并登录了微博，获取今天最新10条微博热搜消息
```

AI 会自动操作浏览器完成任务。

---

## 五、配置文件详解

完整的 `openclaw.json` 浏览器配置：

```json
{
  "browser": {
    "enabled": true,
    "remoteCdpTimeoutMs": 1500,
    "remoteCdpHandshakeTimeoutMs": 3000,
    "defaultProfile": "chrome",
    "color": "#FF4500",
    "headless": false,
    "noSandbox": false,
    "attachOnly": false,
    "profiles": {
      "openclaw": { "cdpPort": 18800, "color": "#FF4500" },
      "chrome": { "cdpPort": 18801, "color": "#0066CC" }
    }
  }
}
```

**配置说明：**
- `enabled`: 启用浏览器控制
- `defaultProfile`: 默认配置文件（chrome 或 openclaw）
- `headless`: 是否无头模式（false 显示浏览器窗口）
- `profiles`: 配置文件列表，每个有独立的 cdpPort

---

## 六、常见问题

### Q1: 扩展显示 "Relay unreachable"

**解决**：
1. 确认 `openclaw browser --browser-profile chrome status` 显示 `running: true`
2. 检查扩展配置的中继 URL 是否匹配 `cdpUrl`
3. 确认 Token 正确

### Q2: 点击扩展图标没有反应

**解决**：
1. 确保在普通网页（非 chrome:// 页面）上点击
2. 检查扩展权限：进入 `chrome://extensions/` → OpenClaw Browser Relay → 详情 → 确保权限已开启
3. 刷新页面后重试

### Q3: 如何查看实际端口？

**解决**：
```bash
openclaw browser --browser-profile chrome status
# 查看 cdpPort 字段
```

**注意**：端口不是固定的，必须通过命令查看！

---

## 七、总结

通过本文的配置，你可以：
- ✅ 满血复活 OpenClaw，放开所有权限
- ✅ 通过 Chrome 扩展让 AI 控制你的浏览器
- ✅ 实现说话就能让 AI 帮你操作网页

这让 OpenClaw 可以：
- 自动查资料、搜信息
- 打开网页、操作页面
- 填写表单、点击按钮
- 截图、提取内容

大大提高自动化效率！

---

## 参考链接

- OpenClaw 官方文档：https://docs.openclaw.ai
- Chrome 扩展：https://chromewebstore.google.com/detail/openclaw-browser-relay/nglingapjinhecnfejdcpihlpneeadjp
- 本文 GitHub 仓库：https://github.com/GODVvVZzz/godvvvzzz.github.io

---

> 本文由 OpenClaw 自动整理生成
