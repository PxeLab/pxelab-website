# REST API Reference

> Complete endpoint list and usage conventions for the PxeLab REST API v1.

**Related**: [Config File Reference](config-file.md) | [Web UI Guide](../guides/web-ui.md)

---

## General Conventions

**Base URL**: `http://<host>:8080/api/v1`

**Request format**: JSON (`Content-Type: application/json`)

**Response format**:

```json
{
  "success": true,
  "data": { ... }
}
```

Error response:

```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Authentication

```
POST /api/v1/auth/login     # Login
POST /api/v1/auth/logout    # Logout
GET  /api/v1/auth/session   # Check session
```

Session is maintained via Cookie.

---

## Endpoint List

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/session` | Check session |

### Version

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/version` | Current version info |
| POST | `/version/check` | Check for updates |
| POST | `/version/download` | Download update |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | Audit log list |

### Hosts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hosts` | List hosts |
| POST | `/hosts` | Create host |
| GET | `/hosts/{id}` | Get host |
| PUT | `/hosts/{id}` | Update host |
| DELETE | `/hosts/{id}` | Delete host |
| POST | `/hosts/{id}/wake` | WOL wake |
| POST | `/hosts/{id}/power` | IPMI power control |
| GET | `/hosts/{id}/boot-config` | Preview boot config |
| POST | `/hosts/batch/wake` | Batch WOL wake |

### Boot Config (Profile)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | List profiles |
| POST | `/profiles` | Create profile |
| GET | `/profiles/{id}` | Get profile |
| PUT | `/profiles/{id}` | Update profile |
| DELETE | `/profiles/{id}` | Delete profile |
| POST | `/profiles/from-netboot` | Create from netboot |
| GET | `/profiles/{profileId}/script-versions` | Script version list |
| GET | `/profiles/{profileId}/script-versions/{verId}` | Get a single script version |
| GET | `/profiles/{profileId}/script-diff/{verId}` | Version diff |
| POST | `/profiles/{profileId}/script-rollback/{verId}` | Version rollback |

### File Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/files` | List files |
| GET | `/files/root` | Get root directory |
| POST | `/files/upload` | Upload file |
| DELETE | `/files` | Delete file |

### Leases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leases` | List leases |
| GET | `/leases/stats` | Lease statistics |
| DELETE | `/leases/{mac}` | Delete lease |
| POST | `/leases/batch-delete` | Batch delete |
| POST | `/leases/prune` | Prune expired leases |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Full settings (backward compatible) |
| PUT | `/settings` | Update full settings |
| GET | `/settings/general` | General settings |
| PUT | `/settings/general` | Update general settings |
| GET | `/settings/interfaces` | Interface config |
| PUT | `/settings/interfaces` | Update interface config |
| GET | `/settings/netboot` | Netboot settings |
| PUT | `/settings/netboot` | Update netboot settings |
| GET | `/settings/logging` | Logging settings |
| PUT | `/settings/logging` | Update logging settings |
| GET | `/netboot/cache-stats` | Netboot cache statistics |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services/tftp` | TFTP settings |
| PUT | `/services/tftp` | Update TFTP |
| GET | `/services/dhcp` | DHCP settings |
| PUT | `/services/dhcp` | Update DHCP |
| GET | `/services/dns` | DNS settings |
| PUT | `/services/dns` | Update DNS |
| GET | `/services/nfs` | NFS settings |
| PUT | `/services/nfs` | Update NFS |
| POST | `/services/nfs/validate-path` | Validate NFS path |
| GET | `/services/nfs/browse-path` | Browse NFS path |
| GET | `/services/archmap` | Architecture mapping |
| PUT | `/services/archmap` | Update architecture mapping |
| GET | `/services/archmap/defaults` | Default architecture mapping |
| GET | `/services/ipxe-script` | iPXE script |
| PUT | `/services/ipxe-script` | Update iPXE script |

### Service Lifecycle

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List all services |
| POST | `/services/{name}/start` | Start service |
| POST | `/services/{name}/stop` | Stop service |
| POST | `/services/{name}/restart` | Restart service |
| POST | `/services/batch/{action}` | Batch operation |
| PUT | `/services/{name}/auto-start` | Set auto-start |

### Netboot

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/netboot/catalog` | OS catalog |
| GET | `/netboot/catalog/{distro}` | Distro details |
| GET | `/netboot/groups` | Group list |
| GET | `/netboot/check-files` | Check files |
| GET | `/netboot/overlays` | Overlay list |
| GET | `/netboot/overlays/{distro}` | Get overlay |
| PUT | `/netboot/overlays/{distro}` | Create/update overlay |
| DELETE | `/netboot/overlays/{distro}` | Delete overlay |
| GET | `/netboot/answer-templates` | Answer template list |
| POST | `/netboot/answer-templates` | Create answer template |
| GET | `/netboot/answer-templates/{id}` | Get template |
| PUT | `/netboot/answer-templates/{id}` | Update template |
| DELETE | `/netboot/answer-templates/{id}` | Delete template |
| GET | `/netboot/answer-templates/presets` | Built-in presets |
| POST | `/netboot/answer-templates/validate` | Validate template |
| GET | `/netboot/answer-templates/{id}/versions` | Version list |
| GET | `/netboot/answer-templates/{id}/versions/{version}` | Get specific version |
| POST | `/netboot/answer-templates/{id}/preview` | Render preview |
| POST | `/netboot/answer-templates/{id}/rollback/{version}` | Rollback to version |
| POST | `/netboot/answer-templates/{id}/validate` | Validate single template |
| GET | `/netboot/tasks` | Install task list |
| POST | `/netboot/tasks` | Create install task |
| GET | `/netboot/tasks/{id}` | Get task |
| PUT | `/netboot/tasks/{id}` | Update task |
| DELETE | `/netboot/tasks/{id}` | Delete task |
| GET | `/netboot/task/by-mac/{mac}` | Get task by MAC (PXE runtime, no auth) |
| GET | `/netboot/answer/{task_id}` | Get answer file (PXE runtime, no auth) |

