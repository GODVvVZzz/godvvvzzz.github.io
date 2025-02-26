---
title: "前后端域名使用探讨"
description: 关于什么时候使用内网域名和外网域名
date: 2025-02-27T00:49:52+08:00
image: 
math: 
license: 
hidden: false
comments: true
categories:
    - 部署
tags:
    - nginx
---

------

## **核心原则**

|       访问场景        | 推荐域名类型 |                             说明                             |
| :-------------------: | :----------: | :----------------------------------------------------------: |
|  **前端 → 后端接口**  | 内网域名/IP  | 前端与后端部署在同一内网，通过反向代理通信，减少公网暴露风险。 |
| **客户端 → 后端接口** |   外网域名   | 客户端（如移动端、第三方）需通过公网访问，需暴露外网域名并加固安全。 |

------

## **典型场景及配置方案**

### **场景1：纯Web应用（仅前端调用后端）**

- **架构特点**：

  - 前端部署在公网（如Nginx/CDN），后端在内网。
  - 所有接口仅由前端调用，**客户端不直接访问后端**。

- **配置方案**：

  1. **前端调用后端**：Nginx使用内网域名/IP代理后端服务（如 `proxy_pass http://internal-api.example.com`）。
  2. **客户端访问**：仅访问前端域名（如 `https://www.example.com`），不暴露后端接口。

  ```nginx
  # 前端Nginx配置
  location /api/ {
      proxy_pass http://internal-api.example.com:8080;  # 内网域名
      proxy_set_header Host $host;
  }
  ```

### **场景2：混合应用（前端+客户端均需调用后端）**

- **架构特点**：

  - 后端需同时服务前端（Web）和客户端（App/第三方）。
  - 需区分内部接口和开放接口。

- **配置方案**：

  1. **前端调用后端**：通过内网域名/IP（走反向代理）。
  2. **客户端调用后端**：通过外网域名（如 `https://api.example.com`），配合API网关、鉴权和限流。

  ```nginx
  # 对外API网关配置
  server {
      listen 443 ssl;
      server_name api.example.com;  # 外网域名
  
      location /public-api/ {
          proxy_pass http://backend-cluster;  # 后端集群内网地址
          # 安全加固：API密钥验证、速率限制等
      }
  }
  ```

### **场景3：全开放API服务（如第三方集成）**

- 架构特点：
  - 后端需完全暴露给公网，供多客户端直接调用。
- 配置方案：
  1. 统一使用外网域名（如 `https://api.example.com`）。
  2. 通过**API网关**管理流量，并启用HTTPS、OAuth2、IP白名单等安全措施。

------

## **安全最佳实践**

1. **内网通信加固**

   - 使用内网域名/IP，避免后端直接暴露在公网。

   - 通过防火墙限制后端端口仅允许前端服务器IP访问。

     ```bash
     # 后端服务器防火墙规则（示例）
     sudo ufw allow from 前端服务器IP to any port 8080
     sudo ufw deny 8080  # 禁止其他IP访问
     ```

2. **外网接口防护**

   - **HTTPS加密**：强制所有外网域名使用SSL/TLS。

   - **鉴权机制**：JWT、OAuth2、API Key等。

   - 速率限制：防止DDoS和滥用。

     ```nginx
     # Nginx限流配置
     limit_req_zone $binary_remote_addr zone=api_rate:10m rate=10r/s;
     
     location /api/ {
         limit_req zone=api_rate burst=20;
         proxy_pass http://backend;
     }
     ```

3. **监控与日志**

   - 记录所有外网接口的访问日志。
   - 使用工具（如Prometheus+Grafana）监控API健康状态。

------

## **常见误区与解答**

- **误区1**：所有接口都需通过外网暴露。
  ​**解答**：仅客户端直接调用的接口需外网域名，前端调用的接口应通过内网通信。
- **误区2**：内网域名不需要HTTPS。
  ​**解答**：内网通信也应启用HTTPS（如自签证书），防止内部流量被窃听。
- **误区3**：外网接口仅靠防火墙保护足够。
  ​**解答**：需多层防御（HTTPS+鉴权+WAF），防火墙仅是第一道屏障。

------

## **总结**

- **前端调用后端** → 优先使用内网域名/IP，通过反向代理隐藏后端。
- **客户端调用后端** → 使用外网域名，严格加固安全策略。
- 始终遵循最小暴露原则，减少攻击面，结合业务需求设计网络架构。



