# Network Diagnostics

> Built-in Ping and Traceroute: debug connectivity between clients and the server without leaving the web UI.

**Docs**: [Troubleshooting](../troubleshooting.md) | [Host Management](host-management.md)

---

## When to Use

- Client **boot failing**, suspect the network → Ping the target and watch packet loss
- Multi-subnet routing trouble → Traceroute to see which hop breaks

Entry: **Management → Network Diagnostics** (`/network`), two tabs.

## Ping

- Target host (IP or hostname)
- Parameters: count, packet size, TTL, interval, timeout, continuous mode
- **Streaming output**: live response for each packet
- **Summary stats**: sent/received/lost, RTT min/avg/max
- Selectable egress interface (which NIC to send from in multi-NIC setups)

## Traceroute

- Target host
- **Streaming output**: hop-by-hop route path
- Per hop: number, hostname, IP, probe times
- Selectable egress interface

## Example Diagnostics

| Symptom | Steps |
|---------|-------|
| Clients can't get an IP | Ping the client IP (if known); ping the gateway to confirm the link |
| Boot hangs midway | Traceroute to the PxeLab server; check the path and latency |
| Multi-VLAN unreachable | Traceroute across segments; locate the switch blocking the path |
