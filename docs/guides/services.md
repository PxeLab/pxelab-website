# 服务配置

> 聚合管理六个网络服务：DHCP、DNS、NFS、TFTP、引导选项、OS 安装目录。几乎所有网络行为都在这里配置。

**相关文档**: [DHCP 配置](dhcp.md) | [界面速览](web-ui.md) | [部署模式](deployment.md)

---

## 什么时候用

- 客户端**拿不到 IP / 引导不到系统** → 从这里检查 DHCP 与引导选项
- 要调整**域名解析、文件共享、引导文件** → 都在这一组
- 入口：**基础配置 → 服务配置**（六个子页在二级子导航中）

## 子页速查

### DHCP（/services/dhcp）

接口与子网管理：每个接口可配置一个或多个子网，独立设置 DHCP 模式（server / proxy / off）、地址池、网关、DNS、租约；三个页签：**子网管理 / 租约管理 / 预留管理**。

详见 [DHCP 配置](dhcp.md)。

### DNS（/services/dns）

本地 DNS 解析：上游转发、本地域名、A / AAAA / CNAME 记录、子网感知解析。

详见 [DNS 服务参考](../reference/dns.md)。

### NFS（/services/nfs）

网络文件共享：多挂载点管理（标签、导出路径、本地目录、只读、IP/CIDR 白名单）、连接状态与客户端列表、端口配置。

详见 [NFS 服务参考](../reference/nfs.md)。

### TFTP（/services/tftp）

引导文件服务：端口与超时设置、引导文件管理（iPXE / PXELinux / GRUB2 三栏展示架构对应关系）、文件上传与删除。

详见 [TFTP 服务参考](../reference/tftp.md)。

### 引导选项（/boot-settings）

架构映射管理：客户端架构 → 引导文件映射表（含 Secure Boot 支持状态）、引导文件健康检查、NBP 类型切换、iPXE 脚本设置。

详见 [架构映射与 Secure Boot](../reference/boot-settings.md)。

### OS 安装目录（/netboot-catalog）

内置发行版安装菜单：分组启用/禁用、标题编辑、拖拽排序、缓存统计。

详见 [网络启动目录](netboot.md)。

## 服务状态与启停

页面顶部的**服务状态栏**显示六个服务的运行状态与端口：

- 每个服务可单独启动 / 停止 / 重启，或一键全部操作
- HTTP 为核心服务，不可停止
- 配置修改后，若提示需要重启服务，在状态栏执行重启即可
