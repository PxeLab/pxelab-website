# 常见问题

> PxeLab 使用过程中的常见问题与解答。

**相关文档**: [快速开始](getting-started.md) | [故障排查](troubleshooting.md) | [配置文件参考](reference/config-file.md)

---

## 安装与启动

### Q: PxeLab 支持哪些操作系统？

**A:** PxeLab 支持以下平台：

| 操作系统 | 架构 | 说明 |
|---------|------|------|
| Linux | amd64, arm64 | 推荐用于生产环境 |
| Windows | amd64, arm64 | 支持 Windows 10+ |
| macOS | arm64, amd64 | 支持 macOS 12+ |

### Q: 需要安装什么依赖？

**A:** 无需任何依赖。PxeLab 是单个可执行文件，下载后直接运行。

```bash
# Linux/macOS
chmod +x pxelab
./pxelab

# Windows
pxelab.exe
```

### Q: 如何以系统服务方式运行？

**A:** Linux 系统可以使用 systemd：

```bash
# 创建服务文件
sudo tee /etc/systemd/system/pxelab.service << 'EOF'
[Unit]
Description=PxeLab PXE Server
After=network.target

[Service]
ExecStart=/usr/local/bin/pxelab
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动
sudo systemctl enable --now pxelab
```

### Q: 首次启动后访问不了 Web UI？

**A:** 检查以下几点：

1. 确认服务已启动：`curl http://localhost:8080/api/v1/services`
2. 检查端口是否被占用：`netstat -tlnp | grep 8080`
3. 检查防火墙规则是否放行 8080 端口
4. 查看日志：`./pxelab --log-level debug`

---

## 网络配置

### Q: 如何选择 DHCP 模式？

**A:** 根据网络环境选择：

| 场景 | 推荐模式 | 说明 |
|------|---------|------|
| 独立网络，无现有 DHCP | **server** | PxeLab 作为完整 DHCP 服务器 |
| 已有 DHCP 服务器 | **proxy** | 叠加 PXE 功能，不影响现有 DHCP |
| 仅使用 TFTP/HTTP | **off** | 关闭 DHCP，手动配置客户端 |

### Q: ProxyDHCP 和 Full DHCP 有什么区别？

**A:**

- **Full DHCP**：PxeLab 作为完整 DHCP 服务器，分配 IP 地址和 PXE 引导信息
- **ProxyDHCP**：PxeLab 仅提供 PXE 引导信息，IP 地址由现有 DHCP 服务器分配

ProxyDHCP 适合已有 DHCP 服务器的环境，无需修改现有 DHCP 配置。

### Q: 如何配置多网卡？

**A:** 每个网络接口可以独立配置 DHCP 模式（DHCP 模式配置在接口的子网下）：

```yaml
interfaces:
  - name: eth0
    ip: 192.168.1.1
    auto_start: true
    subnets:
      - cidr: 192.168.1.0/24
        dhcp: server          # server: 完整 DHCP 服务
        pool: 192.168.1.100-192.168.1.200
  - name: eth1
    ip: 10.0.0.1
    auto_start: true
    subnets:
      - cidr: 10.0.0.0/24
        dhcp: proxy           # proxy: 仅提供 PXE 引导信息
  - name: eth2
    ip: 172.16.0.1
    auto_start: true
    subnets:
      - cidr: 172.16.0.0/24
        dhcp: off             # off: 该子网关闭 DHCP
```

### Q: DHCP 端口 67 被占用怎么办？

**A:** 两种解决方案：

1. **停止占用端口的服务**（推荐）
2. **改用 ProxyDHCP 模式**（端口 4011，通常不冲突），在子网配置中把 DHCP 模式设为 `proxy`：

```yaml
interfaces:
  - name: eth0
    ip: 192.168.1.1
    subnets:
      - cidr: 192.168.1.0/24
        dhcp: proxy           # 使用 4011 端口，不占用 67
```

---

## iPXE 与引导

### Q: 什么是 iPXE？

**A:** iPXE 是开源网络引导固件，支持 HTTP、iSCSI、AoE 等协议。相比传统 PXE，iPXE 功能更强：

- 支持 HTTP 引导（更快、更灵活）
- 支持脚本编程（条件判断、变量）
- 支持更多架构和引导方式

PxeLab 内置预编译的 iPXE，无需自行编译。

### Q: 如何自定义引导菜单？

**A:** 在 Web UI 中：**设置 → 引导菜单 → 自定义 iPXE 脚本**

```ipxe
#!ipxe
dhcp || clear
menu Choose an OS
item ubuntu Ubuntu 22.04
item centos CentOS 9
item local Boot from local disk
choose --timeout 10000 target
goto ${target}

:ubuntu
chain http://192.168.1.10:8080/netboot/ubuntu.ipxe || shell

:centos
chain http://192.168.1.10:8080/netboot/centos.ipxe || shell

:local
sanboot || exit
```

### Q: Secure Boot 是什么？如何启用？

**A:** Secure Boot 是 UEFI 安全启动机制，确保只加载经过签名的引导加载程序。

PxeLab 支持 x86_64 和 ARM64 架构的 Secure Boot。在 Web UI 中：**设置 → Boot Settings → Secure Boot**

### Q: 支持哪些引导类型？

**A:**