## 场景1 详解

在前后端分离的架构中，通过 **Nginx 反向代理**实现浏览器间接访问内网后端服务的链路如下：

**完整交互流程（以访问 `https://example.com` 为例）**

```mermaid
sequenceDiagram
    participant 浏览器
    participant 前端服务器(Nginx)
    participant 后端服务器

    浏览器->>前端服务器(Nginx): 1. 请求前端页面（GET /）
    前端服务器(Nginx)->>浏览器: 2. 返回HTML/CSS/JS文件
    浏览器->>前端服务器(Nginx): 3. 发起API请求（GET /api/todos）
    前端服务器(Nginx)->>后端服务器: 4. 转发请求到内网地址（如http://10.0.0.2:8080）
    后端服务器->>前端服务器(Nginx): 5. 返回API响应数据
    前端服务器(Nginx)->>浏览器: 6. 返回数据给浏览器
```

------

### **关键步骤详解**

#### **浏览器请求前端页面**

- **用户输入**：访问 `https://example.com`。
- **DNS解析**：浏览器通过DNS查询得到 `example.com` 的公网IP（如 `122.51.70.205`）。
- **请求前端资源**：浏览器向该IP的80/443端口发送请求，获取 `index.html` 和静态资源（JS/CSS）。

#### **前端服务器（Nginx）响应静态文件**

- Nginx配置：托管前端打包后的文件。

  ```nginx
  server {
      listen 80;
      server_name example.com;
      root /var/www/dist;  # 前端文件目录
      index index.html;
      
      location / {
          try_files $uri $uri/ /index.html;  # 处理前端路由
      }
  }
  ```

#### **浏览器执行JS代码发起API请求**

- **前端代码逻辑**：JS中调用 `fetch("/api/todos")`。
- **实际请求地址**：浏览器会将其解析为 `https://example.com/api/todos`（同源请求）。

#### **Nginx代理转发到后端服务器**

- Nginx反向代理规则：匹配/api/路径，转发到内网后端。

  ```nginx
  location /api/ {
      proxy_pass http://10.0.0.2:8080;  # 后端内网IP和端口
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
  }
  ```

- **内网通信**：Nginx将请求发送到后端服务器的内网地址 `10.0.0.2:8080`。

#### **后端服务器处理请求**

- **监听端口**：后端服务运行在内网服务器的 `8080` 端口。
- **安全限制**：防火墙仅允许来自前端服务器IP的请求（如 `10.0.0.1`）。

#### **数据返回浏览器**

- **响应路径**：后端 → Nginx → 浏览器。
- **浏览器视角**：全程只与 `example.com` 通信，**感知不到后端服务器的存在**。

------

### **为什么后端无需暴露公网？**

1. Nginx的中转作用

   - 所有请求通过Nginx进入，后端服务只需在内网监听端口，无需公网IP或端口映射。

2. 防火墙保护

   - 后端服务器的防火墙可配置为仅接受来自前端服务器内网IP的请求：

     ```bash
     # 后端服务器防火墙规则（示例）
     sudo ufw allow from 10.0.0.1 to any port 8080  # 仅允许前端服务器访问
     sudo ufw deny 8080  # 禁止其他IP访问
     ```

3. 安全性提升

   - 后端不暴露公网，减少被扫描攻击的风险。

------

### **常见问题解答**

#### **Q1：为什么浏览器不直接请求后端地址？**

- **同源策略**：前端代码部署在 `example.com`，若直接请求 `http://10.0.0.2:8080/api` 会触发跨域错误（CORS）。
- **解决方案**：通过Nginx代理统一域名，规避跨域问题。

#### **Q2：如何保证内网通信安全？**

- **使用VPN或专线**：前后端服务器通过私有网络通信。
- **内网HTTPS**：即使在内网，也建议为后端服务启用HTTPS。

#### **Q3：如何扩展多台后端服务器？**

- 负载均衡：在Nginx中配置upstream模块：

  ```nginx
  upstream backend {
      server 10.0.0.2:8080 weight=1;
      server 10.0.0.3:8080 weight=2;
  }
  location /api/ {
      proxy_pass http://backend;
  }
  ```

------

### **总结**

- **核心逻辑**：Nginx作为中间层，将公网请求转发到内网后端，隐藏后端细节。
- **安全要点**：后端仅在内网监听，通过防火墙限制访问来源。
- **优势**：前端域名统一管理请求，提升安全性和扩展性。