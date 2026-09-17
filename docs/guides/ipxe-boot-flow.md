# 引导流程与自定义 iPXE

> 从 PXE ROM 到引导菜单的完整链路、server / proxy 两种模式各自传递的 DHCP 参数，以及两种自定义 iPXE 引导的方式（修改 `autoexec.ipxe` vs 编译 `embedd.ipxe`）。

**相关文档**: [DHCP 模式详解](dhcp-modes.md) | [引导架构与无盘启动](boot-architecture.md) | [引导菜单配置](boot-config.md) | [自定义 iPXE 编译](../development/ipxe-build.md)

---

## 一、完整引导链路

PxeLab 使用两阶段引导架构，将 PXE ROM 的有限能力逐步升级到功能完整的 iPXE：

```
Stage 1:  PXE ROM ──TFTP──► iPXE 二进制（NBP）
           DHCP 获得 NBP 文件名（架构映射）

Stage 2:  iPXE ──HTTP──► /boot/ipxe/script ──► 引导菜单
           iPXE 自己 DHCP → 获取脚本 URL → 动态生成菜单
```

以非嵌入版 iPXE 为例，完整的请求序列：

```
① PXE ROM 启动
     │
     ├─ DHCP Discover（Option 60 = PXEClient, Option 93 = 架构）
     │
② PxeLab 响应 Offer（server / proxy 参数见下文）
     │  └─ BootFileName = NBP（如 ipxe.efi / ipxe.pxe，按架构映射）
     │
③ 客户端 TFTP 下载 NBP → iPXE 启动
     │
④ iPXE 执行 DHCP（不读 PXE ROM 缓存）
     │  └─ 识别为 iPXE 客户端（Option 60 = "iPXE"）
     │     └─ 服务器改发脚本 URL（Option 175.178）+ BootFileName = 脚本 URL
     │
⑤ iPXE 自动下载 autoexec.ipxe（非嵌入版约定）或直接执行内嵌脚本（嵌入版）
     │  └─ chain http://<server>:8080/boot/ipxe/script?mac=<mac>
     │
⑥ 服务器生成引导菜单（决策树：自定义脚本 → Profile → OS 目录 → 默认菜单）
     │
⑦ 客户端选择菜单项 → 引导系统
```

> **关键点**：第 ② 步返回 NBP（引导加载器），第 ④ 步之后 iPXE 自己重新做 DHCP，此时服务器识别出客户端已是 iPXE，改发脚本 URL——这就是两阶段切换的分水岭。

---

## 二、server 模式：引导逻辑与传递参数

server 模式下 PxeLab 是网络的**唯一 DHCP 服务器**，对所有客户端响应。PXE 客户端和非 PXE 客户端走不同分支。

### PXE ROM 客户端（第 ② 步的 Offer）

| 字段 / 选项 | 值 | 说明 |
|-------------|-----|------|
| `yiaddr` | 池中分配的 IP | PxeLab 负责整个 DHCP 生命周期 |
| `siaddr` | PxeLab 接口 IP | 作为 TFTP 服务器地址 |
| Option 54 (Server Identifier) | PxeLab 接口 IP | — |
| Option 1 (Subnet Mask) | 子网掩码 | 来自子网 CIDR |
| Option 3 (Router) | 子网网关 | 来自子网配置 |
| Option 6 (DNS) | 子网 DNS | 逗号分隔可多个 |
| Option 51 (Lease Time) | 租期秒数 | 默认 3600 |
| Option 43 (PXE Discovery Control) | `{6,1,0x0C}` | 子选项 6 = 禁用 PXE 服务器发现 + 禁止用户提示 |
| Option 66 (TFTP Server Name) | PxeLab IP | 通过 siaddr 隐含提供 |
| Option 67 (Boot File Name) | NBP 文件名 | 按架构映射，见下文 |
| Option 175.177 | `0x01` | 特征标志：BootFileName 走 HTTP 而非 TFTP |
| Option 175.178 | 脚本 URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

### iPXE 客户端（第 ④ 步的 Offer/Ack）

| 字段 / 选项 | 值 | 说明 |
|-------------|-----|------|
| `yiaddr` | 池中分配的 IP | 与普通 DHCP 一致 |
| Option 1/3/6/51 | 标准网络配置 | 与上表一致 |
| BootFileName | **脚本 URL** | 不再返回 NBP，直接给脚本地址 |
| Option 175.177 | `0x01` | HTTP 模式 |
| Option 175.178 | 脚本 URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

