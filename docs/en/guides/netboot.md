# Netboot Catalog (OS Install Catalog)

> A built-in install menu for 64+ mainstream distributions: the client picks a system after booting and installs. No ISOs to prepare — catalog entries download their own boot files.

**Docs**: [Boot Menu Config](boot-config.md) | [OS Images](os-images.md) | [Answer Templates](answer-templates.md)

---

## When to Use

- Want **out-of-the-box mass installation** (Ubuntu, Debian, CentOS, Windows…) → confirm the catalog is enabled; clients pick a system at boot
- Only want to show **some systems**, or reorder the menu → group management
- A distro needs **custom kernel parameters** → overlays
- Repeat boots are slow → enable local caching

Entry: **Basic Config → Service Config → OS Install Catalog**; or **Settings → Netboot** (global switch) at the bottom of the sidebar.

## Task 1: Make sure the catalog is enabled

On the OS Install Catalog page, confirm the "**enabled**" toggle is on (default). Once enabled, the client boot menu shows the **[OS] Netboot OS Install Catalog** entry.

## Task 2: Group management

The catalog is organized into groups (Linux Distributions, Windows, System Tools, Live CDs, etc. — 10 groups), supporting:

- **Enable/disable groups** — hide whole categories you don't need
- **Custom titles** — rename groups
- **Drag-and-drop ordering** — reorder groups

## Task 3: Overlays (per-distro customization)

Customize boot parameters for a specific distro without touching defaults:

- Entry: OS Install Catalog page → distro → overlay config (or API `PUT /api/v1/netboot/overlays/{distro}`)
- Configurable: mirror, local base path, kernel params, version overrides
- Use cases: speed up with an internal mirror, append boot parameters for one distro

## Task 4: Local caching

Settings → Netboot → **Local cache** (on by default):

- Downloaded boot files land on disk; repeat boots don't hit the internet again
- The page shows cache path, file count, and disk usage live
- Cache stats API: `GET /api/v1/netboot/cache-stats`

## Related Features

| Want to… | Go to |
|----------|-------|
| Unattended installs (answer files) | [Answer Templates](answer-templates.md) |
| Track install progress | [Install Tasks](install-tasks.md) |
| Upload your own ISOs / images | [OS Images](os-images.md) |
| Fully custom menus | [Boot Menu Config](boot-config.md) |
