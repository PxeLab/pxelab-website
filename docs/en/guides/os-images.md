# OS Images

> Upload, import, mount, extract, and browse ISO images — turning system images into bootable resources.

**Docs**: [Netboot Catalog](netboot.md) | [File Manager](files.md) | [REST API Reference](../reference/api-reference.md)

---

## When to Use

- Need **your own system images** (official ISOs, customized images) for network installs → upload/import
- Want to boot image content **directly without extraction** → mount the ISO
- Inspect image content → file browsing

Entry: **Basic Config → OS Images** (`/os-images`).

## Task 1: Upload / import

- **Upload**: drag-and-drop or pick an ISO to upload
- **Import from local path**: point at a file path on the server
- Automatic distro detection after import

## Task 2: Mount / unmount

Mount an ISO to make its content directly bootable via NFS/HTTP; unmount when done. Mount point tracking is automatic.

## Task 3: Browse files

Browse the mounted image's content; download individual files.

## Task 4: Reprocess

Re-run distro detection/parsing after metadata changes with "reprocess".

## API

All operations have REST endpoints (upload/import/mount/extract/reprocess/file download) — see [REST API Reference](../reference/api-reference.md).