### 非 PXE 客户端

获得标准 DHCP 响应（IP + 子网掩码 + 网关 + DNS + 租期），**不含任何 PXE 选项**，正常上网。

---

## 三、proxy 模式：引导逻辑与传递参数

proxy 模式下 PxeLab **只响应 PXE/iPXE 客户端**，IP 由网络中现有 DHCP 服务器分配。PxeLab 的响应严格遵循 ProxyDHCP 语义：**全程 `yiaddr=0.0.0.0`，不发送网关/DNS/租期**。

### PXE ROM 客户端（第 ② 步的 Offer）

| 字段 / 选项 | 值 | 说明 |
|-------------|-----|------|
| `yiaddr` | `0.0.0.0` | **关键判据** — iPXE `dhcp_offer()` 以此识别 ProxyDHCP，存入 `proxydhcp` scope |
| `siaddr` | PxeLab 接口 IP | iPXE 将其存入 `proxydhcp/next-server` |
| Option 60 (Vendor Class) | `"PXEClient"` | **UEFI PXE Base Code 要求回写此选项才承认 PXE OFFER** |
| Option 54 (Server Identifier) | PxeLab 接口 IP | — |
| Option 66 (TFTP Server Name) | PxeLab IP | 显式文本形式 |
| Option 67 (Boot File Name) | NBP 文件名 | 按架构映射 |
| Option 43 (PXE Discovery Control) | `{6,1,0x0C}` | 禁用 PXE 服务器发现 + 禁止用户提示 |
| Option 175.178 | 脚本 URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

**不发送**：Option 1（掩码）、Option 3（网关）、Option 6（DNS）、Option 51（租期）——严格 ProxyDHCP 语义。

### iPXE 客户端（第 ④ 步的 Offer/Ack）

| 字段 / 选项 | 值 | 说明 |
|-------------|-----|------|
| `yiaddr` | `0.0.0.0` | 全程保持 |
| Option 60 | `"PXEClient"` | 同上 |
| `siaddr` | PxeLab IP | `proxydhcp/next-server` |
| BootFileName | **脚本 URL** | 直接给脚本地址 |
| Option 175.178 | 脚本 URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

### 非 PXE 客户端

**完全忽略，不响应** — 不干扰现有 DHCP 服务器的地址分配。

### 白名单在 proxy 下的行为

白名单检查（全局/子网级）发生在 DHCP 模式分支**之前**，因此 **proxy 模式同样受白名单约束**——白名单外的 MAC 即使走了 proxy 也不会收到 PXE 选项。

---

## 四、server / proxy 参数对照表

| 参数 | server | proxy |
|------|---------|-------|
| 分配 IP（`yiaddr`） | ✅ 池中分配 | ❌ 恒为 `0.0.0.0` |
| `siaddr` / Option 66 | ✅ PxeLab IP | ✅ PxeLab IP（`proxydhcp/next-server`） |
| Option 60 = PXEClient | ⚠️ 可选（不依赖） | ✅ **必需**（UEFI 识别关键） |
| Option 1 子网掩码 | ✅ | ❌ |
| Option 3 网关 | ✅ | ❌ |
| Option 6 DNS | ✅ | ❌ |
| Option 51 租期 | ✅ | ❌ |
| Option 43 Discovery Control | ✅ `{6,1,0x0C}` | ✅ `{6,1,0x0C}` |
| Option 67 NBP 文件名 | ✅ 按架构映射 | ✅ 按架构映射 |
| Option 175.177/178（脚本 URL） | ✅ | ✅ |
| 非 PXE 客户端 | ✅ 正常分配 IP | ❌ 忽略 |

---

## 五、NBP 架构映射

第 ② 步返回的 NBP 文件名按客户端架构（Option 93）自动选择：

| 客户端架构 | AL 码 | NBP |
|-----------|-------|-----|
| BIOS x86 | 0 | `ipxe.pxe` / `undionly.kpxe` |
| EFI IA32 | 6 | `ipxe32.efi` |
| EFI x64 | 7, 9 | `ipxe.efi` |
| EFI ARM64 | 11 | `ipxe-arm64.efi` |
| EFI RISCV64 | 27 | `ipxe-riscv64.efi` |

