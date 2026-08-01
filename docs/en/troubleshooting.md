# Troubleshooting & FAQ

> Common issues, log analysis, and FAQ.

**Docs**: [Web UI Guide](guides/web-ui.md) | [Config Reference](reference/config-file.md)

---

## Common Issues

| Symptom | Possible Cause | Troubleshooting Steps |
|---------|---------------|----------------------|
| Client can't PXE boot | DHCP not configured / network unreachable | 1. Check if PxeLab is running 2. Check client and server are on same VLAN 3. Check firewall allows UDP 67 |
| Client boots directly to local disk | Default menu only has local entry | Check default menu config, ensure network boot entries exist |
| Client can't see install catalog | Netboot not enabled | Check "Enable OS install catalog menu" and "Profile menu behavior" |
| DHCP Offer rejected by UEFI firmware | Missing Option 53 | Ensure PxeLab version includes Option 53 fix |
| iPXE reboot loop | PXE_STACK cache issue | Already fixed by PxeLab's custom iPXE build (PXE_STACK disabled) |
| vmxnet3 virtual NIC boot failure | TXE:1 compatibility issue | Use undionly.kpxe (UNDI interface) |
| Config changes not taking effect | Browser cache | Hard refresh (Ctrl+F5) |
| NFS mount fails (Windows) | Path separator issue | Ensure using latest PxeLab version (path.Clean fixed) |
| DNS not resolving | Upstream DNS not configured | Check upstream field in DNS settings |

---

## Log Analysis

```bash
# View real-time logs
# Web UI: Logs page → Select service filter

# Or check log files
tail -f ~/.pxelab/logs/pxelab.log

# Filter by service
grep "DHCP" ~/.pxelab/logs/pxelab.log
```

---

## Network Diagnostics

Built-in network diagnostics in Web UI:
- **Ping** — Test network connectivity
- **Traceroute** — Trace route path
- Supports streaming output, real-time results

API:
```bash
# Ping
curl -X POST http://localhost:8080/api/v1/network/ping \
  -H "Content-Type: application/json" \
  -d '{"host": "192.168.1.1", "count": 4}'

# Traceroute
curl -X POST http://localhost:8080/api/v1/network/traceroute \
  -H "Content-Type: application/json" \
  -d '{"host": "192.168.1.1"}'
```

---

## Common Questions (Failure-type)

> For conceptual questions (what something is, how to choose, upgrade/backup), see [FAQ](faq.md).

### Q: Client can't get IP address?

**A:** Checklist:

1. Is DHCP service running: `curl localhost:8080/api/v1/services | jq '.[] | select(.name|startswith("dhcp")) | .status'`
2. Is port 67 occupied: `netstat -tlnp | grep :67`
3. Are firewall rules allowing it: `iptables -L -n | grep 67`
4. Is network interface configured correctly

### Q: Client gets IP but can't boot?

**A:** Checklist:

1. Is TFTP service running
2. Do boot files exist: `ls -la /path/to/pxelinux.0`
3. Are next-server and boot-file configured correctly
4. Are client and server on the same subnet

### Q: How to view detailed logs?

**A:** Enable debug mode:

```bash
./pxelab --log-level debug
```

Or in Web UI: **Settings → Logs → Log Level → Debug**
