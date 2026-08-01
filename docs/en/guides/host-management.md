# Host Management

> Register the devices on your network (identified by MAC), give each machine its own boot behavior, and track online status.

**Docs**: [Boot Menu Config](boot-config.md) | [Access Control](access-control.md) | [Wake-on-LAN](wol.md) | [BMC / IPMI](bmc.md)

---

## When to Use

- A machine should **always install a specific system** → register the host + bind a Profile
- Bulk onboarding in a server room → create via the [Automation API](../development/automation.md)
- Want **remote wake / out-of-band power control** → register hosts first
- Want to see **which machines booted recently** → online status and boot counts

Entry: **Management → Host Management** (`/hosts`), detail pages at `/hosts/:id`.

## Task 1: Create a host

Click **New Host**:

| Field | Meaning |
|-------|---------|
| Name | Required, e.g. `server-01` |
| MAC address | Required, lowercase hex, colon or dash separated (e.g. `aa:bb:cc:dd:ee:01`) |
| IP | Optional (fill if known) |
| Associated config (Profile) | Binds the boot menu that decides how this machine boots |

> MAC and name are both unique — duplicates are rejected.

There is no built-in CSV import for bulk host registration; create hosts in a loop via the REST API (see [Automation & CI Integration](../development/automation.md)).

## Task 2: Bind boot behavior

- **From the detail page**: open the host → associate a Profile → save. The machine then boots straight into that Profile
- For batch scenarios, use the API (see [Automation & CI Integration](../development/automation.md))

## Task 3: Remote control

From the host detail page you can:

- **WOL wake**: send a magic packet to the MAC, waking a powered-off machine (scheduling supported)
- **BMC/IPMI power control**: once out-of-band info (BMC address/credentials) is registered, power on/off/restart and query status remotely, with batch operations

Details: [Wake-on-LAN](wol.md) and [BMC / IPMI](bmc.md).

## Online Status

Hosts with boot records show "online" on the detail page. The dashboard's "online hosts" stat counts machines with boot activity in the last 10 minutes. The list also shows boot counts and last-seen time — handy for confirming installs/boots succeeded.

## API

Host CRUD, wake, and BMC operations all have REST endpoints; see [REST API Reference](../reference/api-reference.md).
