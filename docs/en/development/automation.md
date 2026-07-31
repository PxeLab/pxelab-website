# Automation & CI Integration

> Wiring PxeLab into scripts and CI pipelines: bulk host registration, reporting after installs, idempotency practices.

**Docs**: [REST API Quick Start](api-quickstart.md) | [REST API Reference](../reference/api-reference.md) | [Host Management](../guides/host-management.md)

---

## Typical Scenarios

- **Bulk registration**: MAC list for 200 new machines in a server room → import hosts and bind boot entries in one pass
- **Provision-on-demand**: CI test machines created on demand — register the MAC before tests, clean up after
- **Status integration**: feed PxeLab service status and host lists into your monitoring/CMDB

## Idempotency: Check-then-create

Host MACs are unique; duplicate creation returns 409. The correct pattern for batch scripts:

```bash
#!/usr/bin/env bash
# Bulk host registration (idempotent)
BASE=http://localhost:8080/api/v1

while IFS=, read -r mac name profile; do
  # 1. Check whether the MAC already exists
  exists=$(curl -s "$BASE/hosts?mac=$mac" | grep -c "\"mac\":\"$mac\"")
  if [ "$exists" -gt 0 ]; then
    echo "skip $mac (exists)"
    continue
  fi
  # 2. Only create if it doesn't
  curl -s -X POST "$BASE/hosts" -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"mac\":\"$mac\"}" > /dev/null
  echo "created $mac"
done < hosts.csv
```

> For remote access, add `-H "Authorization: Bearer <token>"` to every curl.

## GitHub Actions Example: Test Host Registration

```yaml
name: register-test-hosts
on:
  workflow_dispatch:
    inputs:
      count:
        description: Number of test hosts
        default: "5"

jobs:
  register:
    runs-on: ubuntu-latest
    steps:
      - name: Register test hosts
        env:
          PXELAB_URL: ${{ secrets.PXELAB_URL }}
          PXELAB_TOKEN: ${{ secrets.PXELAB_TOKEN }}
        run: |
          for i in $(seq 1 ${{ inputs.count }}); do
            mac=$(printf 'aa:bb:cc:dd:ff:%02x' $i)
            curl -s -X POST "$PXELAB_URL/api/v1/hosts" \
              -H "Authorization: Bearer $PXELAB_TOKEN" \
              -H "Content-Type: application/json" \
              -d "{\"name\":\"ci-node-$i\",\"mac\":\"$mac\"}" \
              | grep -q '"success":true' || echo "warn: register $mac failed"
          done
```

Key points:

- Keep the token in **GitHub Secrets**, never in the repo
- Assert every call with `grep -q '"success":true'`
- Clean up with `DELETE /api/v1/hosts/<id>` after the job to keep the CMDB tidy

## Status Integration

```bash
# Service status → monitoring
curl -s http://localhost:8080/api/v1/status

# Prometheus metrics (standard format)
curl -s http://localhost:8080/api/v1/metrics

# Host list → CMDB sync
curl -s http://localhost:8080/api/v1/hosts | jq -r '.data[] | [.name, .mac, .ip] | @tsv'
```

## Best-Practice Checklist

- [ ] Check-then-create (or catch 409 and retry) in batch operations, for idempotency
- [ ] MACs in lowercase (the API forces it); CSV columns in `mac,name,profile` order
- [ ] Tokens only in secret management / CI Secrets
- [ ] Scripts assert `"success":true`; on failure print a readable error and exit non-zero
- [ ] Cleanup tasks: delete registered hosts and install tasks after tests finish
