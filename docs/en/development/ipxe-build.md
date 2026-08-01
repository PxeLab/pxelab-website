# Custom iPXE Build

> PxeLab uses custom-built iPXE binaries for two-stage network boot. This page covers the embedded boot script, the build environment, and all build targets.

**Docs**: [Boot Architecture & Diskless](../guides/boot-architecture.md) | [Architecture Mapping & Secure Boot](../reference/boot-settings.md)

---

## Overview

Every iPXE binary embeds the same boot script: it runs DHCP, then loads the boot menu over HTTP — avoiding the chain-load loops caused by PXE BIOS/UEFI caching DHCP data.

### The Embedded Script

```bash
#!ipxe
# PxeLab embedded iPXE script
# This script is compiled into iPXE binaries via EMBED= parameter
# It chains to the PxeLab HTTP server for dynamic boot menu generation

:netboot
dhcp net0 || goto dhcp_failed

# Determine server address from DHCP
isset ${next-server} && set pxelab-server ${next-server}
isset ${proxydhcp/next-server} && set pxelab-server ${proxydhcp/next-server}
isset ${pxelab-server} || set pxelab-server ${dhcp-server}

# Build chain URL
set pxelab-url http://${pxelab-server}:8080/boot/ipxe/script?mac=${net0/mac}

# Chain to PxeLab server
chain ${pxelab-url} || goto failsafe

:dhcp_failed
echo DHCP failed - no network configuration available
goto failsafe

:failsafe
echo
echo Connection to PxeLab server failed.
echo
menu Failsafe Menu
item --gap System Operations
item retry        Retry network boot
item netconfig    Manual network configuration
item localboot    Boot from local disk
item debug        iPXE Debug Shell
choose failsafe_choice || goto localboot
goto ${failsafe_choice}

:retry
goto netboot

:netconfig
echo
echo Manual Network Configuration:
echo
ifstat
echo
echo -n Interface number [0 for net0]: && read net-dev
isset ${net-dev} || set net-dev 0
echo -n IP address: && read net${net-dev}/ip
echo -n Subnet mask: && read net${net-dev}/netmask
echo -n Gateway: && read net${net-dev}/gateway
echo -n DNS server: && read dns
ifopen net${net-dev}
echo
echo Attempting chainload...
goto netboot

:localboot
exit

:debug
echo Type "exit" to return to menu
shell
goto failsafe
```

Script logic:

1. **DHCP first** — run `dhcp net0` to get an IP, also receiving the ProxyDHCP OFFER if one exists; on failure, go to the failsafe menu
2. **Three-level server address resolution** — try `${next-server}` (plain DHCP siaddr), then `${proxydhcp/next-server}` (ProxyDHCP siaddr), then `${dhcp-server}` (fallback), storing the result in a dedicated `pxelab-server` variable
3. **Proxy mode** — `proxydhcp/next-server` exists → use it as the PxeLab address (the ProxyDHCP siaddr field)
4. **Server mode** — no proxy data → use `${dhcp-server}` (PxeLab is the DHCP server itself)
5. **HTTP chain-load** — chain to the PxeLab dynamic boot menu over HTTP; on failure, go to the failsafe menu
6. **Failsafe menu** — offers retry, manual network configuration, local boot, and debug shell for on-site troubleshooting

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

The repo ships `boot/embedd.ipxe` (PxeLab's official embedded script) — copy it or use it as a reference:

```bash
cat > embedd.ipxe << "IPXE_EOF"
#!ipxe
# PxeLab embedded iPXE script
# This script is compiled into iPXE binaries via EMBED= parameter
# It chains to the PxeLab HTTP server for dynamic boot menu generation

:netboot
dhcp net0 || goto dhcp_failed

# Determine server address from DHCP
isset ${next-server} && set pxelab-server ${next-server}
isset ${proxydhcp/next-server} && set pxelab-server ${proxydhcp/next-server}
isset ${pxelab-server} || set pxelab-server ${dhcp-server}

# Build chain URL
set pxelab-url http://${pxelab-server}:8080/boot/ipxe/script?mac=${net0/mac}

# Chain to PxeLab server
chain ${pxelab-url} || goto failsafe

:dhcp_failed
echo DHCP failed - no network configuration available
goto failsafe

:failsafe
echo
echo Connection to PxeLab server failed.
echo
menu Failsafe Menu
item --gap System Operations
item retry        Retry network boot
item netconfig    Manual network configuration
item localboot    Boot from local disk
item debug        iPXE Debug Shell
choose failsafe_choice || goto localboot
goto ${failsafe_choice}

:retry
goto netboot

:netconfig
echo
echo Manual Network Configuration:
echo
ifstat
echo
echo -n Interface number [0 for net0]: && read net-dev
isset ${net-dev} || set net-dev 0
echo -n IP address: && read net${net-dev}/ip
echo -n Subnet mask: && read net${net-dev}/netmask
echo -n Gateway: && read net${net-dev}/gateway
echo -n DNS server: && read dns
ifopen net${net-dev}
echo
echo Attempting chainload...
goto netboot

:localboot
exit

:debug
echo Type "exit" to return to menu
shell
goto failsafe
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
