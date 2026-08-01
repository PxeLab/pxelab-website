# 配置文件参考

> PxeLab 配置文件的完整结构与 CLI 参数说明。

**相关文档**: [快速开始](../getting-started.md) | [部署模式](../guides/deployment.md)

---

## 配置文件位置

PxeLab 按以下顺序搜索配置文件：

1. `--config` 参数指定的路径
2. 当前目录 `./config.yaml`
3. 数据目录 `~/.pxelab/config.yaml`
4. `/etc/pxelab/config.yaml`

---

## 完整配置结构

```yaml
# ── 全局设置 ──
global:
  listen_addr: ":8080"           # HTTP 监听地址（默认 ":8080"）
  data_dir: ""                   # 数据目录（默认 ~/.pxelab/）
  server_name: "PxeLab"          # 服务器名称
  app_mode: false                # App 模式（自动打开浏览器）
  whitelist_enabled: false       # 全局白名单开关
  page_size: 50                  # 列表分页大小（默认 50）

# ── 接口配置 ──
interfaces:
  - name: eth0
    ip: 192.168.1.100
    auto_start: true             # 自动启动该接口上的 DHCP/ProxyDHCP
    tftp: false                  # 是否在该接口提供 TFTP
    http: false                  # 是否在该接口提供 HTTP
    subnets:
      - cidr: 192.168.1.0/24
        dhcp: server             # DHCP 模式：server（完整 DHCP）/ proxy / off
        pool: 192.168.1.100-192.168.1.200   # 兼容旧格式的单地址池
        pools: ["192.168.1.100-192.168.1.200"]  # 多地址池
        gateway: 192.168.1.1
        dns_servers: "8.8.8.8"   # 下发给客户端的 DNS 服务器
        next_server: "192.168.1.100"   # 下发给客户端的 next-server
        lease_time: 3600         # 租约时间（秒，默认 3600）
        whitelist_enabled: false # 子网级白名单开关
        chain_to_ipxe: false     # pxelinux/grub2 → 链式加载 iPXE

# ── 认证 ──
auth:
  token: ""                      # API 访问令牌（明文，保存时自动派生 token_hash）
  token_hash: ""                 # 令牌的 SHA-256 哈希（hex），优先于 token

# ── TFTP ──
tftp:
  port: 69                       # 默认 69
  timeout: 5                     # 传输超时（秒，默认 5，0=使用库默认）

# ── DNS ──
dns:
  enabled: false
  port: 53                       # 默认 53
  upstream: ""                   # 上游 DNS 服务器，空=不转发（仅应答本地记录）
  local_domain: "pxelab.local"   # 本地域名
  default_record: false          # 是否自动添加默认 A 记录
  default_record_ip: ""          # 默认 A 记录 IP（保存时自动填充第一个接口 IP）

# ── NFS ──
nfs:
  enabled: false
  port: 2049                     # 默认 2049
  mount_points:
    - label: "ISOs"              # 默认挂载点标签
      export_path: "/"           # NFS 导出路径
      local_dir: ""              # 本地目录（默认 ~/.pxelab/boot/isos）
      read_only: true            # 默认只读
      allow_ips: []              # 允许访问的 IP 列表，空=不限制
  # 以下为旧格式字段，仅用于自动迁移，新配置请使用 mount_points：
  # root_dir: ""
  # read_only: true
  # allow_ips: []

# ── 引导配置 ──
boot:
  root_dir: ""                   # 引导文件目录（默认 ~/.pxelab/boot/）
  pxe_config_file: "pxelinux.cfg/default"   # PXELinux 配置文件路径
  grub_config_file: "grub2/grub.cfg"        # GRUB2 配置文件路径
  default_menu:                  # 默认引导菜单
    title: "PxeLab Boot Menu"
    timeout: 0                   # 菜单超时（秒），0=不自动选择
    default: 0                   # 默认选中项索引
    list_all_profiles: false     # 是否列出所有 Profile
    entries:
      - label: "Boot from local disk"
        type: local              # 类型：direct / local / chain / sanboot / wds / netboot / custom
    #     kernel: ""             # direct 类型的内核路径
    #     initrd: ""             # direct 类型的 initrd 路径
    #     cmdline: ""            # 内核启动参数
    #     url: ""                # chain / sanboot 类型的 URL
    #     wim: ""                # wds 类型的 WIM 文件
  catalog_redirect:              # 目录重定向
    enabled: true
    target_url: "http://{{ .URL }}/netboot/menu.ipxe?arch=${arch}&platform=${platform}"
    detect_arch: true            # 自动检测架构
    preamble: ""                 # 重定向前的附加 iPXE 脚本
  catalog_display:               # 目录展示
    title: "[OS] Netboot OS Install Catalog"
    groups:
      - name: linux
        title: "Linux Distributions"
        enabled: true
        order: 1
        # ... 更多分组
  arch_map:                      # 架构映射（键=IANA 架构码，通常由 UI 自动管理）
    0:                            # Intel x86PC（BIOS）
      nbp: ipxe                  # 引导加载器类型：ipxe / pxelinux / grub2
      chain_load: false          # 是否链式加载到 iPXE
      ipxe: ipxe.pxe
      pxelinux: pxelinux.bios
    7:                            # EFI x86-64（UEFI）
      nbp: ipxe
      ipxe: ipxe.efi
      grub: grubx64.efi
      secure_boot: false
      ipxe_sb: ipxe-x86_64-sb.efi       # Secure Boot 签名的 iPXE
      shim_ipxe: shim-x86_64.efi        # iPXE 的 UEFI Shim
      grub_sb: grubx64.efi              # Secure Boot 签名的 GRUB2
      shim_grub: shimx64.efi            # GRUB2 的 UEFI Shim
    # 11:                           # EFI ARM64
    #   nbp: ipxe
    #   ipxe: ipxe-arm64.efi
    # 其余架构码：6=EFI IA32、9=EFI BC、10=EFI ARM32、13=PPC_EPAPR、
    #            14=PPC_OPAL、25=EFI RISC-V32、27=EFI RISC-V64、37=LoongArch32、39=LoongArch64

# ── Netboot ──
netboot:
  enabled: false               # 全局开关（默认关闭，需手动启用）
  default_boot: "menu"           # 默认启动方式（默认 "menu"）
  fallback_online: true          # 目录不可用时回退在线模式
  menu_title: "[OS] Netboot OS Install Catalog"
  script_template: ""            # 自定义 iPXE 脚本（留空用可视化配置）
  failsafe_prompt: true
  proxy_https: true              # 代理 HTTPS 资源
  cache_enabled: true            # 缓存目录文件
  boot:                          # 同顶层 boot 结构（default_menu/catalog_redirect/catalog_display/arch_map）
    default_menu:
      title: "PxeLab Boot Menu"
      timeout: 0
      default: 0
      entries: []
  sync:                          # 目录同步源
    auto: false                  # 自动同步
    repo: "contrib/netboot.xyz"
    url: "https://github.com/netbootxyz/netboot.xyz.git"
  paths:                         # 目录路径
    catalog: "netboot/catalog"
    scripts: "netboot/scripts"
    boot_files: "boot/netboot"

# ── iPXE 脚本（DHCP Option 175）──
ipxe_script:
  enabled: true                  # 是否发送 Option 175（iPXE 脚本 URL）
  port: 8080                     # HTTP 端口，用于生成脚本 URL（默认 8080）
  path: "/boot/ipxe/script"      # 脚本路径（默认 /boot/ipxe/script）
  feature_flags: 1               # 子选项 177 值（默认 0x01 = HTTP 模式）

# ── 服务自动启动 ──
service_auto_start:
  http: true                     # 默认 true
  tftp: false
  dns: false
  nfs: false

# ── 存储 ──
store:
  dsn: ""                        # SQLite 路径（默认 ~/.pxelab/pxelab.db）

# ── 日志 ──
log:
  level: info                    # debug / info / warn / error
  format: text
  file: ""                       # 日志文件路径，为空则使用默认 ~/.pxelab/logs/pxelab.log
  max_size_mb: 100               # 单文件最大体积 (MB)，0=不限制
  max_backups: 5                 # 保留轮转文件数，0=不限制
  max_age_days: 30               # 保留天数，0=不限制
  compress: true                 # 是否 gzip 压缩旧日志
  cleanup_interval: 24           # 清理检查间隔（小时），0=不自动清理

# ── 访问控制种子（启动时预置到黑/白名单）──
blacklist:                       # 黑名单种子
  - mac: "AA:BB:CC:DD:EE:FF"
    reason: "已报废设备"

whitelist:                       # 白名单种子
  - mac: "11:22:33:44:55:66"
    subnet: "10.0.0.0/24"
    reason: "服务器区"
```

---

## CLI 参数

```
pxelab [flags]

Flags:
  --config string       配置文件路径
  --data-dir string     数据目录 (default "~/.pxelab")
  --log-level string    日志级别: debug/info/warn/error (default "info")
  --mode string         运行模式 ("app" 将自动打开浏览器)
```

> 说明：`--data-dir` 与 `--log-level` 会覆盖 `global.data_dir` 与 `log.level` 配置项。
