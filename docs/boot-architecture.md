# Boot Architecture

## Overview

PxeLab uses a two-stage network boot architecture:

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

1. Client PXE ROM sends DHCP Discover
2. PxeLab DHCP 服务器响应 Offer/Ack，包含:
   - IP 地址（server 模式）
   - next-server（TFTP 服务器地址）
   - bootfile（NBP 文件名）
   - Option 175.178（iPXE 引导脚本 URL）
3. Client 通过 TFTP 下载 NBP（undionly.kpxe / ipxe.efi）
4. PXE ROM 加载并执行 NBP → iPXE 启动

### Stage 2: iPXE → Boot Menu

1. 自定义 iPXE 的嵌入脚本自动执行：
   ```
   #!ipxe
   dhcp || clear
   chain http://${next-server}:8080/boot/ipxe/script?mac=${net0/mac} || shell
   ```
2. iPXE 执行 DHCP（自己做，不读 PXE 缓存）
3. PxeLab 再次响应 DHCP，包含 Option 175.178
4. iPXE 通过 HTTP 获取引导菜单脚本
5. 菜单显示配置的引导项

## Custom iPXE Build

所有 iPXE 二进制都经自定义编译：

- **禁用 PXE_STACK/PXE_MENU** — 避免读取 PXE BIOS/UEFI 缓存数据
- **嵌入引导脚本** — 启动后自动执行 dhcp + chain HTTP
- **UNDI/SNP 接口优先** — 使用 PXE/UEFI 固件网络栈，避免原生驱动兼容性问题

详见 [docs/ipxe-build.md](ipxe-build.md).

## Supported Boot Methods

### 1. iPXE (默认，完整支持)

通过自定义编译的 iPXE 二进制作为 NBP，支持以下引导类型：

| BootType | 用途 | 示例 |
|----------|------|------|
| `direct` | 直接加载内核 + initrd | Linux 发行版安装 |
| `chain` | Chain-load 其他引导器/ISO | GRUB2, Windows Boot Manager |
| `wds` | Windows WIM 引导 | Windows PE/安装 |
| `sanboot` | iSCSI SAN 启动 | 无盘工作站 |
| `local` | 从本地硬盘启动 | 跳过网络引导 |

### 2. PXELinux (SYSLINUX) — 已支持

PXELinux 配置文件解析器位于 `internal/boot/pxelinux/`，功能包括：

- **Parser** — 解析 pxelinux.cfg 语法（default, label, kernel, append, initrd, ipappend, menu label/default, timeout, ontimout, onerror 等）
- **AST** — 抽象语法树
- **Generator** — AST → iPXE 脚本转换

**当前状态：已完整支持。** 服务器 HTTP 端点已接入 PXELinux 处理：当客户端（`pxelinux.0` / `pxelinux.efi`）请求 `pxelinux.cfg/default` 或按 MAC 请求 `pxelinux.cfg/01-<mac>` 时，PxeLab 会拦截该请求，根据主机绑定的 Profile 实时生成对应的 PXELinux 配置（`internal/httpd/server.go` + `internal/boot/configgen`）。同时支持 ChainLoad 场景：PXELinux 配置文件可被实时翻译后继续链式加载 iPXE。

随二进制内置的 NBP 文件：`pxelinux.0`（BIOS）、`pxelinux.efi`（UEFI），以及配套的 `ldlinux.c32` / `ldlinux.e64`、`menu.c32`、`memdisk`。

### 3. GRUB2 — 已支持

GRUB2 网络引导已支持：

- 内置 GRUB2 NBP：`grubx64.efi`（UEFI x64）、`grubaa64.efi`（UEFI ARM64）
- 客户端请求 `grub.cfg`（或按 MAC 的 `grub.cfg-01-<mac>`）时，HTTP 端点拦截请求并根据 Profile 实时生成 GRUB2 配置（`configgen.FormatGRUB2`）
- 也可以通过 iPXE 以 `chain` 类型链式加载 GRUB2 引导镜像（`chain grub2.efi`），GRUB2 作为独立引导器使用

### PXELinux / GRUB2 配置解析链

当客户端（`pxelinux.0` / `pxelinux.efi` / `grubx64.efi` / `grubaa64.efi`）通过 HTTP 请求引导配置时，PxeLab 按以下优先级链处理：

