# Product Overview

> One binary, every architecture, ready to run. PXE in minutes, all-in-one binary.

**Docs**: [Getting Started](/en/getting-started) | [Features](/en/features) | [Glossary](/en/glossary)

---

## What is PxeLab

**PxeLab** is an all-in-one PXE network boot platform: it packs DHCP, TFTP, HTTP, DNS, and NFS into a single zero-dependency binary, managed from a modern Web UI and REST API — from power-on to a ready OS, no USB sticks, no per-machine toil.

Traditional PXE setups mean installing and tuning several daemons by hand (dhcpd / dnsmasq, tftpd-hpa, hand-written iPXE scripts…), with configs scattered everywhere, stale documentation, and debugging that feels like voodoo. PxeLab collapses all of that into one file: **download, run, open your browser, and start provisioning within minutes.**

---

## With So Many Tools, Why Build Another?

Network boot is not a new field, and tools already exist: **pxesrv**, **netboot.xyz**, **Cobbler**… plus, in China, **CloudBoot** (a promising idea, unfortunately unmaintained for ~10 years), **Ventoy** (focused on USB boot), and **iVentoy** (a newer PXE tool emphasizing native ISO boot). Each has its own niche:

| Tool | Niche |
|------|-------|
| **pxesrv / Tiny PXE Server** | Lightweight single-file PXE boot service for Windows |
| **netboot.xyz** | Cross-distro network boot menu — jump into live environments or installers |
| **Cobbler / Foreman** | Datacenter-grade provisioning platforms — powerful but dependency-heavy |
| **CloudBoot** | Early cloud-provisioning tool from China; ahead of its time, unmaintained for ~10 years |
| **Ventoy** | USB-boot focused: drop an ISO onto a USB drive and boot — not network-oriented |
| **iVentoy** | Newer PXE tool pushing native ISO boot — the Ventoy experience, over the network |

Those tools each solve "one piece of the puzzle." PxeLab is doing something different: **packaging the PXE-related components and open-source projects into a single binary.**

- **One file, full stack**: DHCP, TFTP, HTTP, DNS, NFS, and iPXE all built in, cross-platform (Windows / Linux / macOS) — download and run
- **Build the whole PXE stack fast**: no more installing and tuning dhcpd, tftpd-hpa, and iPXE scripts one by one — a complete boot chain in minutes
- **Simplified underneath, DIY on top**: DHCP modes, boot menus, answer-file templates collapse into toggles and forms in the Web UI, while custom iPXE scripts and PXELinux compatibility stay open
- **Built to extend**: full REST API plus PxeLab Hub community sharing — works out of the box, or slots into your own automation

In one sentence: **others solve "one piece of the chain"; PxeLab delivers "the whole PXE chain"** — cross-platform, out of the box, and never locked away from DIY or extension.

---

## What It Does

- **Five network services built in**: DHCP (server / proxy / off modes), TFTP, HTTP, DNS, and NFSv3 — one process carries the entire boot flow
- **Two-stage network boot**: the PXE ROM loads iPXE over TFTP, then iPXE pulls the boot menu over HTTP; iPXE ships as a built-in custom build, zero manual setup (mechanics: [Boot Architecture & Diskless](guides/boot-architecture.md))
- **Every architecture**: 10 bootable client architectures — x86 BIOS, EFI IA32/x64, ARM32/ARM64, RISC-V 32/64, LoongArch32/64 — with Secure Boot (x86_64 + ARM64)
- **Automated provisioning**: built-in catalog of 64+ mainstream distros with preseed / kickstart / autounattend / AutoYaST answer-file templates, and end-to-end install task tracking
- **Modern management UI**: React Web UI with light/dark themes, bilingual (EN/中文), and real-time event monitoring
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
| **Every architecture** | 10 bootable client architectures including x86 BIOS/EFI, ARM64, RISC-V, LoongArch, with Secure Boot |
| **Automated provisioning** | 64+ distro catalog plus answer-file templates, with end-to-end task tracking |
| **Modern management** | Bilingual Web UI plus full REST API — no more split between CLI and config files |
| **Platform freedom** | Runs on Windows / Linux / macOS; typical deployment uses ≤ 512 MB RAM |
| **Flexible DHCP** | server / proxy / off modes, independently configured per network interface — slots into existing DHCP environments |

---

## Comparison

| Feature | PxeLab | Traditional PXE (TFTP-only) | Foreman/Cobbler |
|---------|--------|---------------------------|-----------------|
| Setup complexity | Single binary, zero deps | Manual multi-service config | Heavy dependencies |
| iPXE support | Built-in custom compilation | Self-compile required | Self-integration required |
| Multi-arch | 10 client archs + Secure Boot | Usually x86 only | Limited |
| Web management | Built-in, full-featured | None | Yes, but complex |
| DHCP modes | server / proxy / off | Usually one mode | Limited |
| NFS | Built-in NFSv3 | External NFS needed | External needed |
| Platform support | Windows / Linux / macOS | Usually Linux only | Usually Linux only |
| Resource usage | Typical deployment ≤ 512 MB RAM | Depends on services | High |

---

## Quick Start

Want to try it? See [Getting Started](/en/getting-started): download, launch, and finish your first network install in 15 minutes.
