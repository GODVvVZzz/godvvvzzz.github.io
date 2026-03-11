---
title: "Ubuntu 24.04 安装完整指南（HP 暗影精灵3）"
description: "从下载镜像到安装完成的完整记录，下次照着装就行"
slug: ubuntu-24-04-install-guide
date: 2026-03-11T02:35:00+08:00
comments: true
categories:
    - 技术笔记
tags:
    - ubuntu
    - linux
    - 装机
    - HP
comments: true
---

## 前言

记录一次完整的 Ubuntu 24.04.4 LTS 安装过程，硬件是 HP 暗影精灵3。踩过的坑都写进去了，下次照着装就行。

---

## 一、准备工作

### 1. 下载镜像

- 官网：https://ubuntu.com/download/desktop
- 版本：Ubuntu 24.04.4 LTS (Noble Numbat)
- 文件：`ubuntu-24.04.4-desktop-amd64.iso`（约 5.7GB）

### 2. 验证镜像完整性

下载后务必校验 SHA256，确保文件没损坏：

```powershell
Get-FileHash "C:\Users\用户名\Downloads\ubuntu-24.04.4-desktop-amd64.iso" -Algorithm SHA256
```

官方校验值（Ubuntu 24.04.4 Desktop AMD64）：
```
3a4c9877b483ab46d7c3fbe165a0db275e1ae3cfe56a5657e5a47c2f99a99d1e
```

**必须完全匹配，否则重新下载。**

### 3. 准备 U 盘

- 容量：至少 8GB（推荐 16GB+）
- 先清空 U 盘（用 diskpart）

```powershell
# 以管理员打开 CMD 或 PowerShell
diskpart
list disk
select disk X    ← 替换 X 为你的 U 盘编号，看容量判断，千万别选错
clean
create partition primary
format fs=fat32 quick
assign
exit
```

**⚠️ 选错磁盘会清掉硬盘数据，务必确认好。**

---

## 二、烧录镜像

### 推荐工具：Rufus

balenaEtcher 对 Ubuntu 24.04 支持有问题，容易报"源镜像已损坏"。**直接用 Rufus。**

1. 下载 Rufus：https://rufus.ie
2. 插入 U 盘，打开 Rufus
3. 选择 U 盘设备
4. 点"选择"，选下载好的 ISO
5. 分区类型：**GPT**
6. 目标系统：**UEFI（非 CSM）**
7. 文件系统：**FAT32**
8. 点击"开始"

等待完成即可。

---

## 三、BIOS 设置

### 进入 BIOS（HP 暗影精灵3）

1. 完全关机
2. 按电源键，立即反复按 **`F10`** 键
3. 如果没反应，试试 **`ESC`**，在启动菜单里选 `F10 BIOS Setup`

### BIOS 配置

1. **关闭 Secure Boot**（如果安装遇到问题）
   - `Security` → `Secure Boot` → `Disable`
   
2. **设置启动顺序**
   - `Boot Options` → 把 USB Device 移到第一位
   
3. 或者直接按 **`F9`** 开机时选择启动设备

---

## 四、安装 Ubuntu

### 启动到安装界面

1. 插入 U 盘
2. 开机按 `F9` 选择从 USB 启动
3. 或按 `ESC` → 选择 USB 启动项

### 安装步骤

1. **选择语言** → 中文（简体）

2. **选择"试用 Ubuntu"或"安装 Ubuntu"**
   - 建议直接选"安装 Ubuntu"

3. **键盘布局** → Chinese

4. **网络连接** → 连上 Wi-Fi（建议连，方便安装时下载更新）

5. **安装类型**
   - 如果是全新安装：选择"擦除磁盘并安装 Ubuntu"
   - 如果要双系统：选择"其他选项"，手动分区

