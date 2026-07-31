# 快速开始

> 目标：15 分钟内，从下载 PxeLab 到完成第一次网络装机。

**相关文档**: [术语表](glossary.md) | [教程 1：给裸机装 Ubuntu](tutorials/install-ubuntu.md) | [故障排查](troubleshooting.md)

---

## PXE 是什么？

PXE（Preboot eXecution Environment，预启动执行环境）是一种让电脑**开机时直接从网络加载操作系统**的机制——不需要 U 盘，不需要光驱，甚至不需要硬盘里已经有系统。

一个典型场景：机房新到 20 台裸机，要在半天内全部装好系统。用 U 盘逐台安装不现实，PXE 让每台机器开机后自动从网络获取系统镜像，批量装机变成一件可管理的事。

PxeLab 把 PXE 所需的 **DHCP、TFTP、HTTP、DNS、NFS** 五个网络服务打包进一个零依赖的程序，用 Web 界面管理整个流程。想了解技术细节？见[术语表](glossary.md)（更深入的引导机制讲解在「进阶主题 · 引导架构」中，建设中）。

---

## 系统要求

| 项目 | 要求 |
|------|------|
| **操作系统** | Windows 10+ / Linux（kernel 3.10+）/ macOS 12+ |
| **硬件架构** | amd64 / arm64（Linux 另支持 armv7） |
| **内存 / 磁盘** | ≥ 512 MB / ≥ 1 GB |
| **网络** | 运行 DHCP 需要管理员/root 权限（端口 67） |

没有其他依赖——单文件，下载即用。

---

## 下载与安装

### 方式一：下载 Release（推荐）

从 GitHub Releases 下载对应平台的二进制：

```bash
# Linux amd64
wget https://github.com/PxeLab/pxelab/releases/latest/download/pxelab_linux_amd64.tar.gz
tar xzf pxelab_linux_amd64.tar.gz

# macOS arm64
wget https://github.com/PxeLab/pxelab/releases/latest/download/pxelab_darwin_arm64.tar.gz
tar xzf pxelab_darwin_arm64.tar.gz
```

Windows：下载 `pxelab_windows_amd64.zip`，解压得到 `pxelab.exe`。

### 方式二：从源码编译

```bash
git clone https://github.com/PxeLab/pxelab.git
cd pxelab
make build          # 生成 bin/pxelab
```

### 方式三：Docker

容器镜像在 Roadmap 中，暂未提供。

---

## 首次启动

```bash
# Linux / macOS（DHCP 端口 67 需要 root）
sudo ./pxelab

# Windows（以管理员身份运行）
pxelab.exe
```

启动后，打开浏览器访问 **http://localhost:8080**，你会看到仪表盘：

![PxeLab 仪表盘](./screenshots/dashboard.png)

顶部的**服务状态栏**显示各服务的运行状态：默认只启动了 HTTP 服务，DHCP / TFTP / DNS / NFS 会在你配置并启动后变绿。

> **Windows**：PxeLab 默认以系统托盘模式运行，托盘图标提供打开浏览器、查看数据目录、退出等功能。

---

## 第一次网络装机（5 步）

准备好一台支持网络引导的电脑（裸机或已有系统的机器都行），跟着做：

**第 1 步：创建子网**
进入 **基础配置 → 服务配置 → DHCP**，点击「添加子网」，填写网段（如 `192.168.50.0/24`）、地址池（如 `192.168.50.100-200`）、网关、DNS，DHCP 模式保持 **server**。保存后在服务列表启动 DHCP 服务。

**第 2 步：确认 OS 安装目录已开启**
进入 **基础配置 → 服务配置 → Netboot 目录**，确认「启用」开关是开的（默认开启）。它决定客户端引导后能看到哪些操作系统。

**第 3 步：客户端开机，选择网络引导**
客户端开机后进入启动菜单（常见按键：F12 / F11 / Esc，各厂商不同），选择**网络引导（PXE Boot / Network Boot）**。

**第 4 步：在引导菜单选择系统**
客户端出现引导菜单后，选择 **Netboot OS Install Catalog** → Ubuntu → 选择版本 → 开始安装。

**第 5 步：验证**
回到仪表盘：新主机出现在「在线主机」列表；在**管理 → 安装任务**页能看到这台机器的安装记录。安装完成后，客户端从本地硬盘正常启动。

> 想每个细节都走一遍？看[教程 1：给一台裸机安装 Ubuntu](tutorials/install-ubuntu.md)。

---

## 下一步

- **教程**：[给裸机装 Ubuntu](tutorials/install-ubuntu.md) · 在现有 DHCP 网络叠加 PXE（建设中）· 搭建无盘工作站（建设中）
- **使用指南**：按功能深度了解（[DHCP 配置](guides/dhcp.md)、[引导菜单配置](guides/boot-config.md)、[主机管理](guides/host-management.md)…）
- **API 自动化**：REST API 快速上手（开发指南，建设中）
- **遇到问题**：[故障排查](troubleshooting.md) · [常见问题](faq.md)