| 类型 | 说明 | 典型用途 |
|------|------|---------|
| menu | 内置引导菜单（Profile 列表） | 默认引导项 |
| direct | 直接加载内核 + initrd | Linux 安装 |
| chain | 链式加载到另一个脚本 | 多级引导 |
| wds | Windows WDS 部署 | Windows 安装 |
| sanboot | iSCSI SAN 引导 | 无盘工作站 |
| netboot | 进入 OS 安装目录 | 网络装机 |
| local | 本地硬盘引导 | 默认引导项 |
| custom | 自定义 iPXE 脚本 | 高级场景 |

---

## 主机与 Profile

### Q: 主机和 Profile 是什么关系？

**A:**

- **主机 (Host)**：代表网络中的一台设备，通过 MAC 地址标识
- **Profile**：引导配置文件，定义主机的引导行为

一台主机可以绑定一个 Profile，Profile 决定该主机如何引导。

### Q: 如何批量导入主机？

**A:** PxeLab 没有 `/hosts/import` 端点。可通过 REST API 逐台创建，或使用 BMC 的 CSV 批量导入：

```bash
# 逐台创建主机（REST API）
curl -X POST http://localhost:8080/api/v1/hosts \
  -H "Content-Type: application/json" \
  -d '{"name":"server-01","mac":"AA:BB:CC:DD:EE:01","ip":"192.168.1.10"}'
```

```bash
# 批量导入 BMC 信息（CSV，裸 CSV body 或 JSON {"csv":"..."}）
curl -X POST http://localhost:8080/api/v1/bmc/configs/import \
  -d @bmc.csv
```

### Q: Profile 脚本版本管理是什么？

**A:** PxeLab 记录 Profile 脚本的每次修改历史：

- 查看历史版本
- 对比版本差异
- 回滚到任意版本

适合多人协作和变更审计。

---

## OS 安装目录

### Q: 如何添加新的 Linux 发行版？

**A:** 通过 Web UI：**网络启动目录 → 添加分组**

1. 上传 ISO 镜像到 OS 镜像管理
2. 创建分组（如 "Ubuntu"）
3. 添加条目，指向 ISO 挂载路径
4. 配置应答文件模板（可选）

### Q: 应答文件模板有什么用？

**A:** 应答文件模板用于自动化安装，无需手动交互：

- **Ubuntu/Debian**：preseed.cfg
- **CentOS/RHEL**：kickstart.cfg
- **Windows**：unattend.xml

PxeLab 提供预设模板，支持变量替换和自定义。

---

## 硬件管理

### Q: WOL 如何工作？

**A:** Wake-on-LAN 通过发送魔术包唤醒网络中的设备：

1. 在 Web UI 中添加目标主机的 MAC 地址
2. 点击唤醒按钮
3. PxeLab 发送 UDP 广播魔术包
4. 目标设备收到后开机

支持定时调度，可设置周期性唤醒任务。

### Q: BMC/IPMI 支持哪些操作？

**A:**

| 操作 | 说明 |
|------|------|
| power on | 开机 |
| power off | 关机 |
| power cycle | 重启 |
| power status | 查询电源状态 |
| set boot device | 设置下次启动设备（PXE / 硬盘 / 光驱等） |

支持 CSV 批量导入 BMC 信息，适合大规模部署。

---

## 性能与扩展

### Q: PxeLab 能支持多少台主机？

**A:** 取决于问的是哪种"支持"：

- **管理规模**（DHCP 租约 / 在线主机）：DHCP 是轻量协议，单核 / 512 MB 即可稳定管理数百台客户端，日常负载下 CPU/内存不是瓶颈
- **同时引导**：这才是真正的容量上限——多台客户端同时下载引导文件/ISO 时，瞬时负载远高于日常，受网络带宽、磁盘 IO 与引导方式限制（TFTP 串行，HTTP/iPXE 快一个量级）。大规模装机建议分批（20–50 台/批）

详细说明见[性能与大规模部署](guides/scale-and-performance.md)。

### Q: 如何监控 PxeLab 状态？

**A:** 三种监控方式：

1. **Web UI 仪表盘**：实时查看服务状态、流量、事件
2. **指标快照**：`GET /api/v1/metrics`（JSON 格式）
3. **日志**：实时日志流 + 审计日志

### Q: 数据存储在哪里？

**A:** 默认存储在用户主目录的 `.pxelab` 文件夹（全平台统一，没有 per-platform 路径差异）：

| 平台 | 路径 |
|------|------|
| Linux | `~/.pxelab/` |
| macOS | `~/.pxelab/`（即 `/Users/<用户名>/.pxelab/`） |
| Windows | `~/.pxelab/`（即 `C:\Users\<用户名>\.pxelab\`） |

可通过 `--data-dir` 参数自定义。

---

## 运维

### Q: 如何升级 PxeLab？

**A:**

1. 停止当前运行的 PxeLab
2. 下载新版本二进制替换旧文件
3. 数据目录 `~/.pxelab/` 无需变动，新版本自动迁移
4. 重新启动

### Q: 如何备份数据？

**A:** 备份 `~/.pxelab/` 整个目录即可。核心数据在 `pxelab.db` 和 `config.yaml`。

### Q: 支持 Docker 部署吗？

**A:** 暂不支持，在 Roadmap 中。当前推荐直接运行二进制。

> 客户端引导失败类问题（拿不到 IP、引导中断）请见[故障排查](troubleshooting.md)。