完整映射见[架构映射与 Secure Boot](../reference/boot-settings.md)。

---

## 六、autoexec.ipxe 与 embedd.ipxe

两个文件都是 iPXE 的**引导入口脚本**，区别在于 iPXE 二进制是否内嵌脚本：

| | `boot/autoexec.ipxe` | `boot/embedd.ipxe` |
|--|---------------------|--------------------|
| 适用二进制 | **非嵌入版**（默认 ipxe.pxe / ipxe.efi） | **嵌入版**（自编译，EMBED= 参数） |
| 何时执行 | iPXE 启动后**自动从 next-server 下载**（iPXE v2.0.0+ 约定） | 编译时**烧入二进制**，启动即执行 |
| 修改生效方式 | 改文件即可（无需重编译 iPXE） | 需要重新编译 iPXE + 重新打包 PxeLab |
| 额外网络往返 | 多一次 TFTP/HTTP 下载 | 无（脚本已在固件内） |

### 两者执行流程对比

**autoexec.ipxe**（非嵌入版）：

```ipxe
:netboot
dhcp net0 || goto dhcp_failed

# 优先使用 DHCP Option 175 注入的脚本 URL
isset ${script-url} && chain ${script-url} || goto use_nextserver
exit   # 成功 chain 后必须退出，防止落入下方 failsafe

:use_nextserver
# 三级回退确定 PxeLab 地址
isset ${next-server} && set pxelab-server ${next-server}
isset ${proxydhcp/next-server} && set pxelab-server ${proxydhcp/next-server}
isset ${pxelab-server} || set pxelab-server ${dhcp-server}
set pxelab-url http://${pxelab-server}:8080/boot/ipxe/script?mac=${net0/mac}
chain ${pxelab-url} || goto failsafe
exit
```

**embedd.ipxe**（嵌入版）结构相同，但没有 `script-url` 分支——直接从 DHCP 推断服务器地址：

```ipxe
:netboot
dhcp net0 || goto dhcp_failed
isset ${next-server} && set pxelab-server ${next-server}
isset ${proxydhcp/next-server} && set pxelab-server ${proxydhcp/next-server}
isset ${pxelab-server} || set pxelab-server ${dhcp-server}
set pxelab-url http://${pxelab-server}:8080/boot/ipxe/script?mac=${net0/mac}
chain ${pxelab-url} || goto failsafe
exit
```

> **iPXE 陷阱**：iPXE 的 label 不中断执行流。`chain` 成功后如果直接落入下一个 label（如 `:failsafe`），会错误显示 Failsafe 菜单——比如从菜单选「本地磁盘启动」`exit` 后反而弹出 Failsafe 菜单。**每次成功 chain 后必须显式 `exit`**。

---

## 七、自定义 iPXE 引导

有两种自定义方式，按需求选择。

### 方式一：修改 autoexec.ipxe（推荐，无需编译）

适用于使用默认非嵌入版 NBP 的场景，**改完立即生效**，不需要任何编译。

**运行时 boot 目录**是 TFTP/HTTP 实际服务的目录（默认 `<数据目录>/boot/`），直接编辑其中的 `autoexec.ipxe` 即可，保存即生效（无需重启服务）。

需要保持与仓库同步时，修改仓库 `boot/autoexec.ipxe` 后执行：

```bash
# 同步到 bootdist（嵌入二进制内嵌目录）
go generate ./cmd/pxelab/
# 重新编译 PxeLab
go build -o bin/pxelab ./cmd/pxelab/
```

> 修改 `autoexec.ipxe` 适合：调整引导菜单跳转逻辑、加调试输出、改 failsafe 回退策略、自定义 `script-url` 优先/回退逻辑。

### 方式二：编译 embedd 版 iPXE（需要编译链）

适用于需要**修改 iPXE 固件本身**的场景。编译前先明确：**默认 NBP 无法满足你的需求才需要编译**。

#### 什么时候需要编译 embedd 版

