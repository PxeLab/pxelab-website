# TFTP Service

> TFTP service configuration and boot file management.

**Related**: [Architecture Mapping & Secure Boot](boot-settings.md) | [File Management](../guides/files.md) | [Boot Config](../guides/boot-config.md)

---

## Service Configuration

The TFTP service provides NBP (Network Bootstrap Program) file transfer:

| Config | Default | Description |
|--------|---------|-------------|
| Port | 69 | UDP |
| Timeout | 5 | Transfer timeout (seconds), 0=library default |
| Root directory | `~/.pxelab/boot/` | Boot file root directory |
| PXELinux config | `pxelinux.cfg/default` | PXELinux config file path |
| GRUB2 config | `grub2/grub.cfg` | GRUB2 config file path |

Web UI: **Services → TFTP** (`/services/tftp`)

The TFTP service automatically selects the correct boot file based on architecture mapping and returns it to the client. Boot files are embedded in binaries and released to the data directory on first run.

---

## Boot File Management

Boot file management is not inside the TFTP page. It lives on the separate **File Manager** page (left sidebar → **File Manager**, `/files`):

- **Upload files**: Manually upload custom boot files to the boot file root directory
- **Delete files**: Remove unwanted boot files
- **Browse directory**: Table view with name, size, modified time, MD5 hash

Architecture mapping (bootloader selection and Secure Boot chain) and boot file integrity check live on the **Boot Settings** page (`/boot-settings`); see [Architecture Mapping & Secure Boot](boot-settings.md).