```
请求 /boot/pxelinux.cfg/default 或 /boot/grub2/grub.cfg
    │
    ├─ Level 1: Chain-to-iPXE 激活？     ─→ 返回 iPXE 跳转配置
    │                                       (由 chainToIPXEFallback 决定)
    │
    └─ Level 2: 有默认 Profile？         ─→ 从数据库读取 Profile 菜单条目
        │                                   按 PXELinux/GRUB2 语法渲染
        │
        └─ Level 3: 静态文件兜底          ─→ 从 boot/ 目录读取文件
                                             (pxelinux.cfg/default / grub2/grub.cfg)
```

#### Level 1: Chain-to-iPXE 重定向

当管理员在 Web UI 基础配置中启用了 **Chain to iPXE** 功能时，PXELinux/GRUB2 客户端请求配置时会收到一段**跳转配置**，引导客户端加载 iPXE。内容由以下 Go 函数生成（`internal/boot/chainload.go`）：

| 格式 | 生成函数 | 效果 |
|------|---------|------|
| PXELinux | `PXELinuxChainloadConfig()` | `KERNEL http://server/boot/ipxe.efi` |
| GRUB2 | `GRUB2ChainloadConfig()` | `chainloader (http)/boot/ipxe.efi` |

目的是让 iPXE（HTTP 栈更完整）接管后续引导流程，避免 PXELinux/GRUB2 的 HTTP 功能受限。

#### Level 2: Profile 原生配置生成

当 **Chain to iPXE 未启用**（或不适用），系统会查询数据库：

1. **MAC 特定配置请求**（如 `pxelinux.cfg/01-aa-bb-cc-dd-ee-ff`）：
   - 按 MAC 查找主机 → 获取绑定的 Profile
2. **默认配置请求**（如 `pxelinux.cfg/default` 或 `grub2/grub.cfg`）：
   - 获取 `is_default=true` 的 Profile

找到 Profile 后，读取其 **MenuJSON**（引导菜单条目），通过 `configgen.Generate()` 转换为对应格式：

- **PXELinux 格式** → `generatePXELinux()` → `LABEL xxx / KERNEL xxx / APPEND xxx`
- **GRUB2 格式** → `generateGRUB2()` → `menuentry "xxx" { linux xxx; initrd xxx }`

内容来源于管理员在 Web UI 中配置的 Profile 菜单条目（type 支持 `direct`/`chain`/`local`）。

#### Level 3: 静态文件兜底

若无默认 Profile（`GetDefaultProfile` 返回空），系统 fallback 到 `bootFS.Read(filePath)`——从配置的引导文件根目录读取静态文件：

| 配置项 | 默认路径 | 说明 |
|--------|---------|------|
| `PXEConfigFile` | `pxelinux.cfg/default` | PXELinux 默认配置 |
| `GRUBConfigFile` | `grub2/grub.cfg` | GRUB2 默认配置 |

这些静态文件随二进制嵌入（`//go:embed all:bootdist`），首次启动时自动释放到引导目录。修改 `boot/` 下的文件后，需执行 `go generate ./cmd/pxelab/` 或 `make sync-bootdist` 同步到 `bootdist/` 再重新编译。

#### MAC 地址特定配置

除了默认配置，PXELinux 和 GRUB2 会自动请求 MAC 地址修饰的配置路径：

| 格式 | 示例路径 |
|------|---------|
| PXELinux | `pxelinux.cfg/01-aa-bb-cc-dd-ee-ff` |
| GRUB2 | `grub2/grub.cfg-01-aa-bb-cc-dd-ee-ff` |
| GRUB2 短格式 | `grub2/01-aa-bb-cc-dd-ee-ff` |

当请求 MAC 特定配置时，系统会根据 MAC 查找主机绑定的 Profile，生成对应配置。这样可以做到**每台机器独立的引导配置**。

## Boot File Mapping

详见 `internal/boot/archmap.go`：

| 客户端架构 | AL 码 | 引导文件 |
|-----------|-------|---------|
| BIOS x86 | 0 | undionly.kpxe |
| EFI IA32 | 6 | ipxe32.efi |
| EFI x64 | 7, 9 | ipxe.efi |
| EFI ARM64 | 11 | ipxe-arm64.efi |
| EFI RISCV64 | 21 | ipxe-riscv64.efi |

## DHCP Modes

| Mode | 行为 | 适用场景 |
|------|------|---------|
| `server` | DHCP 服务器分配 IP + PXE 选项 | 独立网络，PxeLab 作为唯一 DHCP（默认模式） |
| `proxy` | 仅提供 PXE 选项，不分配 IP | 现有 DHCP 环境中叠加 PXE 服务 |
| `off` | 不处理 DHCP 请求 | 仅提供 TFTP/HTTP 文件服务 |
