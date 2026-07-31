# Tutorial 2: Layer PXE onto an Existing DHCP Network

> ⏱ Time: 10 minutes ｜ Level: Intermediate ｜ Audience: You already have a DHCP server on your network and want to add network boot
> Prerequisites: PxeLab is running (see [Getting Started](../getting-started.md)), a computer that supports network boot, and Layer-2 connectivity between the client and PxeLab

---

## The Scenario

Your company network already has a DHCP server (e.g., the gateway at `192.168.1.1` doubles as one), and all devices are online. You want to add PXE network boot to the network — say, to install systems on a few machines — without touching the existing DHCP or disturbing any devices.

That's exactly what **proxy mode** is for: **IP addresses are still assigned by the existing DHCP server; PxeLab only supplies the PXE boot information**.

```
Existing DHCP (192.168.1.1)          PxeLab (192.168.1.100)
      │                                │
      ├─ assigns IP ──► client ◄── boot info (proxy, port 4011)
```

---

## Preparation

- PxeLab server IP (example: `192.168.1.100`), on the **same Layer-2 network** as the clients (proxy relies on broadcasts; cross-VLAN requires DHCP relay)
- Your existing subnet (example: `192.168.1.0/24`)
- A client that supports PXE network boot

---

## Step 1: Add an interface and choose proxy mode

Go to **Basic Config → Service Config → DHCP**, click **Add Interface** in the top-right corner, and fill in:

| Field | Example value |
|-------|---------------|
| Interface name | `eth0` (or pick a detected NIC from the list) |
| IP address | `192.168.1.100` (the PxeLab server's IP) |
| Subnet 1 → Subnet CIDR | `192.168.1.0/24` (your existing subnet) |
| Subnet 1 → DHCP mode | `proxy (Proxy DHCP)` |

**Leave address pool, gateway, and DNS empty** — proxy mode doesn't assign IPs, so these fields are not needed (the UI will tell you).

Save.

## Step 2: Make sure ProxyDHCP is running

Check the **service status bar** at the top: `ProxyDHCP` (port 4011) should show "running"; if not, start it.

## Step 3: Boot the client and enter network boot

Power the client on, enter its boot menu (F12 / F11 / Esc), and choose **network boot**.

Boot now has two cooperating sources:

1. The existing DHCP server assigns the client its IP
2. PxeLab supplies the boot file location and boot information

If all is well, the PxeLab boot menu appears within a few seconds — from here on, the flow is identical to Tutorial 1 (pick the OS Install Catalog, install, etc.).

## Step 4: Verify

- The client got an IP (from the existing DHCP) **and** the PxeLab boot menu appeared — both together mean success
- Everything else on the network keeps working as before (proxy mode ignores non-PXE clients)

---

## Common issues in this tutorial

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Client gets an IP but no boot menu | Layer-2 unreachable / UDP 4011 blocked | Confirm client and PxeLab are on the same subnet; allow UDP 67/4011 |
| No menu, and PXE option conflict on DHCP | The existing DHCP also serves PXE options | Disable PXE/boot options on the existing DHCP (keep IP assignment) |
| No response from clients across VLANs | Proxy mode relies on broadcasts | Configure DHCP relay on the switch/router for the client subnet, pointing to PxeLab |

---

## Going further

- **Protocol differences between proxy and server** (Option 60, yiaddr=0 recognition): see [DHCP Modes](../guides/dhcp-modes.md)
- **The full install flow**: [Tutorial 1: Install Ubuntu on a Bare Metal Machine](install-ubuntu.md)
