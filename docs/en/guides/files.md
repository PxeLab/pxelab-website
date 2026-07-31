# File Manager

> Visual management of the boot file directory: upload, delete, browse. Boot files are the first step of client PXE boot — a missing one causes "got an IP but can't boot".

**Docs**: [TFTP Service](../reference/tftp.md) | [Service Config](services.md)

---

## When to Use

- Clients **fail to boot with a "boot file not found"** error → check/upload the matching file here
- Want a **custom NBP** (self-compiled iPXE, etc.) → upload to the boot directory
- Check file integrity → look at MD5 and size

Entry: **Basic Config → File Manager** (`/files`).

## Task 1: Upload files

Click **Upload File** and pick a local file. It appears in the list immediately and is reachable over TFTP/HTTP.

Common boot files and their uses:

| File | Use |
|------|-----|
| `undionly.kpxe` / `ipxe.pxe` | BIOS x86 iPXE NBP |
| `ipxe.efi` / `ipxe32.efi` / `ipxe-arm64.efi` | iPXE NBP per UEFI architecture |
| `pxelinux.0` / `pxelinux.efi` | PXELinux boot |
| `grubx64.efi` / `grubaa64.efi` | GRUB2 boot |

> Which boot file each client architecture needs is shown in the architecture mapping table at **Service Config → Boot Options**; the page prompts you to upload missing ones.

## Task 2: Delete files

Delete from the row actions. Make sure no client still uses a file before deleting — removing an in-use NBP breaks booting.

## Task 3: Browse the boot directory

The file list is a visual browse of the boot root directory. For large files like ISOs, prefer [OS Images](os-images.md) (mount support).
