# Service Config

> One place to manage the six network services: DHCP, DNS, NFS, TFTP, Boot Options, OS Install Catalog. Almost every network behavior is configured here.

**Docs**: [DHCP Config](dhcp.md) | [UI Overview](web-ui.md) | [Deployment](deployment.md)

---

## When to Use

- Clients **can't get an IP / can't boot** → check DHCP and Boot Options here
- Tuning **DNS resolution, file sharing, boot files** → all in this group
- Entry: **Basic Config → Service Config** (the six sub-pages are in the nested sub-nav)

## Sub-Page Cheat Sheet

### DHCP (/services/dhcp)

Interface and subnet management: each interface can host one or more subnets with independent DHCP modes (server / proxy / off), address pool, gateway, DNS, lease time; three tabs: **Subnets / Leases / Reservations**.

See [DHCP Config](dhcp.md).

### DNS (/services/dns)

Local DNS resolution: upstream forwarding, local domain, A / AAAA / CNAME records, subnet-aware resolution.

See [DNS Service Reference](../reference/dns.md).

### NFS (/services/nfs)

Network file sharing: multiple mount points (label, export path, local dir, read-only, IP/CIDR whitelist), connection status and client list, port config.

See [NFS Service Reference](../reference/nfs.md).

### TFTP (/services/tftp)

Boot file service: port and timeout settings, root directory, pxelinux/grub config file paths. Boot file upload, delete and browsing live in [File Manager](files.md); client architecture → boot file mapping lives in **Boot Options (/boot-settings)**.

See [TFTP Service Reference](../reference/tftp.md).

### Boot Options (/boot-settings)

Architecture mapping management: client architecture → boot file mapping table (with Secure Boot support status), boot file health check, NBP type switching, iPXE script settings.

See [Architecture Mapping & Secure Boot](../reference/boot-settings.md).

### OS Install Catalog (/netboot-catalog)

Built-in distribution install menu: distro enable/disable, overlay config, per-version local file status; group titles and ordering are configured via `catalog_display.groups` in `config.yaml`. Local cache stats (file count / disk usage) are shown in **Settings → Netboot → Local Cache**.

See [Netboot Catalog](netboot.md).

## Service Status & Start/Stop

The **service status bar** at the top shows all six services' run states and ports:

- Start / stop / restart each service individually, or all at once
- HTTP is the core service and cannot be stopped
- After config changes that require a restart, just restart the service from the bar
