# 产品定位与概述

> 一个二进制，多种架构，下载即用。PXE in minutes, all-in-one binary.

**相关文档**: [快速开始](getting-started.md) | [功能特性](features.md) | [优势能力](advantages.md)

---

## 什么是 PxeLab

**PxeLab** 是一体化 [PXE](glossary.md) 网络引导平台：把 DHCP、TFTP、HTTP、DNS、NFS 五大网络服务打包进一个零依赖的二进制文件，用现代 Web UI 和 REST API 管理整个网络启动流程——从按下电源到系统就绪，无需 U 盘，无需逐台操作。

传统 PXE 环境需要分别安装、调试多个守护进程（dhcpd / dnsmasq、tftpd-hpa、手写 iPXE 脚本……），配置散落各处，文档陈旧，排错如同玄学。PxeLab 把这一切收敛为一个文件：**下载、运行、打开浏览器，几分钟内开始装机。**

---

## 产品功能

- **五大网络服务内置**：DHCP（server / proxy / off 三种模式）、TFTP、HTTP、DNS、NFSv3，单进程承载全部引导流量
- **两段式网络引导**：PXE ROM 经 TFTP 加载 [iPXE](glossary.md)，再由 iPXE 经 HTTP 拉取启动菜单；iPXE 为内置定制编译，开箱即用（机制详解见[引导架构与无盘启动](guides/boot-architecture.md)）
- **全架构覆盖**：x86 BIOS、UEFI x64、ARM64、RISC-V 64、LoongArch64 等 11 种可引导架构，支持 Secure Boot
- **自动化装机**：内置 64+ 主流发行版安装目录，配套 autoinstall / preseed / kickstart / autounattend 应答文件模板，安装任务全程可追踪
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
| **全架构覆盖** | 11 种可引导客户端架构，含 x86 BIOS/EFI、ARM64、Secure Boot |
| **自动化装机** | 64+ 发行版目录 + 应答文件模板，装机任务全程可追踪 |
| **现代管理体验** | Web UI 中英双语 + REST API 全覆盖，告别命令行与配置文件的割裂 |
| **平台自由** | Windows / Linux / macOS 均可运行，典型部署内存 ≤ 512 MB |

---

## 方案对比

| 特性 | PxeLab | 传统 PXE（TFTP-only） | Foreman/Cobbler |
|------|--------|----------------------|-----------------|
| 安装复杂度 | 单二进制，零依赖 | 手动配置多个服务 | 需要大量依赖 |
| iPXE 支持 | 内置自定义编译 | 需自行编译 | 需自行集成 |
| 多架构 | 11 种客户端架构 + Secure Boot | 通常仅 x86 | 有限 |
| Web 管理 | 内置，全功能 | 无 | 有，但复杂 |
| DHCP 模式 | server / proxy / off | 通常仅一种 | 有限 |
| NFS | 内置 NFSv3 | 需外部 NFS | 需外部 |
| 平台支持 | Windows / Linux / macOS | 通常仅 Linux | 通常仅 Linux |
| 资源占用 | 典型部署内存 ≤ 512 MB | 取决于各服务 | 较高 |

---

## 快速体验

```bash
# 下载并运行
./pxelab

# 打开浏览器访问
open http://localhost:8080
```

首次启动后，PxeLab 会自动初始化默认配置。通过 Web UI 即可完成所有网络引导服务的配置和管理。
