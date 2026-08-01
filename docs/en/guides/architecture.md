# Architecture

> PxeLab's system composition, boot flow, and key design decisions.

**Docs**: [Features](../features.md) | [Boot Architecture & Diskless](boot-architecture.md) | [Deployment](deployment.md)

---

## Service Architecture

PxeLab is a single binary whose internals are organized per service, coordinated by a service manager:

```
┌─────────────────────────────────────────────────────┐
│                    PxeLab Binary                     │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│  HTTP    │  DHCP    │  TFTP    │  DNS     │  NFS    │
│  :8080   │  :67     │  :69     │  :53     │  :2049  │
│  TCP     │  UDP     │  UDP     │  UDP     │  TCP    │
├──────────┴──────────┴──────────┴──────────┴─────────┤
│              Service Manager (lifecycle)             │
├─────────────────────────────────────────────────────┤
│  SQLite (pxelab.db)  │  Event Bus  │  Log Bus      │
├─────────────────────────────────────────────────────┤
│              Config (config.yaml)                    │
└─────────────────────────────────────────────────────┘
```

| Service | Default port | Protocol | Auto-start | Purpose |
|---------|--------------|----------|------------|---------|
| HTTP | 8080 | TCP | ✅ | Web UI + API + boot file service |
| DHCP | 67 | UDP | per config | IP assignment + PXE options |
| ProxyDHCP | 4011 | UDP | per config | PXE options only (overlay mode) |
| TFTP | 69 | UDP | ❌ | NBP file transfer |
| DNS | 53 | UDP | ❌ | Local DNS resolution |
| NFS | 2049 | TCP | ❌ | NFSv3 file sharing |

Each service starts/stops independently; config changes hot-reload in most cases — no process restart needed.

---

## Two-Stage Network Boot

The PXE ROM is limited, so PxeLab uses a two-stage boot to upgrade it to full-featured iPXE:

```
Stage 1                           Stage 2
┌─────────────┐   TFTP/HTTP    ┌──────────┐   HTTP     ┌──────────────┐
│  PXE ROM    ├───────────────►│  iPXE    ├───────────►│   Boot Menu  │
│  (BIOS/UEFI)│  undionly.kpxe │  (custom │  /boot/    │  (kernel+initrd│
│             │  /ipxe.efi     │  build)  │  ipxe/     │   /WIM/Chain │
└─────────────┘                │          │  script    │   /Local)    │
                               └──────────┘           └──────────────┘
```

**Stage 1**: the client PXE ROM sends a DHCP request → PxeLab responds with IP, next-server, and the NBP file name → the client downloads the NBP (e.g. `ipxe.efi`) over TFTP and executes it.

**Stage 2**: iPXE runs its embedded script (`dhcp` → `chain http://server:8080/boot/ipxe/script`) → fetches the boot menu from PxeLab → the user picks a boot entry (install a system, boot local disk, etc.).

Step-by-step details (PXELinux/GRUB2 compatibility, architecture mapping, sanboot diskless): [Boot Architecture & Diskless](boot-architecture.md).

---

## Key Design Decisions

| Decision | Approach | Payoff |
|----------|----------|--------|
| **Single binary** | Go static build; frontend and boot files embedded | Zero dependencies, one file to deploy; upgrades = replace one file, no path/permission issues |
| **Service manager** | Every service implements a common lifecycle interface | Independent start/stop, graceful shutdown, config hot-reload |
| **Event bus** | Services decouple via publish/subscribe (DHCP leases, boot events, WOL, etc.) | Loose coupling, easy extension, auditable logging |
| **Store interface** | Data layer is interface-based: SQLite and in-memory implementations | In-memory for fast isolated tests; SQLite for lightweight reliable production |
| **Dependency injection** | All service dependencies constructed explicitly at the entry point | Clear dependency graph, no global singletons, easy testing |
| **Modern frontend** | React + CSS variable theming + route-level code splitting | Dark/light themes across all components, fast first paint |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go 1.25+ (chi router, SQLite/GORM) |
| Frontend | React 19 + TypeScript + Tailwind CSS 4 + Vite |
| Packaging | GoReleaser (multi-platform binaries) |
