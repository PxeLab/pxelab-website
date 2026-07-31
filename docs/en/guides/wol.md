# Wake-on-LAN

> Wake powered-off (but plugged-in) machines remotely by sending a magic packet. Difference from BMC: WOL needs no out-of-band management port, but the NIC must support WOL and the motherboard must have Wake-on-LAN enabled.

**Docs**: [Host Management](host-management.md) | [BMC / IPMI](bmc.md)

---

## When to Use

- Wake a **batch of machines** before the shift starts → batch wake / scheduled wake
- Wake a batch at a **fixed weekly time** → scheduling

Entry: **Management → Wake-on-LAN** (`/wol`).

## Task 1: Single wake

Enter the MAC address + broadcast address, click Wake — a magic packet is sent to the MAC. Any machine that's off (S5) but has its NIC powered can be woken.

## Task 2: Batch wake

Select multiple hosts from the host list → batch wake.

## Task 3: Scheduling

- **Create a schedule**: MAC + wake time, one-shot or recurring (e.g. every Monday 8:00)
- **Task list**: view and delete schedules

## Task 4: History

Wake history: time, MAC, broadcast address, status — confirm the wake actually reached the target.

## Notes

- The target must be **plugged in** and its NIC must support WOL (enable Wake-on-LAN in BIOS/firmware)
- A wrong broadcast address means the magic packet never reaches the target subnet — the default uses the local interface's broadcast address
