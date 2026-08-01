# Settings

> The "Settings" button at the bottom of the sidebar opens a full-screen modal with 6 sections of global configuration: General, Boot Menu, Netboot, Service Auto-Start, Logging, About. Most changes take effect immediately or hot-reload after saving.

**Docs**: [Config File Reference](../reference/config-file.md) | [Logging Reference](../reference/logging.md) | [Netboot Catalog](netboot.md)

---

## General

| Setting | Meaning |
|---------|---------|
| Server name | Display name in UI and services |
| Log level | debug / info / warn / error |
| Listen address | e.g. `:8080` |
| Data directory | Where PxeLab stores its data |
| API Token | Access token for remote API calls (copy / regenerate) |
| Page size | Default pagination for list pages |

## Boot Menu

Default boot menu config (shown when a host has no Profile and the catalog redirect is off):

- **Custom iPXE script**: once filled, fully replaces all visual configuration (advanced)
- **Timeout** (0 = no auto-select)
- **List all Profiles**: the default menu shows every Profile (otherwise only the default Profile's entry)

> The menu entries themselves are managed in the default Profile (**Basic Config → Boot Menu**); the title is fixed at `PxeLab Boot Menu`.

## Netboot

- **Enable/disable** the OS Install Catalog
- **HTTPS proxy**: catalog downloads go through the local HTTPS proxy
- **Local cache** toggle and cache stats (file count / disk usage)
- **Catalog title**: display title of the OS Install Catalog menu
- **Catalog redirect** config (whether Profile-less clients jump straight to the catalog, incl. target URL and preamble script)

> Group ordering and group enable/disable are configured via `catalog_display.groups` in `config.yaml`; only the title is editable in the UI.

## Service Auto-Start

Per-service auto-start toggles (HTTP/DHCP/TFTP/DNS/NFS) — **effective immediately**, no save button. After a server restart, services start per this config.

## Logging

- Log file path (read-only display)
- **Rotation**: max file size, backups kept, retention days, gzip compression
- Cleanup check interval
- **Disk usage**: current log file list and total size, with a one-click **clean now** button

Rotation and troubleshooting details: [Logging Reference](../reference/logging.md).
