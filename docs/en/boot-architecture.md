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
2. PxeLab DHCP server responds with Offer/Ack containing:
   - IP address (server mode)
   - next-server (TFTP server address)
   - bootfile (NBP filename)
   - Option 175.178 (iPXE boot script URL)
3. Client downloads the NBP via TFTP (undionly.kpxe / ipxe.efi)
4. PXE ROM loads and executes the NBP → iPXE starts

### Stage 2: iPXE → Boot Menu

1. The custom iPXE embedded script runs automatically:
   ```
   #!ipxe
   dhcp || clear
   chain http://${next-server}:8080/boot/ipxe/script?mac=${net0/mac} || shell
   ```
2. iPXE performs DHCP itself (does not read the PXE cache)
3. PxeLab responds to DHCP again, including Option 175.178
4. iPXE fetches the boot menu script over HTTP
5. The menu displays the configured boot entries

## Custom iPXE Build

All iPXE binaries are custom-compiled:

- **PXE_STACK/PXE_MENU disabled** — avoids reading PXE BIOS/UEFI cached data
- **Embedded boot script** — automatically runs dhcp + chain HTTP on startup
- **UNDI/SNP interface preferred** — uses the PXE/UEFI firmware network stack, avoiding native driver compatibility issues

See [ipxe-build.md](ipxe-build.md).

## Supported Boot Methods

### 1. iPXE (Default, Fully Supported)

Custom-compiled iPXE binaries serve as the NBP, supporting these boot types:

| BootType | Purpose | Example |
|----------|---------|---------|
| `direct` | Load kernel + initrd directly | Linux distro installation |
| `chain` | Chain-load other bootloaders/ISOs | GRUB2, Windows Boot Manager |
| `wds` | Windows WIM boot | Windows PE/installation |
| `sanboot` | iSCSI SAN boot | Diskless workstations |
| `local` | Boot from local disk | Skip network boot |

### 2. PXELinux (SYSLINUX) — Supported

The PXELinux config file parser lives in `internal/boot/pxelinux/` and includes:

- **Parser** — parses pxelinux.cfg syntax (default, label, kernel, append, initrd, ipappend, menu label/default, timeout, ontimeout, onerror, etc.)
- **AST** — abstract syntax tree
- **Generator** — AST → iPXE script conversion

**Current status: fully supported.** The server HTTP endpoint is wired up for PXELinux: when a client (`pxelinux.0` / `pxelinux.efi`) requests `pxelinux.cfg/default` or a MAC-based `pxelinux.cfg/01-<mac>`, PxeLab intercepts the request and generates the corresponding PXELinux config in real time from the host's bound Profile (`internal/httpd/server.go` + `internal/boot/configgen`). ChainLoad scenarios are also supported: the PXELinux config file can be translated on the fly and then chain-load iPXE.

NBP files bundled with the binary: `pxelinux.0` (BIOS), `pxelinux.efi` (UEFI), plus the companion `ldlinux.c32` / `ldlinux.e64`, `menu.c32`, and `memdisk`.

### 3. GRUB2 — Supported

GRUB2 network boot is supported:

- Bundled GRUB2 NBPs: `grubx64.efi` (UEFI x64), `grubaa64.efi` (UEFI ARM64)
- When a client requests `grub.cfg` (or a MAC-based `grub.cfg-01-<mac>`), the HTTP endpoint intercepts the request and generates the GRUB2 config in real time from the Profile (`configgen.FormatGRUB2`)
- GRUB2 boot images can also be chain-loaded via iPXE with the `chain` boot type (`chain grub2.efi`), using GRUB2 as a standalone bootloader

## Boot File Mapping

See `internal/boot/archmap.go`:

| Client Architecture | AL Code | Boot File |
|--------------------|---------|-----------|
| BIOS x86 | 0 | undionly.kpxe |
| EFI IA32 | 6 | ipxe32.efi |
| EFI x64 | 7, 9 | ipxe.efi |
| EFI ARM64 | 11 | ipxe-arm64.efi |
| EFI RISCV64 | 21 | ipxe-riscv64.efi |

## DHCP Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `server` | DHCP server assigns IP + PXE options | Standalone network, PxeLab as the sole DHCP server (default mode) |
| `proxy` | Only provides PXE options, no IP assignment | Overlay PXE service onto an existing DHCP environment |
| `off` | Does not process DHCP requests | TFTP/HTTP file serving only |
