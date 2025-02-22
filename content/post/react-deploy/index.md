---
title: "React Deploy"
description: 
date: 2025-02-23T00:54:07+08:00
image: 
math: 
license: 
comments: true
categories:
    - 学习
tags:
    - react部署
---

# React 项目部署到腾讯云服务器

本文将介绍如何将 React 项目部署到腾讯云服务器（无需域名），并使用 Nginx 作为 Web 服务器进行配置。

## 准备工作

### 服务器配置
- **操作系统**：推荐 Ubuntu 22.04 LTS
- **安全组开放端口**：80 (HTTP) 和 22 (SSH)
- **获取服务器公网 IP**：如 `123.123.123.123`

## 部署步骤

### 连接服务器
通过 SSH 连接到服务器，使用密码或密钥登录：
```bash
ssh root@服务器IP
```

### 安装必要环境
首先，更新软件包列表并安装 Node.js 和 Nginx：
```bash
# 更新软件包列表
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Nginx
sudo apt install nginx -y

# 验证安装
node -v  # 应显示 v20.x
nginx -v  # 应显示版本号
```

### 上传项目文件
将本地 React 项目上传到服务器：
```bash
# 本地电脑执行（将本地项目上传到服务器）
scp -r ./react-project root@服务器IP:/home/react-project
```

### 构建生产版本
在服务器端构建 React 应用：
```bash
# 服务器端操作
cd /home/react-project
npm install
npm run build  # 生成 build/ 或 dist/ 目录
```

### 配置 Nginx
创建 Nginx 配置文件并启用：
```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/sites-available/react-app
```

在文件中输入以下内容：
```nginx
server {
    listen 80;
    server_name _;  # 无需域名
    root /home/react-project/build;  # 根据实际构建目录调整
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
sudo nginx -t        # 测试配置
sudo systemctl restart nginx
```

### 6. 开放防火墙（腾讯云控制台）
登录腾讯云控制台，进入安全组设置，添加入站规则：
- 协议：TCP
- 端口：80
- 来源：0.0.0.0/0（或你的本地 IP）

### 7. 本地访问
在浏览器中访问：
```bash
http://服务器IP
```

### 备选方案：使用 PM2 部署
若需保持开发模式运行（不推荐生产环境）：
```bash
# 全局安装 PM2
npm install pm2 -g

# 启动应用
pm2 serve /home/react-project/build 3000

# 设置开机启动
pm2 startup
pm2 save
```
此时访问地址为：
```bash
http://服务器IP:3000
```

## 后续维护

### 更新代码
若要更新代码：
```bash
# 本地
scp -r ./react-project root@服务器IP:/home/react-project

# 服务器
cd /home/react-project
npm run build
sudo systemctl restart nginx
```

### 常用命令
| 命令 | 作用 |
| ---- | ---- |
| `sudo systemctl status nginx` | 查看 Nginx 状态 |
| `journalctl -u nginx -f` | 查看 Nginx 日志 |
| `pm2 list` | 查看 PM2 进程 |

## 注意事项

- **权限问题**：确保 `/home/react-project` 目录有读取权限。
- **路径问题**：检查 Nginx 配置中的路径与实际构建目录是否一致。
- **端口冲突**：若使用其他端口需同步修改安全组规则。

通过以上步骤即可通过服务器 IP 直接访问部署的 React 应用。后续获取域名后，只需在 Nginx 配置中修改 `server_name` 并配置 SSL 证书即可升级为 HTTPS 站点。