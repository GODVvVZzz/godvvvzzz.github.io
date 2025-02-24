---
title: "Linux Permission"
description: 从一次部署react项目中学习Linux权限设置
date: 2025-02-24T19:14:51+08:00
image: 
math: 
license: 
hidden: false
comments: true
categories:
    - 随记
tags:
    - linux
---

## Linux 文件权限基础 

1. **权限三元组** 

  Linux 中每个文件/目录的权限由 3 组字符表示（共 9 位）：

```markdown
 rwx    rwx    rwx
 │││    │││    │││
 └┬┘    └┬┘    └┬┘
Owner  Group  Others
```

  - `r = 读 (4)`

  - `w = 写 (2)`

  - `x = 执行/进入目录 (1)`

2. **数字表示法**  
  - `755 = rwxr-xr-x`

  - `644 = rw-r--r--`

  - `777 = rwxrwxrwx（危险！）`

## Nginx 权限需求分析 

1. **Nginx 运行身份** 
默认以 `www-data` 用户和组运行（可通过 `ps aux | grep nginx` 确认）。
需要至少以下权限： 
  - 目录：`r-x`（读 + 执行）

  - 文件：`r--`（读）

2. **关键路径** 
假设你的项目路径为：

```swift
/home/ubuntu/work/react-todo-demo/dist/
```

## 分步权限配置指南 

### 步骤 1：检查当前权限 

- 查看完整路径权限链（关键！）


```bash
namei -l /home/ubuntu/work/react-todo-demo/dist/index.html
```

示例输出：


```pgsql
f: /home/ubuntu/work/react-todo-demo/dist/index.html
drwxr-xr-x root     root     /
drwxr-xr-x root     root     home
drwxr-x--- ubuntu   ubuntu   ubuntu       # 问题所在！
drwxrwxr-x ubuntu   ubuntu   work
drwxrwxr-x ubuntu   ubuntu   react-todo-demo
drwxrwxrwx www-data www-data dist
-rwxrwxrwx www-data www-data index.html
```

### 步骤 2：设置父目录权限 

- 开放父目录的 `x` 权限（允许进入目录）

```bash
sudo chmod o+x /home/ubuntu
sudo chmod o+x /home/ubuntu/work
sudo chmod o+x /home/ubuntu/work/react-todo-demo
```

- 验证


```bash
namei -l /home/ubuntu/work/react-todo-demo/dist/index.html | grep ubuntu
```

应看到类似：


```css
drwx--x--x
```

### 步骤 3：设置项目目录权限 

- 进入项目目录


```bash
cd /home/ubuntu/work/react-todo-demo
```

- 设置目录权限（`755 = owner 可写，其他人只读+执行`）

```bash
sudo find dist/ -type d -exec chmod 755 {} \;
```

- 设置文件权限（`644 = owner 可写，其他人只读`）

```bash
sudo find dist/ -type f -exec chmod 644 {} \;
```

- 验证


```bash
ls -l dist/
```

应显示：


```css
drwxr-xr-x 目录
-rw-r--r-- 文件
```

### 步骤 4：设置所有权（推荐方案） 

- 将目录组改为 `www-data`

```bash
sudo chown -R ubuntu:www-data /home/ubuntu/work/react-todo-demo/dist
```

- 设置组写权限（可选，如果你需要自动构建）


```bash
sudo chmod -R g+w dist/
```

- 最终权限结构：

  - `drwxrwxr-x 目录（owner:ubuntu, group:www-data）`

  - `-rw-rw-r-- 文件（owner:ubuntu, group:www-data）`

## 安全增强配置 

### 方案 A：严格模式（推荐） 

- 父目录权限（仅允许 ubuntu 用户和组访问）


```bash
sudo chmod 750 /home/ubuntu
sudo chmod 750 /home/ubuntu/work
sudo chmod 750 /home/ubuntu/work/react-todo-demo
```

- 将 `www-data` 用户加入 `ubuntu` 组

```bash
sudo usermod -aG ubuntu www-data
```

- 项目目录权限


```bash
sudo chmod -R 750 /home/ubuntu/work/react-todo-demo/dist
sudo chown -R ubuntu:ubuntu /home/ubuntu/work/react-todo-demo/dist
```

### 方案 B：宽松模式（快速修复） 

- 宽松权限配置


```bash
sudo chmod -R 755 /home/ubuntu/work/react-todo-demo
sudo chown -R ubuntu:www-data /home/ubuntu/work/react-todo-demo
```

## SELinux/AppArmor 处理 

如果系统启用了强制访问控制：

- 临时禁用（测试用）


```bash
sudo setenforce 0          # SELinux
sudo systemctl stop apparmor  # AppArmor
```

- 永久解决方案


```bash
sudo semanage fcontext -a -t httpd_sys_content_t "/home/ubuntu/work/react-todo-demo/dist(/.*)?"
sudo restorecon -Rv /home/ubuntu/work/react-todo-demo/dist
```

## 验证配置 

### 模拟 Nginx 访问 

- 切换到 `www-data` 用户

```bash
sudo -u www-data bash
```

- 尝试访问文件


```bash
cat /home/ubuntu/work/react-todo-demo/dist/index.html
exit
```

### 检查 Nginx 错误日志 


```bash
sudo tail -f /var/log/nginx/error.log
```

### 最佳实践总结 
| 对象              | 推荐权限 | 所有权          | 说明                    |
| ----------------- | -------- | --------------- | ----------------------- |
| 项目父目录        | 755      | ubuntu:ubuntu   | 确保 www-data 有 x 权限 |
| 构建目录（dist）  | 755      | ubuntu:www-data | 组权限方便 Nginx 读取   |
| 静态文件（.html） | 644      | ubuntu:www-data | 防止意外修改            |
| 可执行文件（.sh） | 744      | ubuntu:www-data | 需要执行权限时使用      |