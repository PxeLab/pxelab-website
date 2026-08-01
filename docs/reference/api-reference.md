# REST API 参考

> PxeLab REST API v1 的完整端点列表与使用约定。

**相关文档**: [配置文件参考](config-file.md) | [Web UI 指南](../guides/web-ui.md)

---

## 通用约定

**Base URL**: `http://<host>:8080/api/v1`

**请求格式**: JSON (`Content-Type: application/json`)

**响应格式**:

```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误描述"
}
```

---

## 认证

```
POST /api/v1/auth/login     # 登录
POST /api/v1/auth/logout    # 登出
GET  /api/v1/auth/session   # 检查会话
```

会话通过 Cookie 维持。

---

## 端点列表

### 认证

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/auth/login` | 登录 |
| POST | `/auth/logout` | 登出 |
| GET | `/auth/session` | 检查会话 |

### 版本

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/version` | 当前版本信息 |
| POST | `/version/check` | 检查更新 |
| POST | `/version/download` | 下载更新 |

### 审计日志

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/audit-logs` | 审计日志列表 |

### 主机

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/hosts` | 列出主机 |
| POST | `/hosts` | 创建主机 |
| GET | `/hosts/{id}` | 获取主机 |
| PUT | `/hosts/{id}` | 更新主机 |
| DELETE | `/hosts/{id}` | 删除主机 |
| POST | `/hosts/{id}/wake` | WOL 唤醒 |
| POST | `/hosts/{id}/power` | IPMI 电源控制 |
| GET | `/hosts/{id}/boot-config` | 预览引导配置 |
| POST | `/hosts/batch/wake` | 批量 WOL 唤醒 |

### 引导配置（Profile）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/profiles` | 列出 Profile |
| POST | `/profiles` | 创建 Profile |
| GET | `/profiles/{id}` | 获取 Profile |
| PUT | `/profiles/{id}` | 更新 Profile |
| DELETE | `/profiles/{id}` | 删除 Profile |
| POST | `/profiles/from-netboot` | 从 Netboot 创建 |
| GET | `/profiles/{profileId}/script-versions` | 脚本版本列表 |
| GET | `/profiles/{profileId}/script-versions/{verId}` | 获取单个脚本版本 |
| GET | `/profiles/{profileId}/script-diff/{verId}` | 版本差异 |
| POST | `/profiles/{profileId}/script-rollback/{verId}` | 版本回滚 |

### 文件管理

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/files` | 列出文件 |
| GET | `/files/root` | 获取根目录 |
| POST | `/files/upload` | 上传文件 |
| DELETE | `/files` | 删除文件 |

### 租约

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/leases` | 列出租约 |
| GET | `/leases/stats` | 租约统计 |
| DELETE | `/leases/{mac}` | 删除租约 |
| POST | `/leases/batch-delete` | 批量删除 |
| POST | `/leases/prune` | 清理过期租约 |

### 设置

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/settings` | 完整设置（向后兼容） |
| PUT | `/settings` | 更新完整设置 |
| GET | `/settings/general` | 通用设置 |
| PUT | `/settings/general` | 更新通用设置 |
| GET | `/settings/interfaces` | 接口配置 |
| PUT | `/settings/interfaces` | 更新接口配置 |
| GET | `/settings/netboot` | Netboot 设置 |
| PUT | `/settings/netboot` | 更新 Netboot 设置 |
| GET | `/settings/logging` | 日志设置 |
| PUT | `/settings/logging` | 更新日志设置 |
| GET | `/netboot/cache-stats` | Netboot 缓存统计 |

### 服务

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/services/tftp` | TFTP 设置 |
| PUT | `/services/tftp` | 更新 TFTP |
| GET | `/services/dhcp` | DHCP 设置 |
| PUT | `/services/dhcp` | 更新 DHCP |
| GET | `/services/dns` | DNS 设置 |
| PUT | `/services/dns` | 更新 DNS |
| GET | `/services/nfs` | NFS 设置 |
| PUT | `/services/nfs` | 更新 NFS |
| POST | `/services/nfs/validate-path` | 校验 NFS 路径 |
| GET | `/services/nfs/browse-path` | 浏览 NFS 路径 |
| GET | `/services/archmap` | 架构映射 |
| PUT | `/services/archmap` | 更新架构映射 |
| GET | `/services/archmap/defaults` | 默认架构映射 |
| GET | `/services/ipxe-script` | iPXE 脚本 |
| PUT | `/services/ipxe-script` | 更新 iPXE 脚本 |

