# DHCP Modes

PxeLab supports 3 DHCP modes, configured via the `dhcp` field in interface settings.

## Quick Reference

| Mode | Assigns IP | Provides PXE Options | Non-PXE Clients | Use Case |
|------|-----------|---------------------|-----------------|----------|
| **server** | ✅ | ✅ | ✅ Normal assignment | PxeLab as sole DHCP server (default mode) |
| **proxy** | ❌ yiaddr=0 throughout | ✅ | ❌ Ignored | Overlay onto existing DHCP |
| **off** | ❌ | ❌ | ❌ Ignored | DHCP fully disabled |

---

## Mode Details

### server (Full DHCP)

PxeLab acts as the **sole DHCP server** on the network, responding to all clients regardless of PXE requests. This is the default mode.

**Behavior:**
- Manages the full DHCP lifecycle: Discover → Offer → Request → Ack
- All clients receive IP addresses
- PXE clients additionally get NBP filename and boot script URL (Option 175.178)
- Non-PXE clients receive standard DHCP responses for normal networking

**Use Cases:**
- New networks where PxeLab is the only DHCP service
- Lab/test environments without existing DHCP infrastructure
- Isolated networks (no upstream DHCP server)

---

### proxy (Proxy DHCP)

PxeLab **only provides PXE-related options**. IP addresses are assigned by the existing DHCP server.

**Behavior:**
- Legacy BIOS and UEFI both use yiaddr=0.0.0.0
- Does not interfere with existing DHCP server address allocation
- Non-PXE clients are completely unaffected
- Does not consume address pool

**Use Cases:**
- Networks with existing DHCP servers needing PXE boot overlay
- When you don't want to change existing network infrastructure

---

### off (Disabled)

PxeLab **completely disables DHCP** on this interface, not processing any DHCP requests.

**Behavior:**
- Interface acts as if DHCP doesn't exist
- No DHCP responses sent
- Other services (HTTP/TFTP/DNS) on the same interface are unaffected

**Use Cases:**
- Interface only serves HTTP/TFTP boot files, DHCP handled by another device
- Temporarily disabling DHCP during conflict troubleshooting
- Management interfaces that don't need to provide DHCP

---

## Decision Flow

When a DHCP request is received, PxeLab determines the mode as follows:

```
DHCP Request Received
    │
    ├─ Is it a PXE/iPXE client?
    │   ├─ Yes → Check interface DHCP mode
    │   │       ├─ proxy → Handle as proxy mode
    │   │       ├─ server → Handle as server mode
    │   │       └─ off → Ignore
    │   │
    │   └─ No → Check interface DHCP mode
    │           ├─ server → Handle as server mode (assign IP)
    │           ├─ proxy → Ignore (non-PXE clients ignored in proxy mode)
    │           └─ off → Ignore
    │
    └─ Respond to client
```

## Deployment Examples

### Example 1: Existing Company DHCP, Overlay PXE

```
    Company DHCP        PxeLab
  192.168.1.1      192.168.1.100
       │                 │
       │                 │  dhcp: proxy
       │                 │  bootloader: ipxe
       │                 │
       │                 └── PXE clients get boot options
       │
       └── All clients get IPs
           Non-PXE clients unaffected by PxeLab
```

### Example 2: New Network, PxeLab Does Everything (Default)

```
    PxeLab (192.168.1.100)
       │
       │  dhcp: server (default)
       │  bootloader: ipxe
       │
       ├── PXE clients: IP + boot options
       ├── Regular clients: IP + network config
       └── No other DHCP conflicts
```

### Example 3: Dual Interface — Management + Business

```yaml
interfaces:
  - name: eth0       # Management
    ip: 10.0.0.1
    dhcp: server     # Management segment DHCP
    subnets:
      - cidr: 10.0.0.0/24
        pool: 10.0.0.100-10.0.0.200

  - name: eth1       # Business, PXE overlay
    ip: 192.168.1.100
    dhcp: proxy      # Don't interfere with company DHCP
    subnets:
      - cidr: 192.168.1.0/24
```

### Example 4: File Serving Only

```yaml
interfaces:
  - name: eth0
    ip: 192.168.1.100
    dhcp: off        # DHCP handled by other device
    tftp: true       # Only provide TFTP
    http: true       # Only provide HTTP
    bootloader: grub2
```

## Web UI Configuration

In the PxeLab interface, DHCP mode can be set independently for each interface: **Settings → Interfaces**, then the "DHCP Mode" dropdown for each interface.

> **Note:** Subnets under the same interface share that interface's DHCP mode. For different behaviors, use multi-interface configuration.
