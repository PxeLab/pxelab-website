# Config File Reference

> Complete structure and CLI parameters for PxeLab configuration files.

**Related**: [Getting Started](../getting-started.md) | [Deployment](../guides/deployment.md)

---

## Config File Location

PxeLab searches for config files in the following order:

1. Path specified by `--config` parameter
2. Current directory `./config.yaml`
3. Data directory `~/.pxelab/config.yaml`
4. `/etc/pxelab/config.yaml`

---

## Complete Config Structure

```yaml
# ── Global Settings ──
global:
  listen_addr: ":8080"           # HTTP listen address (default ":8080")
  data_dir: ""                   # Data directory (default ~/.pxelab/)
  server_name: "PxeLab"          # Server name
  app_mode: false                # App mode (auto-open browser)
  whitelist_enabled: false       # Global whitelist switch
  page_size: 50                  # List pagination size (default 50)

# ── Interface Config ──
interfaces:
  - name: eth0
    ip: 192.168.1.100
    auto_start: true             # Auto-start DHCP/ProxyDHCP on this interface
    tftp: false                  # Serve TFTP on this interface
    http: false                  # Serve HTTP on this interface
    subnets:
      - cidr: 192.168.1.0/24
        dhcp: server             # DHCP mode: server (full DHCP) / proxy / off
        pool: 192.168.1.100-192.168.1.200   # Legacy single address pool
        pools: ["192.168.1.100-192.168.1.200"]  # Multiple address pools
        gateway: 192.168.1.1
        dns_servers: "8.8.8.8"   # DNS servers handed out to clients
        next_server: "192.168.1.100"   # next-server handed out to clients
        lease_time: 3600         # Lease time (seconds, default 3600)
        whitelist_enabled: false # Subnet-level whitelist switch
        chain_to_ipxe: false     # pxelinux/grub2 → chain-load to iPXE

# ── Auth ──
auth:
  token: ""                      # API access token (plaintext; token_hash derived on save)
  token_hash: ""                 # SHA-256 hash of token (hex), takes precedence over token

# ── TFTP ──
tftp:
  port: 69                       # Default 69
  timeout: 5                     # Transfer timeout (seconds, default 5, 0=library default)

# ── DNS ──
dns:
  enabled: false
  port: 53                       # Default 53
  upstream: ""                   # Upstream DNS server; empty = no forwarding (local records only)
  local_domain: "pxelab.local"   # Local domain
  default_record: false          # Auto-add default A record
  default_record_ip: ""          # Default A record IP (auto-filled with first interface IP on save)

# ── NFS ──
nfs:
  enabled: false
  port: 2049                     # Default 2049
  mount_points:
    - label: "ISOs"              # Default mount point label
      export_path: "/"           # NFS export path
      local_dir: ""              # Local directory (default ~/.pxelab/boot/isos)
      read_only: true            # Read-only by default
      allow_ips: []              # Allowed IPs, empty = unrestricted
  # The following legacy fields are only used for automatic migration.
  # New configs should use mount_points:
  # root_dir: ""
  # read_only: true
  # allow_ips: []

# ── Boot Config ──
boot:
  root_dir: ""                   # Boot file directory (default ~/.pxelab/boot/)
  pxe_config_file: "pxelinux.cfg/default"   # PXELinux config file path
  grub_config_file: "grub2/grub.cfg"        # GRUB2 config file path
  default_menu:                  # Default boot menu
    title: "PxeLab Boot Menu"
    timeout: 0                   # Menu timeout (seconds), 0=no auto-select
    default: 0                   # Default selected entry index
    list_all_profiles: false     # List all profiles
    entries:
      - label: "Boot from local disk"
        type: local              # Type: direct / local / chain / sanboot / wds / netboot / custom
    #     kernel: ""             # Kernel path for direct type
    #     initrd: ""             # Initrd path for direct type
    #     cmdline: ""            # Kernel command line
    #     url: ""                # URL for chain / sanboot type
    #     wim: ""                # WIM file for wds type
  catalog_redirect:              # Catalog redirect
    enabled: true
    target_url: "http://{{ .URL }}/netboot/menu.ipxe?arch=${arch}&platform=${platform}"
    detect_arch: true            # Auto-detect architecture
    preamble: ""                 # Additional iPXE script before redirect
  catalog_display:               # Catalog display
    title: "[OS] Netboot OS Install Catalog"
    groups:
      - name: linux
        title: "Linux Distributions"
        enabled: true
        order: 1
        # ... more groups
  arch_map:                      # Architecture mapping (key=IANA arch code, usually UI-managed)
    0:                            # Intel x86PC (BIOS)
      nbp: ipxe                  # Bootloader type: ipxe / pxelinux / grub2
      chain_load: false          # Chain-load to iPXE
      ipxe: ipxe.pxe
      pxelinux: pxelinux.bios
    7:                            # EFI x86-64 (UEFI)
      nbp: ipxe
      ipxe: ipxe.efi
      grub: grubx64.efi
      secure_boot: false
      ipxe_sb: ipxe-x86_64-sb.efi       # Secure Boot signed iPXE
      shim_ipxe: shim-x86_64.efi        # UEFI Shim for iPXE
      grub_sb: grubx64.efi              # Secure Boot signed GRUB2
      shim_grub: shimx64.efi            # UEFI Shim for GRUB2
    # 11:                           # EFI ARM64
    #   nbp: ipxe
    #   ipxe: ipxe-arm64.efi
    # Other arch codes: 6=EFI IA32, 9=EFI BC, 10=EFI ARM32, 13=PPC_EPAPR,
    #                   14=PPC_OPAL, 25=EFI RISC-V32, 27=EFI RISC-V64, 37=LoongArch32, 39=LoongArch64

# ── Netboot ──
netboot:
  enabled: false              # Global switch (off by default, must be enabled manually)
  default_boot: "menu"           # Default boot mode (default "menu")
  fallback_online: true          # Fall back to online mode when catalog unavailable
  menu_title: "[OS] Netboot OS Install Catalog"
  script_template: ""            # Custom iPXE script (empty = visual config)
  failsafe_prompt: true
  proxy_https: true              # Proxy HTTPS resources
  cache_enabled: true            # Cache catalog files
  boot:                          # Same structure as top-level boot (default_menu/catalog_redirect/catalog_display/arch_map)
    default_menu:
      title: "PxeLab Boot Menu"
      timeout: 0
      default: 0
      entries: []
  sync:                          # Catalog sync source
    auto: false                  # Auto sync
    repo: "contrib/netboot.xyz"
    url: "https://github.com/netbootxyz/netboot.xyz.git"
  paths:                         # Catalog paths
    catalog: "netboot/catalog"
    scripts: "netboot/scripts"
    boot_files: "boot/netboot"

# ── iPXE Script (DHCP Option 175) ──
ipxe_script:
  enabled: true                  # Send Option 175 (iPXE script URL)
  port: 8080                     # HTTP port for script URL (default 8080)
  path: "/boot/ipxe/script"      # Script path (default /boot/ipxe/script)
  feature_flags: 1               # Sub-option 177 value (default 0x01 = HTTP mode)

# ── Service Auto-start ──
service_auto_start:
  http: true                     # Default true
  tftp: false
  dns: false
  nfs: false

# ── Storage ──
store:
  dsn: ""                        # SQLite path (default ~/.pxelab/pxelab.db)

# ── Logging ──
log:
  level: info                    # debug / info / warn / error
  format: text
  file: ""                       # Log file path, empty = default ~/.pxelab/logs/pxelab.log
  max_size_mb: 100               # Max file size (MB), 0=unlimited
  max_backups: 5                 # Number of rotated files to keep, 0=unlimited
  max_age_days: 30               # Retention days, 0=unlimited
  compress: true                 # gzip compress old logs
  cleanup_interval: 24           # Cleanup check interval (hours), 0=no auto cleanup

# ── Access Control Seeds (pre-seeded into black/whitelist on startup) ──
blacklist:                       # Blacklist seeds
  - mac: "AA:BB:CC:DD:EE:FF"
    reason: "Decommissioned device"

whitelist:                       # Whitelist seeds
  - mac: "11:22:33:44:55:66"
    subnet: "10.0.0.0/24"
    reason: "Server zone"
```

---

## CLI Parameters

```
pxelab [flags]

Flags:
  --config string       Config file path
  --data-dir string     Data directory (default "~/.pxelab")
  --log-level string    Log level: debug/info/warn/error (default "info")
  --mode string         Run mode ("app" auto-opens browser)
```

> Note: `--data-dir` and `--log-level` override the `global.data_dir` and `log.level` config items.
