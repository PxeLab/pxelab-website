# Boot Config (Profile Operations)

> A Profile is "one boot entry": the concrete config of a system or boot method. This page covers creating and managing Profiles; the decision chain and menu config live in [Boot Menu Config](boot-config.md).

**Docs**: [Boot Menu Config](boot-config.md) | [Host Management](host-management.md) | [Netboot Catalog](netboot.md)

---

## When to Use

- Want to add a **boot entry** ("Install Ubuntu 22.04", "boot from SAN", …) → create a Profile
- Want a Profile **used by a specific machine** → bind it to a host
- Broke a boot entry → roll back a version

Entry: **Basic Config → Boot Menu (Profiles)** (`/profiles`). The list shows name, architecture, default flag, and boot type.

## Task 1: Create a Profile

Click **New**:

| Field | Meaning |
|-------|---------|
| Profile name | Required, e.g. `Install Ubuntu 22.04` |
| Architecture | Target client architecture (x86_64 / arm64, etc.) |
| Boot type | `direct` / `chain` / `sanboot` / `wds` / `local` / `custom` |
| Kernel path / Initrd path | For `direct` type |
| Command line | Kernel parameters |
| URL | Target address for `chain` / `sanboot` |

Type meanings: see the boot types table in [Boot Menu Config](boot-config.md).

## Task 2: Create from the OS Install Catalog

Don't want to fill kernel/initrd by hand? Select a distro in the OS Install Catalog → "Create Profile" — PxeLab generates the Profile from the catalog entry automatically, no image paths to look up.

## Task 3: Version management

Every edit of a `custom`-type script saves a version snapshot:

- **History**: Profile detail → versions
- **Diff**: compare current vs. historical versions
- **Rollback**: restore any historical version with one click

Great for multi-person collaboration and change audits: break something? Roll back.

## Task 4: Set as default

Mark a Profile as "default" in the list: when no host binding and no catalog redirect apply, the default Profile appears as a boot entry (see the default menu config in [Boot Menu Config](boot-config.md)).