### 服务生命周期

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/services` | 列出所有服务 |
| POST | `/services/{name}/start` | 启动服务 |
| POST | `/services/{name}/stop` | 停止服务 |
| POST | `/services/{name}/restart` | 重启服务 |
| POST | `/services/batch/{action}` | 批量操作 |
| PUT | `/services/{name}/auto-start` | 设置自动启动 |

### Netboot

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/netboot/catalog` | OS 目录 |
| GET | `/netboot/catalog/{distro}` | 发行版详情 |
| GET | `/netboot/groups` | 分组列表 |
| GET | `/netboot/check-files` | 检查文件 |
| GET | `/netboot/overlays` | 覆盖层列表 |
| GET | `/netboot/overlays/{distro}` | 获取覆盖层 |
| PUT | `/netboot/overlays/{distro}` | 创建/更新覆盖层 |
| DELETE | `/netboot/overlays/{distro}` | 删除覆盖层 |
| GET | `/netboot/answer-templates` | 应答文件模板列表 |
| POST | `/netboot/answer-templates` | 创建应答文件模板 |
| GET | `/netboot/answer-templates/{id}` | 获取模板 |
| PUT | `/netboot/answer-templates/{id}` | 更新模板 |
| DELETE | `/netboot/answer-templates/{id}` | 删除模板 |
| GET | `/netboot/answer-templates/presets` | 内置预设列表 |
| POST | `/netboot/answer-templates/validate` | 校验模板 |
| GET | `/netboot/answer-templates/{id}/versions` | 版本列表 |
| GET | `/netboot/answer-templates/{id}/versions/{version}` | 获取指定版本 |
| POST | `/netboot/answer-templates/{id}/preview` | 渲染预览 |
| POST | `/netboot/answer-templates/{id}/rollback/{version}` | 回滚到指定版本 |
| POST | `/netboot/answer-templates/{id}/validate` | 校验单条模板 |
| GET | `/netboot/tasks` | 安装任务列表 |
| POST | `/netboot/tasks` | 创建安装任务 |
| GET | `/netboot/tasks/{id}` | 获取任务 |
| PUT | `/netboot/tasks/{id}` | 更新任务 |
| DELETE | `/netboot/tasks/{id}` | 删除任务 |
| GET | `/netboot/task/by-mac/{mac}` | 按 MAC 查询任务（PXE 运行时，免认证） |
| GET | `/netboot/answer/{task_id}` | 获取应答文件（PXE 运行时，免认证） |

### 访问控制

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/access/blacklist` | 黑名单列表 |
| POST | `/access/blacklist` | 添加黑名单 |
| DELETE | `/access/blacklist/{id}` | 删除黑名单条目 |
| GET | `/access/whitelist` | 白名单列表 |
| POST | `/access/whitelist` | 添加白名单 |
| DELETE | `/access/whitelist/{id}` | 删除白名单条目 |
| GET | `/access/unauthorized` | 未授权设备列表 |
| POST | `/access/unauthorized/add-to-whitelist` | 未授权设备加入白名单 |
| POST | `/access/unauthorized/add-to-blacklist` | 未授权设备加入黑名单 |
| DELETE | `/access/unauthorized/{id}` | 删除未授权设备记录 |

### DNS

| 方法 | 端点 | 说明 |
|------|------|------|
| GET/POST | `/dns/records` | DNS 记录 |
| GET/PUT/DELETE | `/dns/records/{id}` | 单条记录 |

### BMC

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/bmc/configs` | BMC 配置列表 |
| POST | `/bmc/configs` | 创建 BMC 配置 |
| GET | `/bmc/configs/{id}` | 获取 BMC 配置 |
| PUT | `/bmc/configs/{id}` | 更新 BMC 配置 |
| DELETE | `/bmc/configs/{id}` | 删除 BMC 配置 |
| POST | `/bmc/configs/import` | CSV 导入 |
| POST | `/bmc/probe` | 探测 BMC |
| POST | `/bmc/{id}/refresh` | 刷新 BMC 状态 |
| POST | `/bmc/{id}/power-on` | 开机 |
| POST | `/bmc/{id}/power-off` | 关机 |
| POST | `/bmc/{id}/restart` | 重启 |
| GET | `/bmc/{id}/status` | 查询状态 |
| POST | `/bmc/{id}/boot-device` | 设置启动设备 |
| POST | `/bmc/batch/power-on` | 批量开机 |
| POST | `/bmc/batch/power-off` | 批量关机 |
| POST | `/bmc/batch/restart` | 批量重启 |
| POST | `/bmc/batch/status` | 批量查询 |

