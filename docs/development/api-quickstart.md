# REST API 快速上手

> 用 curl 从零调通 PxeLab API：认证、常用调用、错误处理。完整端点清单见 [REST API 参考](../reference/api-reference.md)。

**相关文档**: [REST API 参考](../reference/api-reference.md) | [自动化与 CI 集成](automation.md)

---

## 认证

**本机访问默认免认证**——从运行 PxeLab 的机器上访问 `localhost:8080` 无需任何凭证。

远程访问需要 Bearer token：

1. 在配置文件中设置访问令牌（`auth.token`，或通过界面设置）
2. 请求头携带：

```bash
curl -H "Authorization: Bearer <token>" http://<host>:8080/api/v1/status
```

## 第一个调用：服务状态

```bash
curl -s http://localhost:8080/api/v1/status
```

响应示例：

```json
{
  "success": true,
  "data": {
    "services": { "HTTP": "running", "DHCP": "running", ... },
    "status": "ok"
  }
}
```

## 通用约定

- **Base URL**：`http://<host>:8080/api/v1`
- **请求格式**：JSON（`Content-Type: application/json`）
- **成功响应**：`{"success": true, "data": ...}`
- **错误响应**：`{"success": false, "error": "错误描述"}`，同时带合适的 HTTP 状态码（400/401/404/409/500）

## 常用调用示例

### 主机管理

```bash
# 创建主机（name 与 mac 必填；mac 为小写十六进制，冒号或短横线分隔）
curl -s -X POST http://localhost:8080/api/v1/hosts \
  -H "Content-Type: application/json" \
  -d '{"name":"node-01","mac":"aa:bb:cc:dd:ee:01","ip":"192.168.50.101"}'

# 列出主机
curl -s http://localhost:8080/api/v1/hosts

# 删除主机
curl -s -X DELETE http://localhost:8080/api/v1/hosts/<id>
```

### 引导配置（Profile）

```bash
# 创建 Profile（菜单为 JSON，type 支持 menu/direct/chain/wds/sanboot/netboot/local/custom）
curl -s -X POST http://localhost:8080/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Install Ubuntu","menu":{"title":"Ubuntu","entries":[{"label":"Install Ubuntu","type":"direct","kernel":"vmlinuz","initrd":"initrd.img"}]}}'
```

### 批量操作

没有 `/hosts/import` 端点，批量添加主机可循环调用创建接口；批量 BMC 信息则支持 CSV 导入：

```bash
# 逐台创建主机
for m in AA:BB:CC:DD:EE:01 AA:BB:CC:DD:EE:02; do
  curl -s -X POST http://localhost:8080/api/v1/hosts \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"server\",\"mac\":\"$m\",\"ip\":\"192.168.1.10\"}"
done

# 批量导入 BMC 信息（CSV，裸 CSV body 或 JSON {"csv":"..."}）
curl -s -X POST http://localhost:8080/api/v1/bmc/configs/import \
  -d @bmc.csv
```

## 错误处理速查

| HTTP 状态码 | 含义 | 常见场景 |
|------------|------|---------|
| 400 | 请求格式错误 | JSON 解析失败、字段校验不过 |
| 401 | 未认证 | 远程访问缺少/错误的 token |
| 404 | 资源不存在 | 修改或删除不存在的 id |
| 409 | 冲突 | MAC 或名称已存在、IP 已被预留/租用 |
| 500 | 服务器错误 | 内部异常（带日志排查） |

批量脚本中建议处理 409（幂等重试或先查后建），见[自动化与 CI 集成](automation.md)。

## 更多

- 完整端点清单与参数：**参考 → REST API 参考**
- 自动化场景与 CI 集成示例：**开发指南 → 自动化与 CI 集成**
