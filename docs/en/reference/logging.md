# Logging Configuration

> Log system configuration, rotation, and troubleshooting for PxeLab.

**Related**: [Config File Reference](config-file.md) | [Troubleshooting](../troubleshooting.md)

---

## Log Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `debug` | Detailed debug info | Development debugging, issue investigation |
| `info` | Normal operation info (default) | Production |
| `warn` | Warning messages | Needs attention but doesn't affect operation |
| `error` | Error messages | Issues requiring fix |

---

## Configuration

Configure in the `log` section of `config.yaml`:

```yaml
log:
  level: info                    # Log level
  format: text                   # text / json
  file: ""                       # Log file path (empty=default ~/.pxelab/logs/pxelab.log)
  max_size_mb: 100                # Max file size (MB), 0=unlimited
  max_backups: 5                  # Number of rotated files to keep, 0=unlimited
  max_age_days: 30                # Retention days, 0=unlimited
  compress: true                  # gzip compress old logs
  cleanup_interval: 24            # Cleanup check interval (hours), 0=no auto-cleanup
```

Web UI: **Settings → Log Management** (rotation changes require service restart)

---

## Log Files

- Default path: `~/.pxelab/logs/pxelab.log`
- Format: Text (one log entry per line)
- Contains: timestamp, level, service name, message
- Written to both stderr (terminal) and file

---

## Log Rotation

PxeLab has built-in log rotation supporting:

- **Size-based rotation**: Auto-rotate when file exceeds `max_size_mb`
- **Age-based cleanup**: Auto-delete logs older than `max_age_days`
- **Backup limit**: Keep up to `max_backups` rotated files
- **gzip compression**: Auto-compress old logs when `compress: true`

The Log Management UI also supports manual log cleanup (by retention days/backups).

---

## Log Troubleshooting

```bash
# View logs in real-time
tail -f ~/.pxelab/logs/pxelab.log

# Filter by service
grep "DHCP" ~/.pxelab/logs/pxelab.log
grep "TFTP" ~/.pxelab/logs/pxelab.log
grep "HTTP" ~/.pxelab/logs/pxelab.log

# Filter by level
grep "ERROR" ~/.pxelab/logs/pxelab.log

# Web UI
# Sidebar → Monitoring → Logs (real-time SSE stream)
```

---

## Service Metrics

PxeLab provides a metrics snapshot endpoint (JSON format, not Prometheus text format):

```
GET /api/v1/metrics
```

Returns a `services` map; each service includes:

- **Common metrics**: requests, errors, bytes in/out, active connections, rejected, request rate, error rate, bandwidth, latency (5-minute window)
- **DHCP extras**: Offer/Ack/Nak/Decline/Discover counts, active leases, architecture & platform breakdown
- **HTTP extras**: 2xx/3xx/4xx/5xx status counts, request duration

Services with registered metrics: `http`, `tftp`, `dns`, `dhcp`, `nfs`, `wol`.
