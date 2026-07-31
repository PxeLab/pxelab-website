# DHCP Config

> PxeLab's DHCP server supports three operating modes, configurable independently per network interface.

**Docs**: [Architecture](architecture.md) | [Boot Config](boot-config.md) | [Netboot Catalog](netboot.md)

---

## Three DHCP Modes

Each network interface (subnet) can independently set the DHCP mode:

| Mode | Assigns IP | PXE Options | Non-PXE Clients | Use Case |
|------|-----------|-------------|-----------------|----------|
| **server** | ✅ | ✅ | ✅ Normal assignment | Sole DHCP server (default) |
| **proxy** | ❌ yiaddr=0 | ✅ | ❌ Ignored | Overlay onto existing DHCP |
| **off** | ❌ | ❌ | ❌ Ignored | DHCP disabled |

### server Mode (Default)

PxeLab acts as the **sole DHCP server**, managing the entire DHCP lifecycle:

```
Client Discover → PxeLab Offer (IP + Gateway + DNS + PXE Options) → Request → Ack
```

Use case: New networks, lab environments, isolated networks.

### proxy Mode

PxeLab **only provides PXE-related options**, IP assigned by existing DHCP server:

```
Client Discover → Existing DHCP Offer (IP) + PxeLab ProxyOffer (PXE options, yiaddr=0)
```

Key parameters:
- `yiaddr=0.0.0.0` — Key indicator for iPXE to identify ProxyDHCP
- `Option 60 = "PXEClient"` — Required by UEFI PXE Base Code
- `siaddr` — Points to PxeLab (TFTP/HTTP server address)

Use case: Networks with existing DHCP servers, overlay PXE service.

### off Mode

Completely disables DHCP on this interface. Other services (HTTP/TFTP/DNS) are unaffected.

---

## Multi-Interface Deployment

Supports multi-NIC, multi-subnet configuration with independent DHCP modes:

```yaml
# Example: Management + Business interfaces
interfaces:
  - name: eth0          # Management
    ip: 10.0.0.1
    subnets:
      - cidr: 10.0.0.0/24
        dhcp: server     # Self-hosted DHCP
        pool: 10.0.0.100-10.0.0.200

  - name: eth1          # Business
    ip: 192.168.1.100
    subnets:
      - cidr: 192.168.1.0/24
        dhcp: proxy      # PXE overlay, don't interfere with company DHCP
```

---

## IP Reservations

Permanently bind a specific IP to a MAC address, ensuring critical devices always get the same IP:

- Web UI: **Service Config → DHCP → Reservations**
- API: `POST /api/v1/dhcp/reservations`
- Conflict detection: Auto-checks if IP is used by other reservations or active leases on create/edit
- Only available for server-mode subnets

---

## Access Control (Whitelist/Blacklist)

| List | Behavior | Use Case |
|------|----------|----------|
| **Whitelist** | Only listed MACs can get IPs | Strict device access control |
| **Blacklist** | Listed MACs are denied | Block specific devices |
| **Unauthorized** | Devices not in any list | Monitoring and auditing |

Web UI: **Management → Access Control**

Config supports pre-import from YAML seed files:

```yaml
blacklist_seeds:
  - mac: "AA:BB:CC:DD:EE:FF"
    reason: "Decommissioned device"

whitelist_seeds:
  - mac: "11:22:33:44:55:66"
    subnet: "10.0.0.0/24"
    reason: "Server zone"
```
