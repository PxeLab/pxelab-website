# PXELinux Compatibility & Migration

> How to keep using existing pxelinux.cfg assets and how to migrate smoothly to the iPXE world.

**Docs**: [Boot Architecture & Diskless](boot-architecture.md) | [Boot Config](boot-config.md)

---

## Background: What PXELinux Is

PXELinux (of the SYSLINUX family) is the classic boot scheme for traditional PXE environments: a `pxelinux.cfg` text configuration describes the boot menu — `DEFAULT` default entry, `TIMEOUT`, `LABEL` menu entries, `KERNEL/APPEND` kernels and parameters. Many older server rooms hold their boot assets as pxelinux.cfg files.

PxeLab offers two paths:

1. **Keep compatibility**: use PXELinux as the boot method directly — existing pxelinux.cfg assets keep working
2. **Migrate to iPXE**: one-click redirect, or gradually translate configs into Profile menus

---

## Path 1: Keep Using PXELinux

PxeLab ships a PXELinux config file parser (supporting `default`, `label`, `kernel`, `append`, `initrd`, `ipappend`, `menu label/default`, `timeout`, `ontimeout`, `onerror`, etc.).

When a client boots via `pxelinux.0` / `pxelinux.efi`, PxeLab answers config requests in this priority:

1. **Chain redirect**: if the subnet has "Chain to iPXE" enabled → return a redirect config that hands over to iPXE
2. **Profile generation**: if there is a default Profile (or a host matches by MAC) → render the Profile menu into PXELinux syntax on the fly
3. **Static file fallback**: no Profile → serve the static files in the boot directory (`pxelinux.cfg/default`, etc.)

So **even without migrating, old configs and mixed environments work** — PXELinux clients use PXELinux, iPXE clients use iPXE.

---

## Path 2: Migrate to iPXE

### Quick migration: enable "Chain to iPXE"

In **Basic Config → Service Config → DHCP → subnet config**, enable "**Chain to iPXE**".

From then on, PXELinux/GRUB2 clients requesting config get a redirect snippet (PXELinux receives `KERNEL http://server/boot/ipxe.efi`) that loads iPXE automatically and lands in the PxeLab boot menu.

Good for: environments that want to unify on iPXE immediately without translating configs one by one. **Zero effort and reversible** — disabling the toggle restores the previous behavior.

### Gradual migration: pxelinux.cfg → Profile menu

Translate key boot entries into PxeLab Profiles (**Basic Config → Boot Menu**). Syntax mapping:

| pxelinux.cfg | PxeLab Profile menu |
|--------------|---------------------|
| `DEFAULT ubuntu` | default menu entry (is_default) |
| `TIMEOUT 50` | menu timeout (0.1 s × 50 = 5 s) |
| `LABEL ubuntu` / `MENU LABEL Install Ubuntu` | menu entry name |
| `KERNEL vmlinuz` / `INITRD initrd.img` | boot type `direct` + kernel/initrd files |
| `APPEND net.ifnames=0` | boot parameters (cmdline) |
| `KERNEL memdisk` + `APPEND initrd=xxx.iso` | boot type `chain` (Memdisk ISO) |
| `KERNEL http://.../ipxe.efi` (chain-load) | boot type `chain` (load iPXE) |
| `LOCALBOOT 0` | boot type `local` |

Once translated, bind the Profile to hosts (or make it the default menu), and clients use the new menu on their next boot. Both formats can coexist during migration: PXELinux clients keep reading old configs while iPXE clients use the new menu.

---

## When to Migrate

| Situation | Suggestion |
|-----------|------------|
| Lots of pxelinux.cfg assets, no appetite for change | Path 1 (compat); enable chain redirect when needed |
| Want to unify on iPXE (faster HTTP boot, richer menus) | Path 2 quick migration (flip the toggle) |
| Want visual config, versioning, per-host binding | Gradual migration to Profiles (final state) |

---

## FAQ

**Q: PXELinux clients fail to load after enabling "Chain to iPXE"?**
Check the iPXE boot file is reachable: the `KERNEL http://server/boot/ipxe.efi` address returned by `pxelinux.cfg` must be accessible (HTTP service running).

**Q: Some legacy config syntax isn't supported?**
The parser covers common syntax; unsupported constructs are ignored. For heavy customizations, migrate to Profiles or a custom iPXE script (Settings → Boot Menu → Custom iPXE Script).
