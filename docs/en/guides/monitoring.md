# Monitoring

> Three pages to see through the system: Event Log (what happened), Audit Log (who changed what), Live Log (what the services are saying).

**Docs**: [Logging Reference](../reference/logging.md) | [Dashboard](dashboard.md) | [Network Diagnostics](network-diagnostics.md)

---

## When to Use

- **Debugging a client boot** → Event Log (watch the DHCP/TFTP/HTTP/BOOT event stream)
- Find out **who changed the config** → Audit Log
- **Service error debugging** → Live Log (filter by service)

## Event Log (Monitoring → Event Log)

- **SSE live stream**: new events push instantly; pause/resume supported
- **Type filters**: All / DHCP / TFTP / HTTP / BOOT / WOL / IPMI
- Entries show: time, type (colored tag), MAC, message
- Fullscreen mode available

Typical use: when a client fails to boot, open the Event Log, filter `DHCP` + `BOOT`, and see where the chain breaks.

## Audit Log (Monitoring → Audit Log)

Tracks every config change:

- Columns: time, operation (create/update/delete), resource type, resource name, operator IP, change details
- Detail example: `Name: A→B; Architecture: x86_64→arm64`

Use for multi-person change audits and retrospection.

## Live Log (Monitoring → Live Log)

- **SSE live stream**, multi-panel, filter by service, color-coded per service
- **Historical log files** list and **disk usage** stats
- **Manual cleanup** of old logs

Log levels, rotation, etc.: [Logging Reference](../reference/logging.md).
