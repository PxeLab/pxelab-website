# TFTP 服务

> TFTP 服务配置与引导文件管理。

**相关文档**: [架构映射与 Secure Boot](boot-settings.md) | [文件管理](../guides/files.md) | [引导配置](../guides/boot-config.md)

---

## 服务配置

TFTP 服务提供 NBP（Network Bootstrap Program）文件传输：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 端口 | 69 | UDP |
| 超时 | 5 | 传输超时（秒），0=使用库默认 |
| 根目录 | `~/.pxelab/boot/` | 引导文件根目录 |
| PXELinux 配置 | `pxelinux.cfg/default` | PXELinux 配置文件路径 |
| GRUB2 配置 | `grub2/grub.cfg` | GRUB2 配置文件路径 |

Web UI：**服务配置 → TFTP**（`/services/tftp`）

TFTP 服务根据架构映射自动选择正确的引导文件返回给客户端。引导文件内嵌在二进制中，首次运行时释放到数据目录。

---

## 引导文件管理

引导文件管理不在 TFTP 页面内，而是独立的 **文件管理** 页面（Web UI 左侧导航 → **文件管理**，`/files`）：

- **上传文件**：手动上传自定义引导文件到引导文件根目录
- **删除文件**：删除不需要的引导文件
- **浏览目录**：表格展示名称、大小、修改时间、MD5 哈希

架构映射（引导加载器选择与 Secure Boot 链）与引导文件完整性检查位于 **Boot Settings** 页面（`/boot-settings`），详见 [架构映射与 Secure Boot](boot-settings.md)。
