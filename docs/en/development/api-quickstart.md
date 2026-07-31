# REST API Quick Start

> Get going with the PxeLab API from scratch using curl: auth, common calls, error handling. The full endpoint list lives in the [REST API Reference](../reference/api-reference.md).

**Docs**: [REST API Reference](../reference/api-reference.md) | [Automation & CI Integration](automation.md)

---

## Authentication

**Local access needs no auth by default** — requests to `localhost:8080` from the machine running PxeLab require no credentials.

Remote access needs a Bearer token:

1. Set an access token in the config (`auth.token`, or via the UI)
2. Send it as a header:

```bash
curl -H "Authorization: Bearer <token>" http://<host>:8080/api/v1/status
```

## Your First Call: Service Status

```bash
curl -s http://localhost:8080/api/v1/status
```

Response:

```json
{
  "success": true,
  "data": {
    "services": { "HTTP": "running", "DHCP": "running", ... },
    "status": "ok"
  }
}
```

## Conventions

- **Base URL**: `http://<host>:8080/api/v1`
- **Request format**: JSON (`Content-Type: application/json`)
- **Success response**: `{"success": true, "data": ...}`
- **Error response**: `{"success": false, "error": "description"}`, paired with an appropriate HTTP status (400/401/404/409/500)

## Common Examples

### Hosts

```bash
# Create a host (name and mac are required; mac is lowercase hex, colon or dash separated)
curl -s -X POST http://localhost:8080/api/v1/hosts \
  -H "Content-Type: application/json" \
  -d '{"name":"node-01","mac":"aa:bb:cc:dd:ee:01","ip":"192.168.50.101"}'

# List hosts
curl -s http://localhost:8080/api/v1/hosts

# Delete a host
curl -s -X DELETE http://localhost:8080/api/v1/hosts/<id>
```

### Profiles (boot config)

```bash
# Create a Profile (menu is JSON; type supports direct/chain/wds/sanboot/local)
curl -s -X POST http://localhost:8080/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Install Ubuntu","menu":{"title":"Ubuntu","entries":[{"label":"Install Ubuntu","type":"direct","kernel":"vmlinuz","initrd":"initrd.img"}]}}'
```

### Bulk Host Import (CSV)

```bash
# CSV format: mac,name,profile
cat > hosts.csv << 'EOF'
AA:BB:CC:DD:EE:01,server-01,ubuntu-install
AA:BB:CC:DD:EE:02,server-02,centos-install
EOF

curl -s -X POST http://localhost:8080/api/v1/hosts/import \
  -F "file=@hosts.csv"
```

## Error Handling Cheat Sheet

| HTTP status | Meaning | Common cause |
|-------------|---------|--------------|
| 400 | Malformed request | JSON parse failure, validation failure |
| 401 | Not authenticated | Missing/wrong token for remote access |
| 404 | Not found | Updating or deleting a nonexistent id |
| 409 | Conflict | MAC or name already exists, IP already reserved/leased |
| 500 | Server error | Internal exception (check logs) |

In batch scripts, handle 409 (retry idempotently or check-then-create) — see [Automation & CI Integration](automation.md).

## More

- Full endpoint list and parameters: **Reference → REST API Reference**
- Automation scenarios and CI examples: **Development → Automation & CI Integration**
