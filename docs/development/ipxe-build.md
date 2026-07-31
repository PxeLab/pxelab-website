# iPXE 自定义编译

> PxeLab 使用自定义编译的 iPXE 二进制实现两阶段网络引导。本文介绍内嵌引导脚本、编译环境与全部编译目标。

**相关文档**: [引导架构与无盘启动](../guides/boot-architecture.md) | [架构映射与 Secure Boot](../reference/boot-settings.md)

---

## 概述

每个 iPXE 二进制内嵌同一份引导脚本，执行 DHCP 后通过 HTTP 加载引导菜单，避免了 PXE BIOS/UEFI 缓存 DHCP 数据导致的链式加载循环。

### 内嵌脚本

```bash
#!ipxe
dhcp || goto dhcp_failed
isset proxydhcp/next-server && goto use_proxy

:use_dhcp
set next-server ${dhcp-server}
goto chain

:use_proxy
set next-server ${proxydhcp/next-server}

:chain
chain http://${next-server}:8080/boot/ipxe/script?mac=${net0/mac} || goto tftp_fallback
exit

:tftp_fallback
chain tftp://${next-server}/boot/menu.ipxe || shell
exit

:dhcp_failed
shell
```

脚本逻辑：

1. **DHCP 优先** — 执行 `dhcp` 获取 IP，同时接收 ProxyDHCP OFFER（如存在）
2. **`isset proxydhcp/next-server`** — 检测 ProxyDHCP 数据是否存在（注意：`isset` 参数是设置名，不要用 `${}` 包裹）
3. **Proxy 模式** — `proxydhcp/next-server` 存在 → 使用它作为 PxeLab 地址（即 ProxyDHCP 的 siaddr 字段）
4. **Server 模式** — 无 proxy 数据 → 使用 `${dhcp-server}`（PxeLab 本身就是 DHCP 服务器）
5. **TFTP 兜底** — HTTP 链式加载失败时尝试 TFTP
6. **DHCP 失败** — 进入 iPXE shell 以便手动排查

**优势**：无需硬编码 IP、不依赖 `${next-server}` 的 scope 优先级、不依赖 `PXE_STACK` 编译选项。Proxy 和 Server 两种模式共用同一份脚本。

### PXE_STACK 说明

**已不再需要。** 实测发现 PXE_STACK 在 Legacy BIOS（undionly.kpxe）下无法正确导入 ProxyDHCP 数据——PXE ROM 将 proxy 数据存为 Option 43 子选项，`PXE_STACK` 读不到。当前方案通过 iPXE 的 `dhcp` 命令原生接收 `yiaddr=0` 的 ProxyDHCP OFFER 并存入 `proxydhcp` scope。

### ProxyDHCP 识别条件

iPXE 的 `dhcp_offer()` 将 OFFER 识别为 ProxyDHCP 的两个必要条件：

1. **`yiaddr == 0.0.0.0`** — 关键判据，表示「不分配 IP」
2. **Option 60 = `"PXEClient"`** — UEFI PXE Base Code 要求 OFFER 中必须回写此选项

PxeLab 的 `appendProxyPXEOptions()` 确保两者同时满足，并一并设置 siaddr、Option 54、Option 66、Option 43。

---

## 编译环境

- Linux 主机，需安装：
  - `git`、`make`、`gcc`、`xz`
  - 各目标架构的交叉编译器：
    - `gcc-aarch64-linux-gnu`（ARM64 UEFI）
    - `gcc-x86-64-linux-gnu`（x86 UEFI，通常已内置）
    - `gcc-i686-linux-gnu`（IA32 UEFI，可选）
  - 网络访问（克隆 iPXE 源码）

## 编译命令

### 1) 克隆 iPXE 源码

```bash
git clone --depth 1 https://github.com/ipxe/ipxe.git
cd ipxe/src
```

### 2) 创建内嵌脚本

```bash
cat > embedd.ipxe << "IPXE_EOF"
#!ipxe
dhcp || goto dhcp_failed
isset proxydhcp/next-server && goto use_proxy

:use_dhcp
set next-server ${dhcp-server}
goto chain

:use_proxy
set next-server ${proxydhcp/next-server}

:chain
chain http://${next-server}:8080/boot/ipxe/script?mac=${net0/mac} || goto tftp_fallback
exit

:tftp_fallback
chain tftp://${next-server}/boot/menu.ipxe || shell
exit

:dhcp_failed
shell
IPXE_EOF
```

