# Tutorial 1: Install Ubuntu on a Bare Metal Machine

> ⏱ Time: 15 minutes ｜ Level: Beginner ｜ Audience: First-time PxeLab users
> Prerequisites: PxeLab is running (see [Getting Started](../getting-started.md)), a computer that supports network boot, and network connectivity between client and server

---

## The Scenario

A bare metal machine has just arrived in the server room — no USB drive, no optical drive. You need to install Ubuntu on it, and other machines will follow the same process later.

This tutorial walks you through the whole flow: **create the network → network-boot the client → pick Ubuntu → start the install**.

---

## Preparation

- PxeLab is running, and its web UI is reachable (`http://localhost:8080`)
- The client and PxeLab are on the same subnet and can reach each other
- A free subnet (this tutorial uses `192.168.50.0/24` — replace it with your own network)
- The client hardware supports PXE network boot (almost every NIC and motherboard does, enabled by default)

---

## Step 1: Create an interface and subnet

Go to **Basic Config → Service Config → DHCP**, click **Add Interface** in the top-right corner, and fill in:

| Field | Example value |
|-------|---------------|
| Interface name | `eth0` (or pick a detected NIC from the list) |
| IP address | `192.168.50.10` (the PxeLab server's IP) |
| Subnet 1 → Subnet CIDR | `192.168.50.0/24` |
| Subnet 1 → DHCP mode | `server (Server DHCP)` |
| Subnet 1 → Address pool | Click "+ Add address range" → start `192.168.50.100` to `192.168.50.200` |
| Subnet 1 → Gateway | `192.168.50.1` |
| Subnet 1 → DNS server | `8.8.8.8` |

Save, then check the **service status bar** at the top: the DHCP service should be "running"; if not, start it.

> **About the mode**: `server` mode means PxeLab acts as the only DHCP server on this subnet, handing out both IP addresses and boot information. If your network already has a DHCP server, use proxy mode instead (Tutorial 2, coming soon) — it only layers boot information on top and leaves the existing network untouched.

## Step 2: Make sure the OS Install Catalog is enabled

Go to **Basic Config → Service Config → OS Install Catalog** and confirm the "enabled" toggle is on (it is by default).

PxeLab ships an install catalog for 64+ mainstream distributions (Ubuntu, Debian, CentOS, Windows, and more). Once the client boots, it sees this catalog in the menu and picks what to install.

## Step 3: Boot the client and enter network boot

Power the client on and enter its boot menu (common keys: F12 / F11 / Esc — varies by vendor), then choose **network boot (PXE Boot / Network Boot)**.

If everything is normal, the PxeLab boot menu appears within a few seconds.

## Step 4: Pick Ubuntu and start the install

1. In the boot menu, choose **[OS] Netboot OS Install Catalog** to enter the install catalog
2. Enter **Ubuntu** → select the version you want to install
3. The client downloads the boot files automatically and enters the Ubuntu installer
4. Complete the installation following the wizard

## Step 5: Verify

- **Dashboard**: the new host appears in the "Online hosts" list
- **Install tasks**: Management → Install Tasks shows the install record for this machine
- Once the installation finishes, reboot the client — it boots Ubuntu normally from the local disk

---

## Common issues in this tutorial

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Client won't network boot | Boot order / firmware settings | Enter the boot menu manually and pick PXE; check the network cable |
| Client gets no IP | DHCP not started / firewall | Confirm DHCP shows "running" in the service bar; allow UDP 67/68 |
| Boot menu appears without the OS catalog | Catalog disabled | Re-check the toggle from Step 2 |
| Changes don't take effect | Not saved / service not restarted | Save, then restart the affected service |

---

## Going further

- **Unattended installs**: combine [Answer Templates](../guides/answer-templates.md) with [Install Tasks](../guides/install-tasks.md) so no one has to click through the wizard
- **Per-host boot config**: bind a [Profile](../guides/profiles.md) to a specific machine so different hosts install different systems
- **More scenarios**: layer PXE onto an existing DHCP network (Tutorial 2, coming soon) · build diskless workstations (Tutorial 3, coming soon)
