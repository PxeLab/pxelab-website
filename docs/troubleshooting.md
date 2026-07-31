# 故障排查与常见问题

> 常见问题排查、日志分析与 FAQ。

**相关文档**: [Web UI 指南](guides/web-ui.md) | [配置文件参考](reference/config-file.md)

---

## 常见问题

| 现象 | 可能原因 | 排查步骤 |
|------|---------|---------|
| 客户端无法 PXE 启动 | DHCP 未配置 / 网络不通 | 1. 检查 PxeLab 是否运行 2. 检查客户端和服务器是否在同一 VLAN 3. 检查防火墙是否放行 UDP 67 |
| 客户端启动后直接进本地磁盘 | 默认菜单只有 local 条目 | 检查默认菜单配置，确保有网络引导条目 |
| 客户端看不到安装目录 | Netboot 未启用 | 检查「启用 OS 安装目录菜单」和「Profile 菜单行为」 |
| DHCP Offer 被 UEFI 固件拒绝 | 缺少 Option 53 | 确保 PxeLab 版本包含 Option 53 修复 |
| iPXE 循环重启 | PXE_STACK 缓存问题 | PxeLab 已通过自定义编译 iPXE 解决（禁用 PXE_STACK） |
| vmxnet3 虚拟网卡启动失败 | TXE:1 兼容问题 | 使用 undionly.kpxe（UNDI 接口） |
| 修改配置不生效 | 浏览器缓存 | 硬刷新 (Ctrl+F5) |
| NFS 挂载失败（Windows） | 路径分隔符问题 | 确保使用 PxeLab 最新版（已修复 path.Clean） |
| DNS 不解析 | 上游 DNS 未配置 | 检查 DNS 设置中的 upstream 字段 |

---

## 日志排查

```bash
# 查看实时日志
# Web UI: 日志页面 → 选择服务过滤

# 或查看日志文件
tail -f ~/.pxelab/logs/pxelab.log

# 按服务过滤
grep "DHCP" ~/.pxelab/logs/pxelab.log
```

---

## 网络诊断

Web UI 内置网络诊断工具：
- **Ping** — 测试网络连通性
- **Traceroute** — 追踪路由路径
- 支持流式输出，实时显示结果

API：
```bash
# Ping
curl -X POST http://localhost:8080/api/v1/network/ping \
  -H "Content-Type: application/json" \
  -d '{"host": "192.168.1.1", "count": 4}'

# Traceroute
curl -X POST http://localhost:8080/api/v1/network/traceroute \
  -H "Content-Type: application/json" \
  -d '{"host": "192.168.1.1"}'
```

---

## 常见问题（故障类）

> 概念类问题（这是什么、怎么选、如何升级/备份）请见[常见问题](faq.md)。

### Q: 客户端无法获取 IP 地址？

**A:** 检查清单：

1. DHCP 服务是否运行：`curl localhost:8080/api/v1/services | jq .dhcp.status`
2. 端口 67 是否被占用：`netstat -tlnp | grep :67`
3. 防火墙是否放行：`iptables -L -n | grep 67`
4. 网络接口配置是否正确

### Q: 客户端获取 IP 后无法引导？

**A:** 检查清单：

1. TFTP 服务是否运行
2. 引导文件是否存在：`ls -la /path/to/pxelinux.0`
3. next-server 和 boot-file 配置是否正确
4. 客户端和服务器是否在同一子网

### Q: 如何查看详细日志？

**A:** 启用调试模式：

```bash
./pxelab --log-level debug
```

或在 Web UI 中：**设置 → 日志 → 日志级别 → Debug**
