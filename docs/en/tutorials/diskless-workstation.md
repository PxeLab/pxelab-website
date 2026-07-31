# Tutorial 3: Build a Diskless Workstation (iSCSI sanboot)

> ⏱ Time: 20 minutes ｜ Level: Advanced ｜ Audience: Scenarios with many diskless workstations (server rooms, labs, thin clients)
> Prerequisites: PxeLab is running, an iSCSI storage (or a machine that can act as an iSCSI target), and clients that support network boot

---

## The Scenario

Twenty identical machines with no local disks: the system lives on one iSCSI storage, and any machine boots the same system over the network. When one breaks, swap in another — the system on storage stays intact. That's a diskless workstation setup (sanboot).

```
        iSCSI storage (192.168.1.50)
        iqn.2024-01:disk
              ▲
              │ boot from SAN (no local disk)
  ┌───────────┼────────────┐
  │ client 1   client 2 …   client 20 │
  └───────────────────────┘
        PxeLab supplies boot info
```

---

## Preparation

- An iSCSI target: a LUN on your storage server (example: IP `192.168.1.50`, IQN `iqn.2024-01:disk`)
- PxeLab can reach both the iSCSI storage and the clients
- Clients support iPXE boot (PxeLab's built-in iPXE supports sanboot — no custom compilation needed)

---

## Step 1: Prepare the iSCSI LUN

Create a LUN on the storage server and install a system into it (or export an existing system disk as a LUN). Note down three things:

- Storage server IP (example: `192.168.1.50`)
- IQN (example: `iqn.2024-01:disk`)
- LUN number (0 by default — the `:disk` suffix without a LUN number means LUN 0)

Authorize clients on the PxeLab subnet to access this LUN.

## Step 2: Create a sanboot boot entry

Go to **Basic Config → Boot Menu (Profiles)** and create a new boot entry:

| Field | Example value |
|-------|---------------|
| Name | `Diskless Workstation` |
| Boot type | `sanboot — boot from SAN` |
| URL | `iscsi:192.168.1.50::::iqn.2024-01:disk` |

URL format: `iscsi:<storage IP>:<port (empty)>::<IQN>:<LUN>` — the example boots `iqn.2024-01:disk` from `192.168.1.50` on the default port (3260).

## Step 3: Route clients to this boot entry

Choose one of:

- **All machines**: make this entry the default menu item (boot menu config → default menu → add this entry)
- **Specific machines**: register the client MAC in **Host Management** and bind this boot entry (Profile) to it, giving each machine its own boot config

## Step 4: Boot a client and verify diskless startup

Power the client on → network boot → PxeLab boot menu → choose `Diskless Workstation`.

The client boots its system from the iSCSI storage and runs without relying on a local disk.

---

## Common issues in this tutorial

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Boot failure / storage not found | iSCSI target denies the client IP | Check LUN access control (initiator authorization) on the storage side |
| Wrong IQN or LUN | Typo in the config | Double-check the IQN and LUN number exported by the storage |
| Concurrent boots behave badly | Multiple clients writing the same LUN | Make the system disk read-only, or use multiple copies / one LUN per machine |
| Entry missing from the boot menu | Not set as default / no host binding | Re-check Step 3 |

---

## Going further

- **Which scenarios suit (or don't suit) sanboot** — installer-type ISOs don't; see [Boot Architecture & Diskless](../guides/boot-architecture.md)
- **Detailed boot entry and host binding config**: see [Boot Config](../guides/boot-config.md) and [Host Management](../guides/host-management.md)
