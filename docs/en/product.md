# Product Overview

> One binary, every architecture, ready to run. PXE in minutes, all-in-one binary.

**Docs**: [Getting Started](/en/getting-started) | [Features](/en/features) | [Advantages](/en/advantages)

---

## What is PxeLab

**PxeLab** is an all-in-one PXE network boot platform: it packs DHCP, TFTP, HTTP, DNS, and NFS into a single zero-dependency binary, managed from a modern Web UI and REST API — from power-on to a ready OS, no USB sticks, no per-machine toil.

Traditional PXE setups mean installing and tuning several daemons by hand (dhcpd / dnsmasq, tftpd-hpa, hand-written iPXE scripts…), with configs scattered everywhere, stale documentation, and debugging that feels like voodoo. PxeLab collapses all of that into one file: **download, run, open your browser, and start provisioning within minutes.**

---

## What It Does

- **Five network services built in**: DHCP (server / proxy / off modes), TFTP, HTTP, DNS, and NFSv3 — one process carries the entire boot flow
- **Two-stage network boot**: the PXE ROM loads iPXE over TFTP, then iPXE pulls the boot menu over HTTP; iPXE ships as a built-in custom build, zero manual setup
- **Every architecture**: 11 bootable client architectures including x86 BIOS, UEFI x64, ARM64, RISC-V 64, and LoongArch64, with Secure Boot support
- **Automated provisioning**: built-in catalog of 64+ mainstream distros with autoinstall / preseed / kickstart / autounattend answer-file templates, and end-to-end install task tracking
- **Modern management UI**: React Web UI with dark theme, bilingual (EN/中文), and real-time event monitoring
- **Full REST API**: every management operation is API-accessible, ready for your automation stack
- **Out-of-band ops**: BMC/IPMI power control, Wake-on-LAN with scheduling
- **PxeLab Hub**: community-contributed baselines, boot templates, and configurations, imported in one click ([hub.pxelab.com](https://hub.pxelab.com))

---

## Who It's For

| User Role | Typical Scenarios | What PxeLab Solves |
|-----------|-------------------|--------------------|
| **IT Operations** | Batch OS deployment, remote maintenance | Provisioning becomes a network push instead of a USB-stick walk, with tracked tasks |
| **IDC Engineers** | Data center bring-up, diskless workstations | One server boots an entire rack; iSCSI sanboot for diskless operation |
| **System Administrators** | Boot configuration, rescue & maintenance | Memtest86, GParted, and live systems always at hand |
| **Dev/Test Teams** | Quick environment setup, automated deployment | Full REST API slots straight into CI pipelines |
| **Education/Training** | Network boot teaching, lab environments | A zero-dependency single file — classroom-ready in minutes |

---

## Core Value

| Value | Description |
|-------|-------------|
| **Deploy in minutes** | Single binary, zero dependencies — PXE in minutes, not hours |
| **Every architecture** | 11 bootable client architectures including x86 BIOS/EFI, ARM64, with Secure Boot |
| **Automated provisioning** | 64+ distro catalog plus answer-file templates, with end-to-end task tracking |
| **Modern management** | Bilingual Web UI plus full REST API — no more split between CLI and config files |
| **Platform freedom** | Runs on Windows / Linux / macOS; typical deployment uses ≤ 512 MB RAM |

---

## Comparison

| Feature | PxeLab | Traditional PXE (TFTP-only) | Foreman/Cobbler |
|---------|--------|---------------------------|-----------------|
| Setup complexity | Single binary, zero deps | Manual multi-service config | Heavy dependencies |
| iPXE support | Built-in custom compilation | Self-compile required | Self-integration required |
| Multi-arch | 11 client archs + Secure Boot | Usually x86 only | Limited |
| Web management | Built-in, full-featured | None | Yes, but complex |
| DHCP modes | server / proxy / off | Usually one mode | Limited |
| NFS | Built-in NFSv3 | External NFS needed | External needed |
| Platform support | Windows / Linux / macOS | Usually Linux only | Usually Linux only |
| Resource usage | Typical deployment ≤ 512 MB RAM | Depends on services | High |

---

## Quick Start

```bash
# Download and run
./pxelab

# Open browser
open http://localhost:8080
```

On first start, PxeLab auto-initializes default configuration. All network boot services can be configured and managed through the Web UI.