### DHCP 预留

| 方法 | 端点 | 说明 |
|------|------|------|
| GET/POST | `/dhcp/reservations` | 预留列表/创建 |
| GET/PUT/DELETE | `/dhcp/reservations/{id}` | 单条操作 |

### 网络诊断

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/network/ping` | Ping |
| POST | `/network/ping/stream` | 流式 Ping |
| POST | `/network/traceroute` | Traceroute |
| POST | `/network/traceroute/stream` | 流式 Traceroute |
| GET | `/network/interfaces` | 网络接口列表 |

### WOL

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/wol/history` | 唤醒历史列表 |
| GET | `/wol/history/{mac}` | 按 MAC 查询唤醒历史 |
| DELETE | `/wol/history/{id}` | 删除单条唤醒记录 |
| DELETE | `/wol/history` | 清空唤醒历史 |
| POST | `/wol/schedule` | 创建定时唤醒 |
| GET | `/wol/schedules` | 定时唤醒列表 |
| DELETE | `/wol/schedule/{id}` | 删除定时唤醒 |
| GET | `/wol/interfaces` | WOL 可用接口 |

### OS 镜像

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/os-images` | 镜像列表 |
| POST | `/os-images/upload` | 上传镜像 |
| GET | `/os-images/{id}` | 获取镜像详情 |
| PUT | `/os-images/{id}` | 更新镜像 |
| DELETE | `/os-images/{id}` | 删除镜像 |
| POST | `/os-images/import` | 导入已有镜像文件 |
| GET | `/os-images/{id}/file` | 下载镜像文件 |
| POST | `/os-images/{id}/extract` | 解压镜像 |
| POST | `/os-images/{id}/reprocess` | 重新处理镜像 |
| POST | `/os-images/{id}/mount` | 挂载镜像 |
| POST | `/os-images/{id}/unmount` | 卸载镜像 |
| GET | `/fs/browse` | 文件浏览 |

### 引导加载程序（Bootloader）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/bootloader/check` | 引导文件完整性检查 |
| GET | `/bootloader/files` | 引导文件列表 |
| POST | `/bootloader/check-file` | 检查单个引导文件 |

### 基线（Baseline）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/baselines` | 基线列表 |
| POST | `/baselines` | 创建基线 |
| GET | `/baselines/{id}` | 获取基线 |
| PUT | `/baselines/{id}` | 更新基线 |
| DELETE | `/baselines/{id}` | 删除基线 |
| GET | `/baselines/{id}/scripts` | 基线脚本列表 |
| PUT | `/baselines/{id}/scripts` | 设置基线脚本 |
| GET | `/baselines/assigned` | 查询机器已分配的基线 |

### 脚本（Script）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/scripts` | 脚本列表 |
| POST | `/scripts` | 创建脚本 |
| GET | `/scripts/{id}` | 获取脚本 |
| PUT | `/scripts/{id}` | 更新脚本 |
| DELETE | `/scripts/{id}` | 删除脚本 |

### 存储（Store）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/store/catalog` | 社区模板/脚本目录 |
| GET | `/store/items/{type}/{id}` | 获取目录条目详情 |
| POST | `/store/import` | 导入目录条目 |
| POST | `/store/import-local` | 导入本地条目 |

### 其他

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/status` | 服务状态 |
| GET | `/metrics` | 指标快照（JSON） |
| GET | `/events` | 事件列表 |
| GET | `/events/stream` | 事件流（SSE） |
| GET | `/logs/stream` | 日志流（SSE） |
| GET | `/logs/files` | 日志文件列表 |
| GET | `/logs/disk-usage` | 日志磁盘占用 |
| POST | `/logs/cleanup` | 清理日志 |
| GET | `/interfaces` | 网络接口 |
