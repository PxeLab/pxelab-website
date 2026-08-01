# Features

> Complete feature list of PxeLab.

**Docs**: [Product Overview](/en/product) | [Advantages](/en/advantages) | [Architecture](/en/guides/architecture)

---

## Network Services

| Service | Port | Description |
|---------|------|-------------|
| **DHCP** | 67 | Supports server / proxy / off modes, per-interface config |
| **ProxyDHCP** | 4011 | Overlays onto existing DHCP, no client config changes |
| **TFTP** | 69 | Configurable port and timeout, serves NBP files |
| **HTTP** | 8080 | Serves boot scripts, Web UI, SPA, boot files |
| **DNS** | 53 | Local resolution + upstream forwarding, A/AAAA/CNAME records |
| **NFS** | 2049 | Built-in NFSv3, multiple mount points, IP-based access control |

---

## Boot Capabilities

### iPXE Support

- Custom-compiled iPXE with embedded boot scripts
- 10 bootable client CPU architectures: x86 BIOS, EFI IA32/x86-64, ARM32/64, RISC-V 32/64, LoongArch32/64
- Secure Boot support (x86_64 and ARM64)
- Auto architecture detection via DHCP Option 93

### Boot Types

| Type | Description |
|------|-------------|
| **direct** | Directly load kernel + initrd |
| **chain** | Chain-load to another iPXE script |
| **wds** | Windows WDS deployment (WIM files) |
| **sanboot** | iSCSI SAN boot |
| **local** | Local disk boot |

### PXELinux Compatibility

- pxelinux.cfg format parser + AST
- Auto-generates iPXE scripts
- Seamless migration to iPXE

---

## Management Features

### Web UI

- React 19 SPA, light/dark/system themes with adjustable accent color and corner radius
- Bilingual (Chinese/English)
- Real-time data refresh (SSE event stream)
- Responsive design, mobile-friendly

### REST API

- v1 with full CRUD operations
- JSON request/response format
- Cookie-based session authentication
- `/api/v1/metrics` metrics snapshot endpoint (JSON)

### Host Management

- Host CRUD
- Profile binding (boot menu), MAC address management
- Online status tracking, WOL wake, BMC/IPMI power control

### Boot Menu (Profile Management)

- Boot configuration (Profile) with script versioning
- Diff comparison, rollback
- Supports menu / direct / chain / wds / sanboot / netboot / local / custom boot types

### Scripts & Template Marketplace

- **Init Scripts / Script Management**: custom boot script assets
- **PxeLab Hub**: community-shared baseline scripts, boot templates, and configs with one-click import

### OS Install Catalog

- 64+ mainstream distros and tools organized into 10 preset groups: Linux / Live / Tools / BSD / Unix / DOS / Windows, etc.
- Groups sorted by configured order
- Custom groups and entries
- Answer file template integration

### Answer File Templates

- Preset + custom templates
- Preview and validation
- Variable substitution

---

## Hardware Management

| Feature | Description |
|---------|-------------|
| **WOL** | Wake-on-LAN with scheduled tasks |
| **BMC/IPMI** | Out-of-band power control (on/off/reboot/status) |
| **CSV Import** | Batch BMC info import |
| **OS Images** | ISO upload, mount, distro detection, mount tracking |

---

## Operations Tools

| Tool | Description |
|------|-------------|
| **Event Log** | Real-time event stream (DHCP / boot / wake / out-of-band), SSE push |
| **Audit Log** | Track all configuration changes |
| **Live Log** | Multi-panel SSE log stream, filter by service |
| **Access Control** | MAC whitelist/blacklist |
| **Network Diagnostics** | Ping / Traceroute (streaming output) |
| **Metrics Snapshot** | Full performance and status metrics (JSON) |
| **Log Rotation** | Auto-rotation by size/days/backups |
| **System Tray** | Background mode with tray icon |

---

## Deployment Modes

| Mode | Description |
|------|-------------|
| **Server** | Standalone server mode, for production |
| **App** | Application mode, for dev and testing |
| **systemd** | Linux service mode, auto-start on boot |