6. **⚠️ 重要：选择安装到固态硬盘（SSD）**

   HP 暗影精灵3 有两个硬盘：
   - `nvme0n1` — 固态硬盘（SSD，ROTA=0），128GB
   - `sda` — 机械硬盘（HDD，ROTA=1），1TB

   **必须把系统装到固态盘（`nvme0n1`）上！** 性能差距巨大，开机快、响应快。

   **如何识别哪个是固态：**
   - 在终端运行：`lsblk -d -o NAME,ROTA`
   - `ROTA=0` 是固态，`ROTA=1` 是机械
   - 固态通常是 `nvme0n1`（NVMe 接口），机械是 `sda`（SATA 接口）

   **手动分区方案（推荐）：**
   
   | 分区 | 设备 | 大小 | 挂载点 | 文件系统 | 说明 |
   |------|------|------|--------|----------|------|
   | EFI | nvme0n1p1 | 512MB | /boot/efi | EFI | 引导分区 |
   | 根分区 | nvme0n1p2 | 剩余全部（~118GB）| / | ext4 | 系统分区 |

   **操作步骤：**
   - 选择"其他选项"（手动分区）
   - 找到 `nvme0n1`，删除所有现有分区（Windows 残留分区直接删）
   - 新建 EFI 分区：512MB，类型选"EFI 系统分区"，挂载 `/boot/efi`
   - 新建根分区：剩余全部，挂载 `/`，文件系统 ext4
   - **"安装启动引导器的设备"选 `/dev/nvme0n1`**（不要选 sda）

   **机械硬盘（sda）等系统装完后再处理**，可以格式化后挂载到 `/home` 或 `/data`，当数据盘用。

7. **时区** → Shanghai

8. **创建用户**
   - 用户名、密码自己填
   - 记住密码！

9. **开始安装** → 等待完成（约 10-20 分钟）

10. **安装完成提示重启** → 点击"现在重启"

---

## 五、重启后

### 拔 U 盘

屏幕黑掉（或出现 HP Logo）时 → **拔掉 U 盘**

### 首次启动

进入 Ubuntu 首次配置向导：
1. 登录你创建的账号
2. 连接网络
3. 跳过或完成其他设置

### 验证安装

打开终端，运行：
```bash
lsb_release -a
uname -a
```

应该显示 Ubuntu 24.04 LTS。

---

## 六、常见问题

### 问题 1：balenaEtcher 报"源镜像已损坏"

- 原因：balenaEtcher 对大文件支持有问题
- 解决：换 Rufus

### 问题 2：ISO 校验值不匹配

- 原因：下载不完整或传输出错
- 解决：重新下载

### 问题 3：U 盘烧录后容量变小（只剩 6GB）

- 原因：分区表损坏
- 解决：用 diskpart clean 清理，再重新格式化

### 问题 4：安装后拔掉 U 盘又进安装界面

- 原因：GRUB 菜单里选了 Try or Install
- 解决：选 Ubuntu 或直接拔 U 盘

### 问题 5：进不去 BIOS

- HP 暗影精灵3：反复按 F10，或 ESC + F10

---

## 七、后续配置

### 配置机械硬盘为数据盘

系统装到固态后，机械硬盘（sda，1TB）可以当数据盘用：

```bash
# 查看磁盘信息
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT

# 格式化机械盘（会清空数据！）
sudo mkfs.ext4 /dev/sda1

# 创建挂载点
sudo mkdir /data

# 挂载
sudo mount /dev/sda1 /data

# 设置开机自动挂载（编辑 /etc/fstab）
sudo nano /etc/fstab
# 添加一行：/dev/sda1 /data ext4 defaults 0 2
```

或者挂载到 `/home`（需要迁移用户数据，操作更复杂，建议新装系统时直接做）。

### 安装常用软件

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install vim git curl wget build-essential -y
```

### 安装 NVIDIA 驱动（如果有独显）

```bash
sudo ubuntu-drivers autoinstall
sudo reboot
```

### 配置 Git

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

---

## 参考资料

- [Ubuntu 官方安装指南](https://ubuntu.com/tutorials/install-ubuntu-desktop)
- [Ubuntu 24.04 SHA256 校验值](https://releases.ubuntu.com/24.04/SHA256SUMS)
- [Rufus 官网](https://rufus.ie)
- [HP BIOS 进入方法](https://support.hp.com)

---

*本文由龙虾 🦞 记录于 2026-03-11，下次重装照着走就行。*
