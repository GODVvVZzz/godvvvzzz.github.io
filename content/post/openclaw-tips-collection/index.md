---
title: "OpenClaw 使用技巧大全 - 持续更新"
date: 2026-03-10T02:35:00+08:00
draft: false
tags: ["OpenClaw", "AI助手", "使用技巧", "教程", "配置"]
categories: ["工具"]
description: "持续收集 OpenClaw 各种使用技巧、配置方法、实战场景，一站式手册"
---

> 本文持续更新，记录 OpenClaw 从安装、配置到实战的各种技巧和优质资源。
> 更新时间：2026-03-10（新增：龙虾社区 InStreet, 飞书插件安装教程）

---

## 📋 目录

- [一、从零搭建](#一从零搭建)
- [二、配置文件](#二配置文件)
- [三、实战场景](#三实战场景)
- [四、进阶技巧](#四进阶技巧)
- [五、资源汇总](#五资源汇总)

---

## 一、从零搭建

### 1.1 安装 Ubuntu 24.04 系统

**来源**：[技术爬爬虾 - 12年长期维护！Ubuntu24.04震撼发布，手把手安装教程](https://mp.weixin.qq.com/s/6YKie0itksGm7YRWveNngw)

**关键要点**：
- Ubuntu 24.04 LTS 长期支持版本，官方维护到 2029 年
- 推荐的系统安装方案（双系统/单系统）
- BIOS 设置注意事项（Secure Boot、启动顺序）
- 分区方案建议（/boot/efi、/、swap）

**OpenClaw 安装推荐**：
```bash
# 一键安装 OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# 安装后配置 Gateway 自启
openclaw gateway install
openclaw gateway start
```

**系统要求**：
- Node 22+（安装脚本自动处理）
- 最低 1GB 内存（推荐 2GB+）
- Ubuntu 22.04 LTS / Ubuntu 24.04 LTS / Debian 12

**后续补充**：待添加详细分区步骤、驱动安装、中文环境配置

---

## 二、配置文件

### 2.1 openclaw.json 终极配置指南

**来源**：[陈林 ABC - openclaw.json 终极配置指南](https://mp.weixin.qq.com/s/fdhIpyuiCJFw8-aVCs-3Fw)

**关键要点**：
- openclaw.json 是 OpenClaw 的核心配置文件
- 位置：`~/.openclaw/openclaw.json`（Linux）或 `C:\Users\用户名\.openclaw\openclaw.json`（Windows）
- 主要配置项：
  - **providers**：模型供应商配置（API Key、base URL）
  - **agents**：Agent 行为配置（模型选择、并发限制）
  - **channels**：消息渠道配置（飞书、Telegram 等）
  - **gateway**：Gateway 服务配置（端口、认证）

**关键配置示例**：
```json
{
  "providers": {
    "mimo": {
      "baseURL": "https://api.xiaomimimo.com/v1",
      "apiKey": "sk-xxx"
    }
  },
  "agents": {
    "defaults": {
      "model": "mimo/mimo-claw-0301",
      "subagents": {
        "maxConcurrent": 8
      }
    }
  },
  "gateway": {
    "port": 18789,
    "auth": {
      "token": "your-secret-token"
    }
  }
}
```

**经验总结**：
- 子代理并发上限默认 8 个，可通过 `agents.defaults.subagents.maxConcurrent` 调整
- Gateway 端口默认 18789，控制面板在 18789+3（18792）
- 模型别名可在配置文件中自定义

**后续补充**：待添加更多配置项详解、环境变量覆盖、多环境配置

---

## 三、实战场景

### 3.1 OpenClaw + 飞书知识库：打造云端知识库

**来源**：[DracoVibeCoding - OpenClaw+飞书知识库：打造可以赚钱的云端知识库另类玩法](https://mp.weixin.qq.com/s/j8cqrhmHuYFzv6tuuAa2PQ)

**关键要点**：
- 利用飞书知识库作为 OpenClaw 的持久化存储
- 通过 API 自动创建、更新文档
- 构建可检索的知识体系
- 结合 AI 自动整理、归纳内容

**实现思路**：
1. 飞书创建知识库，配置文档结构
2. OpenClaw 通过飞书 API 读写知识库
3. 利用 AI 自动生成摘要、分类标签
4. 形成可搜索的知识库体系

**实战价值**：
- 个人知识管理自动化
- 团队文档协作
- 内容沉淀与检索

**后续补充**：待添加具体 API 调用示例、脚本代码

---

## 四、进阶技巧

### 4.1 子代理并行化

- 最多 8 个并发子代理
- 使用 `sessions_spawn(runtime="subagent")` 创建
- 适合批量搜索、并行处理任务
- 独立计费，注意成本控制

### 4.2 浏览器自动化

- Linux 原生环境最适合（Playwright/Puppeteer）
- Windows 上可使用 uiautomation 操作用户 Chrome
- LLM 驱动方式 API 调用过多，建议纯脚本优先

### 4.3 Git 代理配置（中国网络）

- GitHub 443 端口被 GFW 阻断
- 本地代理端口：`127.0.0.1:7890`
- 配置：`git config --global http(s).proxy http://127.0.0.1:7890`

---

## 五、资源汇总

### 官方文档
- OpenClaw 官方文档：https://docs.openclaw.ai
- 中文文档站：https://openclaw101.dev/zh

### 优质文章（持续补充）

| 日期 | 主题 | 链接 | 来源 |
|------|------|------|------|
| 2026-03-10 | 龙虾社区 InStreet 全面开放内测 | [链接](https://mp.weixin.qq.com/s/DVhQ_mWNtn9P39ydlmtyUg) | 扣子Coze |
| 2026-03-10 | 飞书官方 OpenClaw 插件安装教程 | [链接](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh) | 飞书文档 |
| 2026-03-10 | Ubuntu 24.04 安装教程 | [链接](https://mp.weixin.qq.com/s/6YKie0itksGm7YRWveNngw) | 技术爬爬虾 |
| 2026-03-10 | openclaw.json 配置指南 | [链接](https://mp.weixin.qq.com/s/fdhIpyuiCJFw8-aVCs-3Fw) | 陈林 ABC |
| 2026-03-10 | OpenClaw+飞书知识库 | [链接](https://mp.weixin.qq.com/s/j8cqrhmHuYFzv6tuuAa2PQ) | DracoVibeCoding |
| 2026-03-09 | OpenClaw 3层记忆系统 | [链接](https://mp.weixin.qq.com/s/Q0CC0p5e-DQEYEk5ErQB1Q) | 腾讯技术工程 |
| 2026-03-09 | Claude Code 最佳实践 | [链接](http://xhslink.com/o/4GnzNdb2MYw) | 小红书 |
| 2026-03-08 | OpenClaw 跑通公众号全流程 | [链接](http://xhslink.com/o/9K9SCGTec7f) | 小红书 @小盖 |

---

## 🔧 我的实战笔记

### 今日记录（2026-03-10）

**小红书自动化教训**：
- "写长文"模式反爬严重，用"文字配图"路径更稳
- 标题限制 20 字，正文 ≤300 字
- 去掉 emoji，卡片模板不支持
- 纯脚本 > LLM 驱动（避免 API 限流）

**Git 代理**：
- 已配置 `127.0.0.1:7890`，GitHub push 可直接走代理

**Linux 重装计划**：
- 计划重装 Ubuntu 24.04 LTS
- 重装后用 Playwright 重写小红书自动化

**龙虾社区 InStreet**：
- OpenClaw Agent 社交平台（扣子Coze 出品）
- 已注册账号：longxia_5302，积分 55
- 支持发帖、评论、点赞、话题互动
- 适合 Agent 交流经验、分享技巧

**飞书 OpenClaw 插件**：
- 官方插件安装教程已发布
- 支持飞书消息接入 OpenClaw
- 参考链接：[飞书文档](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

---

_本文持续更新，欢迎补充。_
