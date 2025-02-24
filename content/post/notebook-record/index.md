---
title: "Notebook Record"
description: 
slug: notebook-record
date: 2025-02-24T15:01:17+08:00
comments: true
categories:
    - 随记
tags:
    - notebook
comments: true
---

## Git操作

### ssh秘钥

```bash
# 检查是否已有 SSH 密钥
ls -al ~/.ssh
# 生成新的 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"
# 将 SSH 密钥添加到 SSH 代理
eval "$(ssh-agent -s)" # 启动ssh代理
ssh-add ~/.ssh/id_ed25519 # 将私钥添加到 SSH 代理
# 将公钥添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 测试 SSH 连接
ssh -T git@github.com
```

### config配置

```bash
git config --list

# 去掉--global则为当前项目设置
git config --global user.name "weiweiwei"
git config --global user.email "2662446324@qq.com"
```



## Linux常用命令

### 查看历史已执行命令

```bash
# 查看历史命令
history
history | tail -n 10
!123 # 使用 !编号 重新运行某条命令

#可以通过 Ctrl + R 反向搜索历史命令：
#按下 Ctrl + R。
#输入关键字（如 git），终端会显示匹配的命令。
#按 Enter 运行该命令，或按 Ctrl + R 继续搜索上一条匹配的命令。

```

