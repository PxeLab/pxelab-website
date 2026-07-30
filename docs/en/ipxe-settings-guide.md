# iPXE Boot Script Configuration Guide

## Overview

PxeLab's iPXE boot script system uses a **configuration-driven decision tree** design. You don't need to write raw iPXE scripts — the full PXE boot behavior can be configured visually through the Web UI (Settings → Netboot).

## Decision Tree Flow

When a client requests the boot script (`GET /boot/ipxe/script?mac=xx:xx:xx:xx:xx:xx`), the returned content is determined by the following priority:

```
1. Custom script → filled in? Return the custom script, ignore all settings below
2. Host Profile → does this MAC have a bound Profile with menu entries? Return the Profile menu
   ├─ Append "Boot from local disk" (optional)
   └─ Append "OS Install Catalog" entry (optional)
3. Catalog redirect → enabled? Chain directly to the install catalog
   ├─ Auto-detect architecture (optional)
   └─ Run preamble script (optional)
4. Default boot menu → return the configured default menu
```

## Configuration Modules

### 1. Custom iPXE Script (Escape Hatch)

Path: Settings → Netboot → Custom iPXE Script

When filled in, it **completely replaces** all visual configuration below and is served directly as the client boot script. Use it for temporary debugging or advanced customization.

Available template variables:

| Variable | Description |
|----------|-------------|
| `{{'{{'}}.URL}}` | Replaced with the server address, e.g. `http://192.168.1.10:8080` |
| `{{'{{'}}.MAC}}` | Replaced with the client MAC address |

Example:

<v-pre>

```
#!ipxe
dhcp || clear
echo Booting custom script for {{.MAC}}
chain {{.URL}}/boot/custom.ipxe || shell
```

</v-pre>

Leave it empty to use the visual configuration below.

---

### 2. Default Boot Menu

Path: Settings → Netboot → Default Boot Menu

Clients see this menu when they have **no associated Profile** and the **Netboot catalog redirect is not enabled**.

#### Menu Title
Default value: `PxeLab Boot Menu`

#### Timeout (seconds)
- `0` = no automatic selection, wait for user input
- `>0` = automatically select the default entry after timeout

#### Menu Entries

Each entry contains:

| Field | Description |
|-------|-------------|
| **Label** | Display name of the entry |
| **Type** | Boot type (see below) |

**Boot types:**

| Type | Purpose | Extra Fields | Example |
|------|---------|-------------|---------|
| `local` | Boot from local disk | None | Exit network boot |
| `direct` | Load kernel + initrd directly | kernel, initrd, cmdline | Linux installation |
| `chain` | Chain-load another bootloader | URL | GRUB2, WDS |
| `sanboot` | iSCSI SAN boot | URL | Diskless workstations |
| `wds` | Windows WIM boot | URL, WIM | Windows PE |

**direct type fields:**
- **Kernel path** — kernel file path relative to `/boot/`, e.g. `vmlinuz`
- **Initrd path** — initrd path relative to `/boot/`, e.g. `initrd.img`
- **cmdline** — kernel command line arguments, e.g. `net.ifnames=0 console=tty0`

**chain/sanboot type fields:**
- **URL** — target URL to jump to

**wds type fields:**
- **URL** — WDS server address
- **WIM path** — path to the WIM file

> **Note:** All file paths are relative to the HTTP boot file directory, determined by the "HTTP → Boot File Directory" setting. The frontend auto-completes them as `http://<server-address>/boot/`.

---

### 3. Profile Menu Behavior

Path: Settings → Netboot → Profile Menu Behavior

Controls the entries automatically appended to the iPXE menu for hosts with an associated Profile.

| Option | Description |
|--------|-------------|
| **Append "Boot from local disk"** | Add a local entry at the end/beginning of the Profile menu |
| **Append "OS Install Catalog"** | Add a netboot catalog entry at the end/beginning of the Profile menu |
| **Append position** | Append to the beginning or end of the menu |

Typical scenario: enable "Boot from local disk" and "OS Install Catalog" during server maintenance windows, so operators can temporarily choose the boot method.

---

### 4. Catalog Redirect

Path: Settings → Netboot → Catalog Redirect

When a client has **no associated Profile** and **Netboot is enabled**, it automatically jumps to the OS install catalog menu.

| Option | Description |
|--------|-------------|
| **Enable redirect** | Whether to enable automatic redirect |
| **Target URL** | Redirect target, supports the `{{'{{'}}.URL}}` variable |
| **Auto-detect architecture** | Detect client CPU architecture and firmware type before redirecting |
| **Preamble script** | Extra iPXE commands executed before the redirect |

When **architecture detection** is enabled, the following variables are set automatically:

```ipxe
cpuid --ext 29 && set arch x86_64 || set arch x86
iseq ${buildarch} arm64 && set arch arm64 ||
iseq ${buildarch} armhf && set arch armhf ||
platform --is efi && set platform efi || set platform pc
```

**Target URL example:**

<v-pre>

```
http://{{.URL}}/netboot/menu.ipxe?arch=${arch}&platform=${platform}
```

</v-pre>

**Preamble script example:**

