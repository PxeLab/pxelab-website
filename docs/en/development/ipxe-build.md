# Custom iPXE Build

> PxeLab uses custom-built iPXE binaries for two-stage network boot. This page covers the embedded boot script, the build environment, and all build targets.

**Docs**: [Boot Architecture & Diskless](../guides/boot-architecture.md) | [Architecture Mapping & Secure Boot](../reference/boot-settings.md)

---

## Overview

Every iPXE binary embeds the same boot script: it runs DHCP, then loads the boot menu over HTTP — avoiding the chain-load loops caused by PXE BIOS/UEFI caching DHCP data.

### The Embedded Script

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

Script logic:

1. **DHCP first** — run `dhcp` to get an IP, also receiving the ProxyDHCP OFFER if one exists
2. **`isset proxydhcp/next-server`** — detect whether ProxyDHCP data is present (note: `isset` takes a setting name — no `${}` wrapping)
3. **Proxy mode** — `proxydhcp/next-server` exists → use it as the PxeLab address (the ProxyDHCP siaddr field)
4. **Server mode** — no proxy data → use `${dhcp-server}` (PxeLab is the DHCP server itself)
5. **TFTP fallback** — if HTTP chain-loading fails, try TFTP
6. **DHCP failure** — drop into the iPXE shell for manual debugging

**Benefits**: no hardcoded IPs, no reliance on `${next-server}` scope priority, no dependence on the `PXE_STACK` compile option. One script serves both proxy and server modes.

### PXE_STACK

**No longer needed.** Testing showed PXE_STACK can't import ProxyDHCP data under Legacy BIOS (undionly.kpxe) — the PXE ROM stores proxy data as Option 43 sub-options, which `PXE_STACK` can't read. The current approach uses iPXE's native `dhcp` command to receive the `yiaddr=0` ProxyDHCP OFFER into the `proxydhcp` scope.

### ProxyDHCP Recognition

iPXE's `dhcp_offer()` needs two conditions to recognize an OFFER as ProxyDHCP:

1. **`yiaddr == 0.0.0.0`** — the key criterion: "no IP assigned"
2. **Option 60 = `"PXEClient"`** — UEFI PXE Base Code requires this option echoed in the OFFER

PxeLab's `appendProxyPXEOptions()` ensures both, plus siaddr, Option 54, Option 66, and Option 43.

---

## Build Environment

- A Linux host with:
  - `git`, `make`, `gcc`, `xz`
  - Cross compilers per target architecture:
    - `gcc-aarch64-linux-gnu` (ARM64 UEFI)
    - `gcc-x86-64-linux-gnu` (x86 UEFI, usually present)
    - `gcc-i686-linux-gnu` (IA32 UEFI, optional)
  - Network access (to clone the iPXE source)

## Build Commands

### 1) Clone the iPXE source

```bash
git clone --depth 1 https://github.com/ipxe/ipxe.git
cd ipxe/src
```

### 2) Create the embedded script

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

### 3) Enable HTTPS

Edit `src/config/general.h` — uncomment or add:

```c
#define DOWNLOAD_PROTOCOL_HTTPS
```

`DOWNLOAD_PROTOCOL_HTTPS` lets iPXE download kernels and initrds from `https://github.com/...` URLs referenced by the netboot catalog.

> Other config items (`PXE_MENU`, `PXEXT`, `PXE_STACK`, etc.) need no changes — defaults are fine. `PXE_STACK` is no longer required (see above).

### 4) Build all targets

```bash
# BIOS x86 — UNDI (uses the PXE ROM network stack, no native NIC drivers)
make bin/undionly.kpxe EMBED=embedd.ipxe

# BIOS x86 — full drivers (larger; some NICs may have compatibility issues)
make bin/ipxe.pxe EMBED=embedd.ipxe

# UEFI x86-64 — SNP (uses the UEFI network stack)
make bin-x86_64-efi/ipxe.efi EMBED=embedd.ipxe

# UEFI IA32
make bin-i386-efi/ipxe.efi EMBED=embedd.ipxe

# UEFI ARM64 (needs an aarch64 cross compiler)
make bin-arm64-efi/ipxe.efi EMBED=embedd.ipxe CROSS=aarch64-linux-gnu-
```

### Using the PxeLab Makefile

The PxeLab repo ships Makefile targets:

```bash
make ipxe-build        # build x86_64 EFI (non-embedded, default)
make ipxe-build-embed  # build x86_64 EFI (embedded failsafe)
make ipxe-build-all    # Docker cross-build for all architectures (recommended)
```

---

## Build Products

| Product | Architecture | PxeLab file name | Size |
|---------|--------------|------------------|------|
| `bin/undionly.kpxe` | BIOS x86 (UNDI) | `undionly.kpxe` | ~71KB |
| `bin/ipxe.pxe` | BIOS x86 (full drivers) | `ipxe.pxe` | ~392KB |
| `bin-x86_64-efi/ipxe.efi` | UEFI x86-64 | `ipxe.efi` | ~1.1MB |
| `bin-i386-efi/ipxe.efi` | UEFI IA32 | `ipxe32.efi` | ~1.0MB |
| `bin-arm64-efi/ipxe.efi` | UEFI ARM64 | `ipxe-arm64.efi` | ~1.2MB |
| `bin-x86_64-efi/snponly.efi` | EFI BC (SNP) | `snponly.efi` | - |
| `ipxe-riscv64.efi` | RISC-V 64 | `ipxe-riscv64.efi` | - |
| `ipxe-loong64.efi` | LoongArch64 | `ipxe-loong64.efi` | - |
| `ipxe-x86_64-sb.efi` | EFI x86-64 | - | Secure Boot iPXE |
| `ipxe-arm64-sb.efi` | EFI ARM64 | - | Secure Boot iPXE |
| `shim-x86_64.efi` / `shim-arm64.efi` | - | - | Secure Boot shim |

---

## Integrating into PxeLab

Copy the products to two locations:

```bash
# Runtime boot directory
cp bin/undionly.kpxe /path/to/PxeLab/boot/
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/boot/
# ... and so on

# Embedded bootdist (released on first run)
cp bin/undionly.kpxe /path/to/PxeLab/cmd/pxelab/bootdist/
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/cmd/pxelab/bootdist/
# ... and so on
```

Then rebuild PxeLab:

```bash
cd /path/to/PxeLab
go build ./cmd/pxelab/
```

---

## Architecture Mapping

The client-architecture-to-boot-file mapping lives in `internal/boot/archmap.go`; the mapping table and Secure Boot details: [Architecture Mapping & Secure Boot](../reference/boot-settings.md).
