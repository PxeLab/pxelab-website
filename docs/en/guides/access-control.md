# Access Control

> Control which devices may join the network boot system by MAC address. Black/whitelists take effect at DHCP assignment time.

**Docs**: [DHCP Config](dhcp.md) | [Host Management](host-management.md)

---

## When to Use

- Only **registered devices** may join → whitelist
- Block **specific devices** (decommissioned, suspicious) → blacklist
- First observe **what's on the network** → unauthorized device list

Entry: **Management → Access Control** (`/access-control`).

## Rule Logic

| List | Behavior | Scenario |
|------|----------|----------|
| **Whitelist** | Only listed MACs can get an IP | Strict device control |
| **Blacklist** | Listed MACs are denied | Block specific devices |
| **Unauthorized** | Devices in neither list | Monitor and audit; add to either list in one click |

> Subnets also have their own "subnet whitelist" (in DHCP config): when the global whitelist is on, the subnet whitelist is forced on; subnets can tighten policy individually.

## Task 1: Add to the blacklist

Blacklist tab → Add: enter MAC and reason (e.g. "decommissioned"). The device can no longer get an IP from DHCP.

## Task 2: Add to the whitelist

Whitelist tab → Add: MAC + subnet + reason. To admit only whitelisted devices, turn on the global whitelist toggle.

## Task 3: Handle unauthorized devices

The Unauthorized tab lists devices in neither list:

- **Add to whitelist** — admit the device
- **Add to blacklist** — block the device
- **Delete the record** — ignore it (it will be re-recorded next time it appears)

## Notes

- In whitelist mode, a device you forgot to add **gets no IP** — add the list first, then flip the global toggle
- Combine with [Host Management](host-management.md): when registering hosts, add their MACs to the whitelist in the same pass
