# Settings

> The "Settings" button at the bottom of the sidebar opens a full-screen modal with 5 sections of global configuration. Most changes take effect immediately or hot-reload after saving.

**Docs**: [Config File Reference](../reference/config-file.md) | [Logging Reference](../reference/logging.md) | [Netboot Catalog](netboot.md)

---

## General

| Setting | Meaning |
|---------|---------|
| Server name | Display name in UI and services |
| Listen address | e.g. `:8080` |
| Data directory | Where PxeLab stores its data |
| API Token | Access token for remote API calls (copy / regenerate) |
| Page size | Default pagination for list pages |

## Boot Menu

Default boot menu config (shown when a host has no Profile and the catalog redirect is off):

- Menu title (default `PxeLab Boot Menu`)
- Timeout (0 = no auto-select)
- Default entries: add/remove/reorder, with type and parameter config

## Netboot

- **Enable/disable** the OS Install Catalog
- **Catalog redirect** config (whether Profile-less clients jump straight to the catalog)
- **Catalog menu structure**: group ordering, enable/disable, title editing
- **Custom iPXE script**: fully replaces visual configuration (advanced)
- **Local cache** toggle and cache stats
- **Failure prompt** toggle

## Service Auto-Start

Per-service auto-start toggles (HTTP/DHCP/TFTP/DNS/NFS) — **effective immediately**, no save button. After a server restart, services start per this config.

## Logging

- Log level (debug / info / warn / error)
- Log file path
- **Rotation**: max file size, backups kept, retention days, gzip compression
- Cleanup check interval

Rotation and troubleshooting details: [Logging Reference](../reference/logging.md).