| 需求 | 默认 NBP 是否满足 | 需要编译 |
|------|------------------|---------|
| 调整引导菜单 / 跳转逻辑 | ✅ 改 autoexec 即可 | ❌ |
| 调整 failsafe 回退菜单 | ✅ 改 autoexec 即可 | ❌ |
| 需要 HTTPS 下载内核/initrd | ❌ 默认不含 `DOWNLOAD_PROTOCOL_HTTPS` | ✅ |
| 需要原生网卡驱动（全驱动版） | ⚠️ 默认 undionly 用 PXE ROM 网络栈 | ✅ |
| 需要 Secure Boot 签名 | ❌ 默认 ipxe.efi 未签名 | ✅ |
| 希望消除一次 TFTP 往返 | ⚠️ 可选优化 | ✅ |
| 需要自定义编译选项（协议/驱动裁剪） | ❌ | ✅ |

**典型场景**：你的 netboot 目录或 Profile 里引用了 `https://github.com/...` 等 HTTPS 地址下载安装镜像——此时必须编译开启 HTTPS 的嵌入版 iPXE。

#### 编译步骤（概要）

```bash
git clone --depth 1 https://github.com/ipxe/ipxe.git
cd ipxe/src
# 启用 HTTPS
echo '#define DOWNLOAD_PROTOCOL_HTTPS' >> config/general.h
# 使用仓库提供的脚本编译
make bin-x86_64-efi/ipxe.efi EMBED=/path/to/PxeLab/boot/embedd.ipxe
```

编译产物替换到两处：

```bash
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/boot/           # 运行时目录
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/cmd/pxelab/bootdist/  # 内嵌 bootdist
go build -o bin/pxelab ./cmd/pxelab/                       # 重新编译 PxeLab
```

完整编译指南（多架构、HTTPS 配置、Makefile 快捷目标）见[自定义 iPXE 编译](../development/ipxe-build.md)。

### bootdist 同步机制

`cmd/pxelab/bootdist/` 是随二进制内嵌的 boot 目录副本（`go:embed all:bootdist`），首次启动时释放到运行时 boot 目录。**修改 boot 目录文件后必须同步到 bootdist 并重新编译**，否则升级/重新部署后会回退到旧内容。

```
boot/（仓库源）──go:generate──► cmd/pxelab/bootdist/（内嵌）──go:embed──► 二进制
                                                                    │ 首次启动释放
                                                                    ▼
                                                          <数据目录>/boot/（运行时，TFTP/HTTP 服务）
```

---

## 八、Failsafe 菜单机制

开启 **设置 → 引导菜单 → Failsafe Prompt** 后，`/boot/ipxe/script` 不再直接返回菜单，而是返回一个 **autoexec 包装层**，先 chain 到 `/boot/ipxe/menu`（带失败重试）：

```
/boot/ipxe/script（failsafe 开启）
    └─► autoexec 包装层：chain /boot/ipxe/menu?mac=...
          └─ 失败 ──► Failsafe 菜单（本地启动 / 手动网络配置 / 重试 / 调试 shell / 重启）
                │
                └─► 重试 → 再次 chain /boot/ipxe/menu
```

Failsafe 菜单的兜底项 `Boot from local drive` 通过 `exit` 退出 iPXE，让客户端回落到本地磁盘启动。

---

## 九、常见问题排查

| 现象 | 原因 | 处理 |
|------|------|------|
| 菜单选「本地磁盘启动」后弹 Failsafe 菜单 | 脚本 chain 成功后缺 `exit`，落入后续 label | 检查 autoexec.ipxe / embedd.ipxe 每个 `chain` 后是否有 `exit` |
| 客户端 UEFI 模式收不到 PXE Offer | proxy 模式缺 Option 60 = PXEClient | 确认 PxeLab 版本（较老版本 UEFI 需临时 IP，新版已统一 yiaddr=0） |
| proxy 模式下白名单不生效 | — | 白名单检查在模式分支前执行，proxy 同样受约束；检查全局/子网白名单配置 |
| 自定义了 bootdist 但重装后回退 | 只改了运行时目录，未同步 bootdist | 按「bootdist 同步机制」同步并重编译 |
| HTTPS 内核下载失败 | 默认 iPXE 不含 HTTPS 协议 | 编译开启 `DOWNLOAD_PROTOCOL_HTTPS` 的嵌入版 |
| 修改 autoexec 后不生效 | 改错了文件 | 运行时生效的是 `<数据目录>/boot/autoexec.ipxe`，非仓库文件 |