### 3) 启用 HTTPS

编辑 `src/config/general.h`，取消注释或添加：

```c
#define DOWNLOAD_PROTOCOL_HTTPS
```

`DOWNLOAD_PROTOCOL_HTTPS` 使 iPXE 能从 netboot 目录引用的 `https://github.com/...` 等 HTTPS 地址下载内核和 initrd。

> 其他配置项（`PXE_MENU`、`PXEXT`、`PXE_STACK` 等）无需修改，默认值即可。`PXE_STACK` 不再是必要条件（见上文说明）。

### 4) 编译全部目标

```bash
# BIOS x86 — UNDI（使用 PXE ROM 网络栈，不含原生网卡驱动）
make bin/undionly.kpxe EMBED=embedd.ipxe

# BIOS x86 — 全驱动（体积较大，个别网卡可能有兼容问题）
make bin/ipxe.pxe EMBED=embedd.ipxe

# UEFI x86-64 — SNP（使用 UEFI 网络栈）
make bin-x86_64-efi/ipxe.efi EMBED=embedd.ipxe

# UEFI IA32
make bin-i386-efi/ipxe.efi EMBED=embedd.ipxe

# UEFI ARM64（需要 aarch64 交叉编译器）
make bin-arm64-efi/ipxe.efi EMBED=embedd.ipxe CROSS=aarch64-linux-gnu-
```

### 使用 PxeLab Makefile 快捷编译

PxeLab 仓库自带 Makefile 目标：

```bash
make ipxe-build        # 编译 x86_64 EFI（非嵌入式，默认）
make ipxe-build-embed  # 编译 x86_64 EFI（嵌入式 failsafe）
make ipxe-build-all    # Docker 交叉编译全部架构（推荐）
```

---

## 编译产物

| 编译产物 | 架构 | PxeLab 文件名 | 大小 |
|---------|------|-------------|------|
| `bin/undionly.kpxe` | BIOS x86（UNDI） | `undionly.kpxe` | ~71KB |
| `bin/ipxe.pxe` | BIOS x86（全驱动） | `ipxe.pxe` | ~392KB |
| `bin-x86_64-efi/ipxe.efi` | UEFI x86-64 | `ipxe.efi` | ~1.1MB |
| `bin-i386-efi/ipxe.efi` | UEFI IA32 | `ipxe32.efi` | ~1.0MB |
| `bin-arm64-efi/ipxe.efi` | UEFI ARM64 | `ipxe-arm64.efi` | ~1.2MB |
| `bin-x86_64-efi/snponly.efi` | EFI BC（SNP 驱动） | `snponly.efi` | - |
| `ipxe-riscv64.efi` | RISC-V 64 | `ipxe-riscv64.efi` | - |
| `ipxe-loong64.efi` | LoongArch64 | `ipxe-loong64.efi` | - |
| `ipxe-x86_64-sb.efi` | EFI x86-64 | - | Secure Boot iPXE |
| `ipxe-arm64-sb.efi` | EFI ARM64 | - | Secure Boot iPXE |
| `shim-x86_64.efi` / `shim-arm64.efi` | - | - | Secure Boot Shim |

---

## 集成到 PxeLab

编译产物需复制到两个位置：

```bash
# 运行时引导目录
cp bin/undionly.kpxe /path/to/PxeLab/boot/
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/boot/
# ... 以此类推

# 内嵌 bootdist（首次运行时释放）
cp bin/undionly.kpxe /path/to/PxeLab/cmd/pxelab/bootdist/
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/cmd/pxelab/bootdist/
# ... 以此类推
```

然后重新编译 PxeLab：

```bash
cd /path/to/PxeLab
go build ./cmd/pxelab/
```

---

## 架构映射

客户端架构到引导文件名的映射逻辑见 `internal/boot/archmap.go`；架构映射表与 Secure Boot 详见[架构映射与 Secure Boot](../reference/boot-settings.md)。
