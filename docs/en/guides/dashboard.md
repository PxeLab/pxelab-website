# Dashboard

> The home dashboard gives a global overview, auto-refreshing every 5 seconds: are the services healthy, what's the traffic, which machines are booting.

**Docs**: [Getting Started](../getting-started.md) | [Host Management](host-management.md) | [Service Config](services.md)

---

## When to Use

- The first page you see when opening PxeLab — check service health and overall system state
- Watch live during installs/boots: hosts coming online, event stream, traffic curves

## Stat Cards

The top row shows 5 core metrics:

| Card | Data source | Meaning |
|------|-------------|---------|
| Online hosts | `hosts.last_online` | Hosts with activity in the last 10 minutes |
| Running services | `GET /api/v1/services` | Count of services with status=running |
| Active leases | `GET /api/v1/metrics` (JSON snapshot) `services.dhcp.dhcp.activeLeases` | Current active DHCP lease count |
| DNS records | `GET /api/v1/dns/records` | Total DNS record count |
| Boots today | events (type=BOOT, today) | BOOT events today |

## Service Status Bar

Shows the run state (green/yellow/red dot) and port of all five services: DHCP / TFTP / HTTP / DNS / NFS.

## Charts

- **Traffic trend** — TFTP / HTTP / NFS bandwidth, switchable between 5m / 30m / 1h windows
- **HTTP status distribution** — pie chart of 2xx / 3xx / 4xx / 5xx shares
- **DHCP architecture distribution** — pie chart of client architectures (x86 BIOS / EFI x86-64 / ARM64, etc.)
- **Recent events** — the latest 12 events with type tags (DHCP / TFTP / HTTP / BOOT / IPMI / DNS)

## Online Hosts List

Hosts that booted recently, with online status dots.
