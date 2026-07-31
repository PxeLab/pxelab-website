# Boot Menu Config

> Decide what clients see after booting and what they can start. Visual iPXE-based configuration — no hand-written scripts needed.

**Docs**: [Profile Operations](profiles.md) | [Netboot Catalog](netboot.md) | [Architecture Mapping & Secure Boot](../reference/boot-settings.md)

---

## When to Use

- Clients **jump straight to the OS Install Catalog** (default behavior) → nothing to configure; just confirm the catalog is enabled
- Want a **custom menu** (install a system, boot local disk, diskless boot, etc.) → create Profiles
- A specific machine should **always install a specific system** → bind a Profile to its MAC
- Don't want the catalog redirect; full control of the menu → configure the default menu

## The Boot Decision Chain

When a client requests a boot script, PxeLab answers in this order:

```
1. Custom iPXE script set?   → return it directly, ignore everything below
2. Host has a Profile?       → return that Profile's menu
3. Catalog redirect enabled? → jump to the Netboot OS Install Catalog
4. None of the above         → return the default boot menu
```

## Boot Types

| Type | Use | Example |
|------|-----|---------|
| `direct` | Load kernel + initrd directly | Linux install |
| `chain` | Chain-load another bootloader/ISO | GRUB2, Memdisk ISO |
| `sanboot` | iSCSI SAN boot | Diskless workstations |
| `wds` | Windows WIM boot | Windows PE / install |
| `local` | Boot from local disk | Default fallback |

## Task 1: Create a Profile

Entry: **Basic Config → Boot Menu (Profiles)** → New. A Profile is one boot entry:

| Field | Meaning |
|-------|---------|
| Profile name | Shown in the menu |
| Architecture | Target client architecture |
| Boot type | One of the five above |
| Kernel path / Initrd path | For `direct` type (e.g. `vmlinuz` / `initrd.img`) |
| Command line | Kernel parameters (e.g. `net.ifnames=0 console=tty0`) |
| URL | Target address for `chain` / `sanboot` (e.g. `iscsi:192.168.1.50::::iqn.2024-01:disk`) |

Every edit saves a **version snapshot** automatically — diff and roll back to any version.

## Task 2: Bind to a host

**Management → Host Management** → open the host → associate the Profile. Once bound, that machine skips the default flow and boots straight into its Profile.

## Task 3: Configure the default menu

**Settings** (bottom of the sidebar) → **Boot Menu**:

- **Menu title** (default `PxeLab Boot Menu`)
- **Timeout**: 0 = no auto-select; >0 = auto-select the default entry after timeout
- **Entries**: add the boot items you need (local, Profiles, etc.)

> Note: the default menu only appears when the host has no Profile AND the catalog redirect is off.

## Task 4: Full customization (custom iPXE script)

**Settings → Netboot → Custom iPXE Script**: once filled, it **fully replaces** all visual configuration (advanced). Available template variables:

<v-pre>

```
{{.URL}}         Server URL (e.g. http://192.168.1.10:8080)
{{.MAC}}         Client MAC address
{{.NextServer}}  Server IP (without port)
```

</v-pre>

## FAQ

**Q: Clients boot straight into the OS Install Catalog and never see the default menu?**
The catalog redirect is on by default. Disable "redirect" in **Service Config → OS Install Catalog** (or Settings → Netboot).

**Q: A Profile change has no effect?**
Make sure it's saved; bound hosts use the Profile menu — check the host's association on its detail page.
