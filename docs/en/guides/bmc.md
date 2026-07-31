# BMC / IPMI Out-of-Band Management

> Remotely control server power via IPMI — independent of whether the OS is alive. Even a dead server can be powered on/off/restarted.

**Docs**: [Host Management](host-management.md) | [Wake-on-LAN](wol.md)

---

## When to Use

- Server is **hung / unresponsive** and needs a hard restart → BMC power ops
- **Batch power on/off** in a server room (dozens of machines) → batch operations
- Make a server **boot from PXE next time** → boot device setting

Entry: **Management → BMC / IPMI** (`/bmc`).

## Task 1: Register BMC configs

Three ways:

- **Manual**: BMC address, username, password
- **CSV bulk import**: upload a CSV (MAC/host + BMC address/credentials)
- **Probe**: auto-discover BMC devices on the network

> Prerequisite: the BMC management port must be reachable from PxeLab (usually a dedicated out-of-band management subnet).

## Task 2: Power operations

- **Single**: power on / off / restart / query status from the row actions
- **Batch**: select multiple → batch power on / off / restart / query status
- **Refresh status**: re-query BMC connectivity for all devices

## Task 3: Boot device setting

Set a server's **next boot** to PXE / disk / BIOS — combine with PxeLab: set PXE → restart → network-boot installs the system; set back to disk when done.

## Notes

- Confirm the BMC account has the needed permissions (some IPMIs restrict remote power-off)
- Before batch operations, run "query status" to confirm which devices are online — avoid acting on already-off machines
