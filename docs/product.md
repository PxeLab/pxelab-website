# 产品定位与概述

> 一个二进制，多种架构，下载即用。PXE in minutes, all-in-one binary.

**相关文档**: [快速开始](getting-started.md) | [功能特性](features.md) | [术语表](glossary.md)

---

## 什么是 PxeLab

**PxeLab** 是一体化 [PXE](glossary.md) 网络引导平台：把 DHCP、TFTP、HTTP、DNS、NFS 五大网络服务打包进一个零依赖的二进制文件，用现代 Web UI 和 REST API 管理整个网络启动流程——从按下电源到系统就绪，无需 U 盘，无需逐台操作。

传统 PXE 环境需要分别安装、调试多个守护进程（dhcpd / dnsmasq、tftpd-hpa、手写 iPXE 脚本……），配置散落各处，文档陈旧，排错如同玄学。PxeLab 把这一切收敛为一个文件：**下载、运行、打开浏览器，几分钟内开始装机。**

---

## 有那么多工具了，为什么再造一个？

网络引导不是新领域，之前已有不少工具：**pxesrv**、**netboot.xyz**、**Cobbler**……国内也有优秀的 **CloudBoot**（可惜已停止维护约 10 年）、**Ventoy**（专注 U 盘引导）、**iVentoy**（新一代 PXE 工具，主打原生 ISO 引导体验）。每个工具定位不同：

| 工具 | 定位 |
|------|------|
| **pxesrv / Tiny PXE Server** | Windows 平台轻量级 PXE 引导服务，单文件、易上手 |
| **netboot.xyz** | 跨发行版的网络引导菜单，方便快速进入 Live 环境或安装器 |
| **Cobbler / Foreman** | 数据中心级自动化装机平台，功能全但依赖重 |
| **CloudBoot** | 国内早期的云批量装机工具，理念领先，但已停止维护约 10 年 |
| **Ventoy** | 专注 U 盘引导：把 ISO 放进 U 盘即可启动，不面向网络 |
| **iVentoy** | 新一代 PXE 工具，强调原生 ISO 引导体验，把 Ventoy 的体验带到网络启动 |

这些工具各自解决了"某一个环节"，而 PxeLab 想做的事不同：**把 PXE 相关的技术组件与开源项目整合进一个二进制。**

- **一个文件 = 完整技术栈**：DHCP、TFTP、HTTP、DNS、NFS、iPXE 全部内置，跨平台运行（Windows / Linux / macOS），下载即用
- **快速构建整个 PXE 技术栈**：不必再逐个安装调试 dhcpd、tftpd-hpa、iPXE 脚本，几分钟从零搭起一条完整的引导链路
- **底层技术简化包装**：把 DHCP 模式、引导菜单、应答文件模板等复杂机制收敛成 Web UI 里的开关与表单，同时保留自定义 iPXE 脚本、PXELinux 兼容等 DIY 入口
- **面向扩展**：REST API 全覆盖 + PxeLab Hub 社区共享，既可以开箱即用，也可以嵌入自己的自动化体系

一句话：**别人解决"某一个环节"，PxeLab 想交付"整条 PXE 链路"**——跨平台、开箱即用，又不锁死 DIY 与扩展。

---

## 产品功能

- **五大网络服务内置**：DHCP（server / proxy / off 三种模式）、TFTP、HTTP、DNS、NFSv3，单进程承载全部引导流量
- **两段式网络引导**：PXE ROM 经 TFTP 加载 [iPXE](glossary.md)，再由 iPXE 经 HTTP 拉取启动菜单；iPXE 为内置定制编译，开箱即用（机制详解见[引导架构与无盘启动](guides/boot-architecture.md)）
- **全架构覆盖**：x86 BIOS、EFI IA32/x64、ARM32/ARM64、RISC-V 32/64、LoongArch32/64 共 10 种可引导架构，支持 Secure Boot（x86_64 + ARM64）
- **自动化装机**：内置 64+ 主流发行版安装目录，配套 preseed / kickstart / autounattend / AutoYaST 应答文件模板，安装任务全程可追踪
- **现代管理界面**：React Web UI，亮/暗主题，中英双语，实时事件监控
- **REST API 全覆盖**：所有管理操作均可 API 化，易于接入现有自动化体系
- **带外管理**：BMC/IPMI 电源控制、WOL 网络唤醒与定时调度
- **PxeLab Hub**：社区共享的基线脚本、启动模板与配置方案，一键导入（[hub.pxelab.com](https://hub.pxelab.com)）

---

## 目标用户

| 用户角色 | 典型场景 | PxeLab 解决什么 |
|---------|---------|----------------|
| **IT 运维工程师** | 批量部署操作系统、远程维护 | 装机从逐台插 U 盘变为网络推送，任务可追踪 |
| **IDC 机房工程师** | 机房批量上线、无盘工作站 | 一台服务器支撑整排裸机，iSCSI sanboot 无盘启动 |
| **系统管理员** | 日常引导配置、救援维护 | Memtest86、GParted、Live 系统随取随用 |
| **开发/测试团队** | 快速搭建测试环境、自动化部署 | REST API 全覆盖，接入 CI 流水线 |
| **教育/培训** | 网络引导教学、实验室环境 | 零依赖单文件，课堂环境几分钟就绪 |

---

## 核心价值

| 价值 | 说明 |
|------|------|
| **分钟级部署** | 单二进制、零依赖，下载即用——PXE in minutes, not hours |
| **全架构覆盖** | 10 种可引导客户端架构，含 x86 BIOS/EFI、ARM64、RISC-V、LoongArch，支持 Secure Boot |
| **自动化装机** | 64+ 发行版目录 + 应答文件模板，装机任务全程可追踪 |
| **现代管理体验** | Web UI 中英双语 + REST API 全覆盖，告别命令行与配置文件的割裂 |
| **平台自由** | Windows / Linux / macOS 均可运行，典型部署内存 ≤ 512 MB |
| **灵活 DHCP** | server / proxy / off 三种模式，每个网络接口独立配置，适配已有 DHCP 环境 |

## 方案对比

| 特性 | PxeLab | 传统 PXE（TFTP-only） | Foreman/Cobbler |
|------|--------|----------------------|-----------------|
| 安装复杂度 | 单二进制，零依赖 | 手动配置多个服务 | 需要大量依赖 |
| iPXE 支持 | 内置自定义编译 | 需自行编译 | 需自行集成 |
| 多架构 | 10 种客户端架构 + Secure Boot | 通常仅 x86 | 有限 |
| Web 管理 | 内置，全功能 | 无 | 有，但复杂 |
| DHCP 模式 | server / proxy / off | 通常仅一种 | 有限 |
| NFS | 内置 NFSv3 | 需外部 NFS | 需外部 |
| 平台支持 | Windows / Linux / macOS | 通常仅 Linux | 通常仅 Linux |
| 资源占用 | 典型部署内存 ≤ 512 MB | 取决于各服务 | 较高 |

---

## 快速体验

想上手试试？看[快速开始](getting-started.md)：下载、启动、完成第一次网络装机，15 分钟搞定。
