# Performance & Large-Scale Deployment

> Capacity reference, performance bottlenecks, and architecture advice for large (hundreds of machines) deployments.

**Docs**: [Deployment](deployment.md) | [Monitoring](monitoring.md) | [Network Diagnostics](network-diagnostics.md)

---

## Capacity Reference

| Hardware | Suggested client count |
|----------|------------------------|
| 1 core / 512 MB | hundreds |
| 2 cores / 1 GB | thousands |
| 4 cores / 2 GB | thousands |

The table above is a reference for **steady-state managed scale** (DHCP leases / online hosts) — DHCP is a lightweight protocol, and CPU/RAM is usually not the bottleneck.

**The real capacity limit is "concurrent booting", not managed count**: when many clients download boot files/ISOs at once, momentary load spikes far above steady state, bounded by:

- **Network bandwidth** — a Gigabit NIC (≈112 MB/s) sets the throughput ceiling for simultaneous downloads
- **Disk I/O** — mechanical drives saturate first on concurrent boot-file/ISO reads; SSDs help significantly
- **Boot method** — TFTP transfers serially; HTTP/iPXE is an order of magnitude faster, prefer HTTP
- **Netboot cache** — once enabled, boot files land on disk and repeat boots skip external downloads

So **don't estimate supported hosts directly from hardware specs**; for mass deployment, trigger boots in batches (20–50 machines) — more effective than buying stronger hardware.

## Bottlenecks and Optimization

| Stage | Bottleneck pattern | Optimization |
|-------|--------------------|--------------|
| **DHCP** | Many concurrent Discover/Request | Enough CPU cores; keep leases short to avoid pool exhaustion |
| **TFTP** | Serial boot file transfer | Keep boot files on local disk (avoid network storage); small files first |
| **HTTP** | Concurrent downloads of boot files/ISOs | PxeLab supports HTTP boot (iPXE) — an order of magnitude faster than TFTP; prefer HTTP |
| **NFS** | ISO mounts and network install reads | Consider SSD storage for heavy concurrent installs; read-only mounts |
| **Netboot cache** | Repeated boots re-download | Enable [local caching](netboot.md) — boot files land on disk, no more external downloads on repeat boots |

## Large-Scale Architecture

```
                    ┌───────────────┐
                    │ iSCSI/file store │（NFS/ISO 集中存放）
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │ business VLAN     │                   │
┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐
│  PxeLab A     │   │  PxeLab B     │   │  PxeLab C     │
│  (DHCP proxy) │   │  (DHCP proxy) │   │  (DHCP proxy) │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
    clients 1-333       clients 334-666     clients 667-1000
```

Key points:

- **Split by VLAN**: one PxeLab per client subnet (proxy mode layered on the existing DHCP), spreading boot load horizontally
- **Centralized storage**: ISOs and boot files live in one place (NFS/file store); every PxeLab mounts the same copy
- **Isolated management network**: separate management and business interfaces so PxeLab traffic doesn't cross the business network
- **Monitoring**: feed the metrics snapshot (`/api/v1/metrics`, JSON format); watch lease counts, boot traffic, and NFS connections; use the dashboard for real-time visibility
- **Logging**: configure log rotation (size/days/backups) to prevent unbounded log growth

## Mass Deployment Tips

- Trigger boots for **batches** (e.g., 20-50 machines) rather than everything at once, avoiding instantaneous spikes
- Prefer HTTP/iPXE for install traffic (much faster than TFTP); keep boot files and images local or on SSD
- Track progress with [Install Tasks](install-tasks.md); use [Host Management](host-management.md) MAC registration + Profile binding for "boot → right OS automatically"
- Use [Network Diagnostics](network-diagnostics.md) (Ping/Traceroute) regularly to catch Layer-2 issues

---

## FAQ

**Q: How many machines can one PxeLab serve?**
Managed scale (leases/online hosts) reaches thousands (see the capacity table above). For concurrent boots, stagger batches (20–50 machines); above a single server's managed scale, or for higher concurrency, split across multiple deployments per VLAN.

**Q: Batch boots are slow — what now?**
First confirm clients use HTTP rather than TFTP (iPXE defaults to HTTP); check Netboot caching is enabled; stagger batches at high concurrency.

**Q: How do I find the bottleneck?**
Watch per-service traffic and events on the dashboard; pinpoint DHCP/TFTP/NFS peaks via the metrics snapshot (`/api/v1/metrics`); verify link quality with Network Diagnostics.
