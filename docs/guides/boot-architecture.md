# 引导架构与无盘启动

> 两阶段引导流程、引导类型、PXELinux/GRUB2 兼容、架构映射与 sanboot 无盘启动。

**相关文档**: [架构概述](architecture.md) | [DHCP 模式详解](dhcp-modes.md) | [iPXE 编译](../development/ipxe-build.md)

---

## 两阶段引导

PxeLab 使用两阶段网络引导架构，将 PXE ROM 的有限能力逐步升级到功能完整的 iPXE：

```
Stage 1                    Stage 2
┌─────────┐   TFTP    ┌──────────┐   HTTP    ┌───────────┐
│ PXE ROM ├──────────►│  iPXE   ├──────────►│ Boot Menu │
│ (BIOS/  │ undionly  │ (custom │ /boot/    │ (Kernel + │
│  UEFI)  │ .kpxe/.efi│  build) │ ipxe/     │ Initrd /  │
└─────────┘           │         │ script    │ WIM /     │
                      │         │           │ Chain /   │
                      │         │           │ Local)    │
                      └──────────┘           └───────────┘
```

### Stage 1: PXE ROM → iPXE

1. 客户端 PXE ROM 发送 DHCP Discover
2. PxeLab DHCP 服务器响应 Offer/Ack，包含：
   - IP 地址（server 模式）
   - next-server（TFTP 服务器地址）
   - bootfile（NBP 文件名）
   - Option 175.178（iPXE 引导脚本 URL）
3. 客户端通过 TFTP 下载 NBP（undionly.kpxe / ipxe.efi）
4. PXE ROM 加载并执行 NBP → iPXE 启动

### Stage 2: iPXE → 引导菜单

1. 自定义 iPXE 的嵌入脚本自动执行：

```
#!ipxe
dhcp || clear
chain http://${next-server}:8080/boot/ipxe/script?mac=${net0/mac} || shell
```

2. iPXE 自己执行 DHCP（不读 PXE 固件缓存，规避链式加载循环）
3. PxeLab 再次响应 DHCP，包含 Option 175.178
4. iPXE 通过 HTTP 获取引导菜单脚本
5. 菜单显示配置的引导项

### 自定义 iPXE 编译

所有 iPXE 二进制都经自定义编译：

- **禁用 PXE_STACK/PXE_MENU** — 避免读取 PXE BIOS/UEFI 缓存数据
- **嵌入引导脚本** — 启动后自动执行 dhcp + chain HTTP
- **UNDI/SNP 接口优先** — 使用 PXE/UEFI 固件网络栈，避免原生驱动兼容性问题

编译环境与内嵌脚本说明见[iPXE 编译](../development/ipxe-build.md)。

---

## 引导类型

| BootType | 用途 | 示例 |
|----------|------|------|
| `direct` | 直接加载内核 + initrd | Linux 发行版安装 |
| `chain` | Chain-load 其他引导器/ISO | GRUB2, Windows Boot Manager |
| `wds` | Windows WIM 引导 | Windows PE/安装 |
| `sanboot` | iSCSI SAN 启动 | 无盘工作站 |
| `local` | 从本地硬盘启动 | 跳过网络引导 |

---

## PXELinux / GRUB2 兼容

### PXELinux

PXELinux 配置文件解析器（`internal/boot/pxelinux/`）完整支持：

- **Parser** — 解析 pxelinux.cfg 语法（default, label, kernel, append, initrd, ipappend, menu label/default, timeout 等）
- **AST** — 抽象语法树
- **Generator** — AST → iPXE 脚本转换

当客户端（`pxelinux.0` / `pxelinux.efi`）请求 `pxelinux.cfg/default` 或按 MAC 请求 `pxelinux.cfg/01-<mac>` 时，PxeLab 拦截该请求，根据主机绑定的 Profile 实时生成 PXELinux 配置；同时支持 ChainLoad 场景，PXELinux 配置可被实时翻译后继续链式加载 iPXE。

随二进制内置的 NBP 文件：`pxelinux.0`（BIOS）、`pxelinux.efi`（UEFI），以及配套的 `ldlinux.c32` / `ldlinux.e64`、`menu.c32`、`memdisk`。

### GRUB2

- 内置 GRUB2 NBP：`grubx64.efi`（UEFI x64）、`grubaa64.efi`（UEFI ARM64）
- 客户端请求 `grub.cfg`（或按 MAC 的 `grub.cfg-01-<mac>`）时，HTTP 端点拦截请求并根据 Profile 实时生成 GRUB2 配置
- 也可通过 iPXE 以 `chain` 类型链式加载 GRUB2（`chain grub2.efi`），GRUB2 作为独立引导器使用

