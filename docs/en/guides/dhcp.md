# DHCP Config

> Give devices on the network automatic IPs and PXE boot info. Task-oriented steps; protocol details live in [DHCP Modes](dhcp-modes.md).

**Docs**: [Service Config](services.md) | [DHCP Modes](dhcp-modes.md) | [Boot Menu Config](boot-config.md)

---

## When to Use

- New network needs **automatic IP + boot info** → create an interface in `server` mode
- Network already has DHCP, just want to **layer boot capability on top** → `proxy` mode (see [Tutorial 2](../tutorials/add-pxe-to-existing-dhcp.md))
- A specific device needs a **fixed IP** → IP reservation
- Debugging "clients can't get an IP" → check the lease tab

Entry: **Basic Config → Service Config → DHCP**.

## Task 1: Create an interface and subnet (server mode)

Click **Add Interface** in the top-right corner and fill in:

| Field | Meaning |
|-------|---------|
| Interface name | A name, or pick a detected NIC from the list |
| IP address | The PxeLab server's IP on this subnet |
| Subnet 1 → Subnet CIDR | The network, e.g. `192.168.50.0/24` |
| Subnet 1 → DHCP mode | `server (Server DHCP)` |
| Subnet 1 → Address pool | "+ Add address range" to set the assignment range |
| Subnet 1 → Gateway / DNS server | Default gateway and DNS for clients (DNS empty = use interface IP) |
| Subnet 1 → Lease time (seconds) | Default 86400 (1 day) |

Save, then start the DHCP service (port 67) from the **service status bar**. An interface can hold multiple subnets via "+ Add subnet", each with its own mode and pool.

## Task 2: Layer onto existing DHCP (proxy mode)

Create an interface, set the subnet CIDR to your existing network, and pick `proxy (Proxy DHCP)` as the DHCP mode — **leave address pool, gateway, and DNS empty** (proxy doesn't assign IPs). Save and start `ProxyDHCP` (port 4011).

> Full flow: [Tutorial 2: Layer PXE onto an Existing DHCP Network](../tutorials/add-pxe-to-existing-dhcp.md).

## Task 3: IP reservation (fixed IP)

**Reservations** tab → add a reservation: fill in MAC and IP (hostname and note optional). Server-mode subnets only.

- Conflict detection runs automatically: reserved IPs already taken by other reservations or active leases are flagged
- Use for printers, servers, and other devices that need a fixed IP

## Task 4: View and manage leases

**Leases** tab: active leases (IP / MAC / expiry). Supports delete (force release) and batch cleanup.

## Task 5: Chain to iPXE

The "**Chain to iPXE**" toggle in the subnet config: when enabled, PXELinux/GRUB2 clients automatically redirect to load iPXE. Ideal for unifying legacy environments on iPXE (see [PXELinux Compatibility & Migration](pxelinux-migration.md)).

## Mode Cheat Sheet

| Mode | Assigns IP | Provides boot info | Scenario |
|------|-----------|--------------------|----------|
| **server** | ✅ | ✅ | PxeLab is the only DHCP (default) |
| **proxy** | ❌ (existing DHCP assigns) | ✅ | Existing DHCP, add boot |
| **off** | ❌ | ❌ | No DHCP on this interface |

Protocol details (Option 60, yiaddr=0, etc.): [DHCP Modes](dhcp-modes.md).
