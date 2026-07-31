# 术语表

> 遇到不认识的缩写？这里用一句话解释。正文里术语首次出现时也会顺带解释。

- **PXE** — 让电脑开机时直接从网络加载操作系统的机制，不需要 U 盘或光驱
- **iPXE** — PXE 的增强版开源实现，支持 HTTP 引导、脚本编程等，功能远强于传统 PXE
- **NBP**（Network Bootstrap Program，网络引导程序）— 客户端通过网络加载的第一个引导程序（如 ipxe.pxe），负责拉起后续引导流程
- **DHCP** — 自动为网络设备分配 IP 地址与引导信息的协议
- **ProxyDHCP** — 叠加在现有 DHCP 之上的引导信息源：IP 仍由现有 DHCP 分配，PXE 引导信息由 PxeLab 提供
- **TFTP** — 简单的文件传输协议，传统 PXE 用它传输引导文件
- **HTTP** — 网页传输协议，iPXE 用它更快地加载引导文件与安装镜像
- **DNS** — 域名解析服务
- **NFS** — 网络文件系统，可把远程目录当作本地目录使用
- **UEFI / BIOS** — 两种电脑固件类型，决定引导流程的形态
- **Secure Boot** — UEFI 安全启动机制，只允许加载经过签名的引导程序
- **引导菜单（Boot Menu）** — 客户端引导后看到的选项列表（安装系统、从本地硬盘启动等）
- **Profile（引导配置文件）** — 绑定到特定主机的引导配置，决定该机器如何引导
- **Netboot 目录（OS 安装目录）** — PxeLab 内置的发行版安装菜单，列出可安装的操作系统
- **应答文件** — 预填安装问题的配置文件（preseed / kickstart / autounattend.xml），实现无人值守安装
- **架构码（DHCP Option 93）** — DHCP 选项里标识客户端 CPU 架构的字段，PxeLab 据此选择对应的引导文件
- **WOL（Wake-on-LAN，网络唤醒）** — 通过网络发送魔术包，远程唤醒关机状态的机器
- **BMC / IPMI** — 服务器的带外管理接口，可远程开机、关机、查看电源状态
- **sanboot** — 从 iSCSI 存储直接启动系统，客户端硬盘都不需要（无盘工作站）
- **WDS** — Windows 部署服务；PxeLab 支持 WDS 场景的 Windows 安装
- **接口（Interface）与子网（Subnet）** — PxeLab 的 DHCP 按接口组织：一个网卡接口下可配置一个或多个子网，每个子网独立设置 DHCP 模式
- **地址池（Address Pool）** — 子网中用于分配给客户端的 IP 范围（如 `192.168.50.100-200`）
- **租约（Lease）** — DHCP 分配给客户端的 IP 及其有效期
- **两阶段引导** — PxeLab 的引导方式：先由 PXE ROM 加载 iPXE，再由 iPXE 加载引导菜单，解决传统 PXE 功能受限的问题
- **引导项（BootType）** — 引导菜单中的一个选项类型：direct（直接加载内核）、chain（链式加载）、sanboot（SAN 启动）、wds（Windows WIM）、local（本地启动）
- **ISO** — 光盘镜像文件格式，PxeLab 可挂载 ISO 用于网络安装
- **架构映射（Arch Map）** — 客户端 CPU 架构到引导文件的对应关系，PxeLab 据此自动选择正确的引导文件
- **iSCSI** — 网络存储协议，把远程磁盘当作本地磁盘使用，是 sanboot 无盘启动的基础
