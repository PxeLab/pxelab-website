# Boot Architecture & Diskless

> Two-stage boot flow, boot types, PXELinux/GRUB2 compatibility, architecture mapping, and sanboot diskless boot.

**Docs**: [Architecture](architecture.md) | [DHCP Modes](dhcp-modes.md) | [Custom iPXE Build](../development/ipxe-build.md)

---

## Two-Stage Boot

PxeLab uses a two-stage network boot architecture that upgrades the limited PXE ROM to full-featured iPXE:

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

1. The client PXE ROM sends DHCP Discover
2. PxeLab's DHCP server responds with Offer/Ack, including:
   - IP address (server mode)
   - next-server (TFTP server address)
   - bootfile (NBP file name)
   - Option 175.178 (iPXE boot script URL)
3. The client downloads the NBP over TFTP (undionly.kpxe / ipxe.efi)
4. The PXE ROM loads and executes the NBP → iPXE starts

### Stage 2: iPXE → Boot Menu

1. The custom iPXE embedded script auto-runs:

```
#!ipxe
dhcp || clear
chain http://${next-server}:8080/boot/ipxe/script?mac=${net0/mac} || shell
```

2. iPXE runs its own DHCP (doesn't read the PXE firmware cache — avoids chain-load loops)
3. PxeLab answers DHCP again, including Option 175.178
4. iPXE fetches the boot menu script over HTTP
5. The menu shows the configured boot entries

### Custom iPXE Build

All iPXE binaries are custom-built:

- **PXE_STACK/PXE_MENU disabled** — avoids reading cached data from the PXE BIOS/UEFI
- **Embedded boot script** — auto-runs dhcp + chain HTTP on startup
- **UNDI/SNP interfaces first** — uses the PXE/UEFI firmware network stack, avoiding native driver compatibility issues

Build environment and embedded script details: [Custom iPXE Build](../development/ipxe-build.md).

---

## Boot Types

| BootType | Use | Example |
|----------|-----|---------|
| `direct` | Load kernel + initrd directly | Linux distro install |
| `chain` | Chain-load another bootloader/ISO | GRUB2, Windows Boot Manager |
| `wds` | Windows WIM boot | Windows PE / install |
| `sanboot` | iSCSI SAN boot | Diskless workstations |
| `local` | Boot from local disk | Skip network boot |

---

## PXELinux / GRUB2 Compatibility

### PXELinux

The PXELinux config parser (`internal/boot/pxelinux/`) is fully supported:

- **Parser** — pxelinux.cfg syntax (default, label, kernel, append, initrd, ipappend, menu label/default, timeout, etc.)
- **AST** — abstract syntax tree
- **Generator** — AST → iPXE script conversion

When a client (`pxelinux.0` / `pxelinux.efi`) requests `pxelinux.cfg/default` or the MAC-specific `pxelinux.cfg/01-<mac>`, PxeLab intercepts the request and generates PXELinux config from the host's bound Profile in real time; ChainLoad scenarios are supported — PXELinux configs can be translated on the fly and continue chain-loading iPXE.

Built-in NBP files: `pxelinux.0` (BIOS), `pxelinux.efi` (UEFI), plus `ldlinux.c32` / `ldlinux.e64`, `menu.c32`, `memdisk`.

### GRUB2

- Built-in GRUB2 NBPs: `grubx64.efi` (UEFI x64), `grubaa64.efi` (UEFI ARM64)
- When a client requests `grub.cfg` (or MAC-specific `grub.cfg-01-<mac>`), the HTTP endpoint intercepts and generates GRUB2 config from the Profile
- GRUB2 can also be chain-loaded from iPXE (`chain grub2.efi`) as a standalone bootloader

### Config Generation Priority

Config requests are handled in this priority:

```
Request /boot/pxelinux.cfg/default or /boot/grub2/grub.cfg
    │
    ├─ Level 1: Chain-to-iPXE enabled?   → return iPXE redirect config
    │
    ├─ Level 2: default Profile?         → read Profile menu entries from DB
    │                                        render as PXELinux/GRUB2 syntax
    │
    └─ Level 3: static file fallback     → read from the boot/ directory
                                             (pxelinux.cfg/default / grub2/grub.cfg)
```

**Level 1 — Chain-to-iPXE redirect**: with **Chain to iPXE** enabled in the UI, PXELinux/GRUB2 clients get a redirect snippet (PXELinux receives `KERNEL http://server/boot/ipxe.efi`, GRUB2 receives `chainloader (http)/boot/ipxe.efi`), handing over to iPXE with its fuller HTTP stack.

**Level 2 — Native Profile config**: look up the host's bound Profile by MAC (or the `is_default` Profile), then render its menu entries (MenuJSON) into the target format:

- PXELinux format → `LABEL xxx / KERNEL xxx / APPEND xxx`
- GRUB2 format → `menuentry "xxx" { linux xxx; initrd xxx }`

**Level 3 — Static file fallback**: with no default Profile, fall back to static files in the boot root (`pxelinux.cfg/default` / `grub2/grub.cfg`), embedded in the binary and released on first launch.

### MAC-Specific Config

| Format | Example path |
|--------|--------------|
| PXELinux | `pxelinux.cfg/01-aa-bb-cc-dd-ee-ff` |
| GRUB2 | `grub2/grub.cfg-01-aa-bb-cc-dd-ee-ff` |
| GRUB2 short | `grub2/01-aa-bb-cc-dd-ee-ff` |

When a MAC-specific config is requested, the system looks up the host bound to that MAC and generates the matching config — **per-machine boot config**.

---

## Architecture Mapping

Boot files are selected automatically by the client architecture from DHCP Option 93 (`internal/boot/archmap.go`):

| Client architecture | AL code | Boot file |
|---------------------|---------|-----------|
| BIOS x86 | 0 | ipxe.pxe / undionly.kpxe |
| EFI IA32 | 6 | ipxe32.efi |
| EFI x64 | 7, 9 | ipxe.efi |
| EFI ARM64 | 11 | ipxe-arm64.efi |
| EFI RISCV64 | 27 | ipxe-riscv64.efi |

---

## Diskless Boot (sanboot)

sanboot lets clients boot their system directly from an iSCSI target — no local disk at all, ideal for diskless workstations. The core criterion for whether a boot scenario suits sanboot: **does the ISO need to go back and read "itself" for install files after booting?**

| Scenario | Suitable? | Why |
|----------|-----------|-----|
| DOS boot disk (e.g. fdfullcd.iso) | ✅ | Runs immediately, no further external access |
| Live Linux (Kali / RescueCD) | ✅ | Self-contained kernel + initramfs; can loop-mount itself from the SAN |
| WinPE maintenance disk | ✅ (BIOS) | Gets tools via wim/network after PE loads; no dependency on the ISO install source |
| Memtest86+ bare tools | ✅ | Doesn't read disks after boot |
| iSCSI LUN with an installed OS | ✅ | The goal is "run the system", not "install the system" |
| CentOS/RHEL install ISO | ⚠️→❌ | Anaconda needs explicit inst.repo; blind SAN scanning often fails |
| Ubuntu/Debian install ISO | ⚠️→❌ | Needs repo=/url=; subiquity has weak SAN loop-mount support |
| Windows install ISO | ❌ | Needs wim extraction + BCD; use wimboot |

Rule of thumb: **installer-type ISOs don't suit sanboot** (they need to read install files after booting); **run-type ISOs and already-installed system disks do**.