### 配置生成优先级

客户端请求引导配置时，按以下优先级处理：

```
请求 /boot/pxelinux.cfg/default 或 /boot/grub2/grub.cfg
    │
    ├─ Level 1: Chain-to-iPXE 激活？     ─→ 返回 iPXE 跳转配置
    │
    ├─ Level 2: 有默认 Profile？         ─→ 从数据库读取 Profile 菜单条目
    │                                       按 PXELinux/GRUB2 语法渲染
    │
    └─ Level 3: 静态文件兜底            ─→ 从 boot/ 目录读取文件
                                             (pxelinux.cfg/default / grub2/grub.cfg)
```

**Level 1 — Chain-to-iPXE 重定向**：Web UI 中启用 **Chain to iPXE** 后，PXELinux/GRUB2 客户端请求配置时会收到一段跳转配置（PXELinux 返回 `KERNEL http://server/boot/ipxe.efi`，GRUB2 返回 `chainloader (http)/boot/ipxe.efi`），由 HTTP 栈更完整的 iPXE 接管后续引导。

**Level 2 — Profile 原生配置**：按 MAC 查找主机绑定的 Profile（或 `is_default` Profile），将其菜单条目（MenuJSON）转换为对应格式：

- PXELinux 格式 → `LABEL xxx / KERNEL xxx / APPEND xxx`
- GRUB2 格式 → `menuentry "xxx" { linux xxx; initrd xxx }`

**Level 3 — 静态文件兜底**：无默认 Profile 时回退到引导文件根目录的静态文件（`pxelinux.cfg/default` / `grub2/grub.cfg`），随二进制内嵌、首次启动自动释放。

### MAC 地址特定配置

| 格式 | 示例路径 |
|------|---------|
| PXELinux | `pxelinux.cfg/01-aa-bb-cc-dd-ee-ff` |
| GRUB2 | `grub2/grub.cfg-01-aa-bb-cc-dd-ee-ff` |
| GRUB2 短格式 | `grub2/01-aa-bb-cc-dd-ee-ff` |

请求 MAC 特定配置时，系统按 MAC 查找主机绑定的 Profile 生成对应配置，实现**每台机器独立的引导配置**。

---

## 架构映射

根据 DHCP Option 93 的客户端架构自动选择引导文件（`internal/boot/archmap.go`）：

| 客户端架构 | AL 码 | 引导文件 |
|-----------|-------|---------|
| BIOS x86 | 0 | ipxe.pxe / undionly.kpxe |
| EFI IA32 | 6 | ipxe32.efi |
| EFI x64 | 7, 9 | ipxe.efi |
| EFI ARM64 | 11 | ipxe-arm64.efi |
| EFI RISCV64 | 27 | ipxe-riscv64.efi |

---

## 无盘启动（sanboot）

sanboot 让客户端从 iSCSI 存储直接启动系统——客户端连硬盘都不需要，适合无盘工作站场景。判定一个引导场景是否适合 sanboot，核心标准是：**ISO 启动后是否还要回头找"自己"来读安装文件？**

| 场景 | 是否适合 | 原因 |
|------|---------|------|
| DOS 启动盘（如 fdfullcd.iso） | ✅ | 启动即运行，不再访问外部介质 |
| Live Linux（Kali / RescueCD） | ✅ | 内核 + initramfs 自包含，能从 SAN 设备回挂自身 |
| WinPE 维护盘 | ✅（BIOS） | 进 PE 后通过 wim/网络获取工具，不依赖 ISO 安装源 |
| Memtest86+ 等裸机工具 | ✅ | 引导后不读盘 |
| iSCSI LUN 直启已装好的系统 | ✅ | 目标是"运行系统"而非"安装系统" |
| CentOS/RHEL 安装 ISO | ⚠️→❌ | Anaconda 需显式 inst.repo，盲扫 SAN 设备常失败 |
| Ubuntu/Debian 安装 ISO | ⚠️→❌ | 需 repo=/url=，subiquity 对 SAN 回挂支持差 |
| Windows 安装 ISO | ❌ | 需提取 wim + BCD，走 wimboot |

判断准则：**安装器型 ISO 不适合 sanboot**（启动后要回头读安装文件）；**运行型 ISO 与已装好的系统盘适合**。
