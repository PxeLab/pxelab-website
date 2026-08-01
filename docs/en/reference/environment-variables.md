# Environment Variables & CLI Reference

> CLI parameters, configuration priority, and data directory structure for PxeLab.

**Related**: [Config File Reference](config-file.md) | [Deployment](../guides/deployment.md)

---

## CLI Parameters

```
pxelab [flags]

Flags:
  --config string       Config file path
  --data-dir string     Data directory (default "~/.pxelab")
  --log-level string    Log level: debug/info/warn/error (default "info")
  --mode string         Run mode ("app" auto-opens browser)
```

> `--data-dir` and `--log-level` override the `global.data_dir` and `log.level` config items.

---

## Configuration Priority

CLI parameters > Config file > Default values

| Priority | Source | Description |
|----------|--------|-------------|
| 1 (Highest) | `--config` / `--data-dir` / `--log-level` CLI parameters | Explicitly specified on command line |
| 2 | `config.yaml` | Config file (path from `--config`, otherwise searched in order) |
| 3 (Lowest) | Built-in defaults | Hardcoded default values |

> Note: PxeLab does **not** read any `PXELAB_*` environment variables. All settings are managed via CLI parameters and the config file.
> The default data directory is only affected by the system user home directory (`$HOME` / Windows `USERPROFILE`).

---

## Data Directory Structure

The default data directory is `~/.pxelab/` (changeable via `--data-dir` or `global.data_dir`):

```
~/.pxelab/
├── config.yaml          # Config file (settings are written back here on save)
├── pxelab.db            # SQLite database
├── boot/                # Boot file root (iPXE, PXELinux, GRUB2 binaries)
│   ├── isos/            # Extracted OS images (HTTP /boot/isos/*, default NFS export)
│   ├── ipxe.efi
│   ├── undionly.kpxe
│   └── ...
├── isos/                # OS image upload storage
│   └── mnt/             # Image mount directory (isos/mnt/<id>)
├── netboot/             # Netboot catalog
│   ├── catalog/         # Distro index
│   ├── menu/            # Generated boot menus
│   └── scripts/         # Distro scripts
├── cache/
│   └── netboot/         # Catalog file cache
└── logs/                # Log files (default data_dir/logs/pxelab.log)
    └── pxelab.log
```