```ipxe
# Re-run DHCP to renew the lease
dhcp || clear

# Set custom variables
set keep-san 1
```

---

### 5. Catalog Menu Structure

Path: Settings → Netboot → Catalog Menu Structure

Controls the title and group ordering of `/netboot/menu.ipxe`.

| Option | Description |
|--------|-------------|
| **Menu title** | Title of the install catalog menu |
| **Group list** | Order/enabled/title editing of the 10 built-in groups |

**The group list supports drag-and-drop sorting:** drag group rows to adjust display order. Each group can be configured with:

- **Internal name** (read-only) — e.g. `linux`, `bsd`, `windows`
- **Display title** — e.g. change `Linux Distributions` to `My Linux Distros`
- **Enabled toggle** — disabled groups are hidden from the menu

Default groups:

| Internal Name | Default Title | Content |
|--------------|---------------|---------|
| `linux` | Linux Distributions | x86_64 Linux distros |
| `linux-i386` | Linux Distributions (32-bit) | 32-bit Linux |
| `linux-arm64` | Linux Distributions (arm64) | ARM64 Linux |
| `bsd` | BSD Systems | FreeBSD/OpenBSD, etc. |
| `live` | Live CDs | Graphical live environments |
| `live-arm` | Live CDs (arm64) | ARM64 live environments |
| `tools` | System Tools | System tools/rescue images |
| `windows` | Windows | Windows PE/installation |
| `dos` | DOS | DOS boot |
| `unix` | Unix | Other Unix systems |

---

## Advanced Configuration

### chain_to_ipxe

When an interface's configured bootloader is `pxelinux` or `grub2` and `chain_to_ipxe` is enabled, PxeLab automatically returns an iPXE chainload config when a PXELinux/GRUB2 client requests its config file, upgrading the client to iPXE.

How it works:

```
Client PXE → PXELinux/GRUB2 loads
  → requests pxelinux.cfg/default or grub.cfg
  → server intercepts, returns iPXE chainload config
  → client downloads ipxe.efi/undionly.kpxe and executes it
  → iPXE requests the boot script → enters the configuration-driven decision tree
```

Configuration example (YAML):

```yaml
interfaces:
  - name: eth0
    dhcp: server
    bootloader: grub2
    chain_to_ipxe: true
```

---

## Common Scenarios

### Scenario 1: Show Only the Network Install Catalog

```
Default menu: keep the default entries
Timeout: 5 seconds
Catalog redirect: enabled
→ Clients without a Profile: automatically jump to the OS install catalog
→ Clients with a Profile: see the Profile menu
```

### Scenario 2: Pure Local Boot + Netboot for Management

```
Default menu: keep only the "Boot from local disk" entry
Catalog redirect: disabled
Profile append local boot: enabled
→ All clients boot locally by default
→ Clients that need OS installation: bind a Profile
```

### Scenario 3: Multi-Architecture Mixed Environment

```
Catalog redirect: enabled + architecture detection
→ x86_64 EFI clients automatically chain to the matching-arch catalog
→ ARM64 clients enter the ARM64 distro catalog
```

### Scenario 4: Maintenance Mode

```
Profile menu behavior: append position → beginning
Append local boot + append OS catalog: both enabled
→ Clients see local boot and install catalog options first at startup
→ Avoids being locked out by automatic Profile selection
```

---

## Backend YAML Configuration Reference

All settings above can also be configured directly in `config.yaml`; changes made in the Web UI are automatically saved to the file.

```yaml
netboot:
  enabled: true
  script_template: ""  # leave empty to use the visual configuration
  boot:
    default_menu:
      title: "PxeLab Boot Menu"
      timeout: 5000
      default: 0
      entries:
        - label: "Boot from local disk"
          type: local
        - label: "Install Ubuntu 22.04"
          type: direct
          kernel: "vmlinuz"
          initrd: "initrd.img"
          cmdline: "net.ifnames=0"
    profile_behavior:
      append_local: true
      append_netboot: true
      append_position: "last"
    catalog_redirect:
      enabled: true
      target_url: "http://{{ "{" }}{".URL}}/netboot/menu.ipxe?arch=${arch}&platform=${platform}"
      detect_arch: true
      preamble: ""
    catalog_display:
      title: "[OS] Netboot OS Install Catalog"
      groups:
        - name: linux
          title: "Linux Distributions"
          enabled: true
          order: 1
        - name: linux-i386
          title: "Linux Distributions (32-bit)"
          enabled: true
          order: 2
        # ... more groups
```

## Troubleshooting

| Symptom | Cause | Check |
|---------|-------|-------|
| Client boots straight to local disk | Default menu has a local entry and timeout is zero | Check whether the default menu only has a local entry |
| Client can't see the install catalog | Netboot not enabled or Profile append not configured | Check "Enable OS Install Catalog Menu" and "Profile Menu Behavior" |
| Config changes don't take effect | Browser cache | Hard refresh (Ctrl+F5) |
| Custom script doesn't run | Script syntax error | Check server logs for iPXE errors |
| chain_to_ipxe doesn't trigger | Interface bootloader mismatch | Check `bootloader: grub2` or `pxelinux` in the interface config |