### Access Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/access/blacklist` | Blacklist list |
| POST | `/access/blacklist` | Add to blacklist |
| DELETE | `/access/blacklist/{id}` | Delete blacklist entry |
| GET | `/access/whitelist` | Whitelist list |
| POST | `/access/whitelist` | Add to whitelist |
| DELETE | `/access/whitelist/{id}` | Delete whitelist entry |
| GET | `/access/unauthorized` | Unauthorized device list |
| POST | `/access/unauthorized/add-to-whitelist` | Add unauthorized device to whitelist |
| POST | `/access/unauthorized/add-to-blacklist` | Add unauthorized device to blacklist |
| DELETE | `/access/unauthorized/{id}` | Delete unauthorized device record |

### DNS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/dns/records` | DNS records |
| GET/PUT/DELETE | `/dns/records/{id}` | Single record |

### BMC

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bmc/configs` | BMC config list |
| POST | `/bmc/configs` | Create BMC config |
| GET | `/bmc/configs/{id}` | Get BMC config |
| PUT | `/bmc/configs/{id}` | Update BMC config |
| DELETE | `/bmc/configs/{id}` | Delete BMC config |
| POST | `/bmc/configs/import` | CSV import |
| POST | `/bmc/probe` | Probe BMC |
| POST | `/bmc/{id}/refresh` | Refresh BMC status |
| POST | `/bmc/{id}/power-on` | Power on |
| POST | `/bmc/{id}/power-off` | Power off |
| POST | `/bmc/{id}/restart` | Restart |
| GET | `/bmc/{id}/status` | Query status |
| POST | `/bmc/{id}/boot-device` | Set boot device |
| POST | `/bmc/batch/power-on` | Batch power on |
| POST | `/bmc/batch/power-off` | Batch power off |
| POST | `/bmc/batch/restart` | Batch restart |
| POST | `/bmc/batch/status` | Batch status query |

### DHCP Reservations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/dhcp/reservations` | List / Create |
| GET/PUT/DELETE | `/dhcp/reservations/{id}` | Single operation |

### Network Diagnostics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/network/ping` | Ping |
| POST | `/network/ping/stream` | Streaming ping |
| POST | `/network/traceroute` | Traceroute |
| POST | `/network/traceroute/stream` | Streaming traceroute |
| GET | `/network/interfaces` | Network interface list |

### WOL

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wol/history` | Wake history list |
| GET | `/wol/history/{mac}` | Wake history by MAC |
| DELETE | `/wol/history/{id}` | Delete single history entry |
| DELETE | `/wol/history` | Clear all wake history |
| POST | `/wol/schedule` | Create scheduled wake |
| GET | `/wol/schedules` | Scheduled wake list |
| DELETE | `/wol/schedule/{id}` | Delete scheduled wake |
| GET | `/wol/interfaces` | WOL interfaces |

### OS Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/os-images` | Image list |
| POST | `/os-images/upload` | Upload image |
| GET | `/os-images/{id}` | Get image details |
| PUT | `/os-images/{id}` | Update image |
| DELETE | `/os-images/{id}` | Delete image |
| POST | `/os-images/import` | Import existing image file |
| GET | `/os-images/{id}/file` | Download image file |
| POST | `/os-images/{id}/extract` | Extract image |
| POST | `/os-images/{id}/reprocess` | Reprocess image |
| POST | `/os-images/{id}/mount` | Mount image |
| POST | `/os-images/{id}/unmount` | Unmount image |
| GET | `/fs/browse` | File browser |

### Bootloader

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bootloader/check` | Boot file integrity check |
| GET | `/bootloader/files` | Boot file list |
| POST | `/bootloader/check-file` | Check a single boot file |

### Baselines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/baselines` | Baseline list |
| POST | `/baselines` | Create baseline |
| GET | `/baselines/{id}` | Get baseline |
| PUT | `/baselines/{id}` | Update baseline |
| DELETE | `/baselines/{id}` | Delete baseline |
| GET | `/baselines/{id}/scripts` | Baseline script list |
| PUT | `/baselines/{id}/scripts` | Set baseline scripts |
| GET | `/baselines/assigned` | Query machine's assigned baseline |

### Scripts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scripts` | Script list |
| POST | `/scripts` | Create script |
| GET | `/scripts/{id}` | Get script |
| PUT | `/scripts/{id}` | Update script |
| DELETE | `/scripts/{id}` | Delete script |

### Store

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/store/catalog` | Community template/script catalog |
| GET | `/store/items/{type}/{id}` | Catalog item details |
| POST | `/store/import` | Import catalog item |
| POST | `/store/import-local` | Import local item |

### Miscellaneous

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Service status |
| GET | `/metrics` | Metrics snapshot (JSON) |
| GET | `/events` | Event list |
| GET | `/events/stream` | Event stream (SSE) |
| GET | `/logs/stream` | Log stream (SSE) |
| GET | `/logs/files` | Log file list |
| GET | `/logs/disk-usage` | Log disk usage |
| POST | `/logs/cleanup` | Clean up logs |
| GET | `/interfaces` | Network interfaces |
