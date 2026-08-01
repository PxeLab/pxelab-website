# 自动化与 CI 集成

> 把 PxeLab 接入脚本与 CI 流水线：批量登记主机、装机后自动上报、幂等实践。

**相关文档**: [REST API 快速上手](api-quickstart.md) | [REST API 参考](../reference/api-reference.md) | [主机管理](../guides/host-management.md)

---

## 典型场景

- **批量登记**：新机房 200 台机器的 MAC 列表 → 一键导入主机并绑定引导项
- **装机即用**：CI 测试机按需创建，测试前自动登记 MAC、测试后清理
- **状态集成**：把 PxeLab 服务状态、主机列表接入现有监控/CMDB

## 幂等实践：先查后建

主机 MAC 是唯一索引，重复创建会返回 409。批量脚本的正确姿势：

```bash
#!/usr/bin/env bash
# 示例：批量登记主机（幂等）
BASE=http://localhost:8080/api/v1

while IFS=, read -r mac name profile; do
  # 1. 先按 MAC 查是否已存在（search 匹配 name/mac/ip）
  exists=$(curl -s "$BASE/hosts?search=$mac" | grep -c "\"mac\":\"$mac\"")
  if [ "$exists" -gt 0 ]; then
    echo "skip $mac (exists)"
    continue
  fi
  # 2. 不存在才创建
  curl -s -X POST "$BASE/hosts" -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"mac\":\"$mac\"}" > /dev/null
  echo "created $mac"
done < hosts.csv
```

> 远程访问时给 curl 加上 `-H "Authorization: Bearer <token>"`。

## GitHub Actions 示例：测试机登记

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

要点：

- **token 放 GitHub Secrets**，不要写进仓库
- 用 `grep -q '"success":true'` 断言每次调用成功
- 任务结束后用 `DELETE /api/v1/hosts/<id>` 清理，保持 CMDB 干净

## 状态集成

```bash
# 服务状态 → 监控系统
curl -s http://localhost:8080/api/v1/status

# 指标快照（JSON 格式）
curl -s http://localhost:8080/api/v1/metrics

# 主机列表 → CMDB 同步
curl -s http://localhost:8080/api/v1/hosts | jq -r '.data[] | [.name, .mac, .ip] | @tsv'
```

## 最佳实践清单

- [ ] 批量操作前先查后建（或捕获 409 重试），保证幂等
- [ ] MAC 统一小写（API 会强制），CSV 列顺序 `mac,name,profile`
- [ ] token 只存在密钥管理/CI Secrets 中
- [ ] 脚本断言 `"success":true`，失败即输出可读错误并退出非零
- [ ] 清理任务：测试结束后删除登记的主机与安装任务
