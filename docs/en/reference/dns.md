# DNS Service

> Local DNS resolution, upstream forwarding, and record management.

**Related**: [DHCP Config](../guides/dhcp.md) | [NFS Service](nfs.md)

---

## Local DNS

PxeLab has a built-in DNS server supporting:

- **Local resolution** — A / AAAA / CNAME / TXT / MX records
- **Upstream forwarding** — Forward unmatched queries to upstream when configured
- **Subnet-aware** — Return server IP based on client source subnet
- **Auto-records** — Auto-create `@` A record and server name A record on startup

| Config | Default | Description |
|--------|---------|-------------|
| Port | 53 | UDP |
| Local domain | pxelab.local | Suffix domain |
| Upstream DNS | Empty (no forwarding) | Comma- or whitespace-separated `host:port` list, e.g. `8.8.8.8:53 1.1.1.1:53`; when empty, only local records are answered and no forwarding happens |

> **Note**: The upstream DNS defaults to empty, i.e. no queries are forwarded by default — only local records are returned. Configure upstream addresses explicitly to enable forwarding.

Web UI: **Service Config → DNS** (`/services/dns`)

---

## DNS Record Management

Manage DNS records via Web UI or API:

```
GET    /api/v1/dns/records          # List all records
POST   /api/v1/dns/records          # Create record
GET    /api/v1/dns/records/{id}     # Get single record
PUT    /api/v1/dns/records/{id}     # Update record
DELETE /api/v1/dns/records/{id}     # Delete record
```

Supported record types: A, AAAA, CNAME, TXT, MX
