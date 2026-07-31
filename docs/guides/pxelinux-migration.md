# PXELinux 兼容与迁移

> 老环境里的 pxelinux.cfg 配置如何继续用、如何平滑迁移到 iPXE 体系。

**相关文档**: [引导架构与无盘启动](boot-architecture.md) | [引导菜单配置](boot-config.md)

---

## 背景：PXELinux 是什么

PXELinux（SYSLINUX 家族）是传统 PXE 环境最常用的引导方案：用 `pxelinux.cfg` 文本配置描述引导菜单——`DEFAULT` 默认项、`TIMEOUT` 超时、`LABEL` 菜单项、`KERNEL/APPEND` 内核与参数。很多老机房的引导资产都以 pxelinux.cfg 文件的形式存在。

PxeLab 提供两条路：

1. **继续兼容**：直接把 PXELinux 作为引导方式，原有 pxelinux.cfg 资产继续可用
2. **迁移到 iPXE**：一键跳转，或逐步把配置翻译成 Profile 菜单

---

## 方式一：继续使用 PXELinux

PxeLab 内置 PXELinux 配置文件解析器（支持 `default`、`label`、`kernel`、`append`、`initrd`、`ipappend`、`menu label/default`、`timeout`、`ontimeout`、`onerror` 等语法）。

当客户端以 `pxelinux.0` / `pxelinux.efi` 引导时，PxeLab 按以下优先级响应配置请求：

1. **链式跳转**：子网启用了「链式加载到 iPXE」→ 返回跳转配置，让 iPXE 接管
2. **Profile 生成**：有默认 Profile（或按 MAC 匹配到主机）→ 把 Profile 菜单实时翻译成 PXELinux 语法返回
3. **静态文件兜底**：无 Profile → 返回引导目录里的静态文件（`pxelinux.cfg/default` 等）

也就是说：**即使不迁移，老配置和混合环境也能工作**——PXELinux 客户端走 PXELinux，iPXE 客户端走 iPXE。

---

## 方式二：迁移到 iPXE

### 快速迁移：开启「链式加载到 iPXE」

在 **基础配置 → 服务配置 → DHCP → 子网配置** 中开启「**链式加载到 iPXE**」。

此后 PXELinux/GRUB2 客户端请求配置时，会收到一段跳转配置（PXELinux 返回 `KERNEL http://server/boot/ipxe.efi`），自动加载 iPXE 并进入 PxeLab 的引导菜单。

适合：想立刻统一到 iPXE，但不想逐个翻译配置文件的环境。**零改动、可逆**——关闭开关即恢复原状。

### 逐步迁移：pxelinux.cfg → Profile 菜单

把关键引导项翻译成 PxeLab 的 Profile（**基础配置 → 引导菜单**），语法对照：

| pxelinux.cfg | PxeLab Profile 菜单 |
|--------------|---------------------|
| `DEFAULT ubuntu` | 菜单默认条目（is_default） |
| `TIMEOUT 50` | 菜单超时时间（0.1 秒 × 50 = 5 秒） |
| `LABEL ubuntu` / `MENU LABEL Install Ubuntu` | 菜单条目名称 |
| `KERNEL vmlinuz` / `INITRD initrd.img` | 引导类型 `direct` + 内核/initrd 文件 |
| `APPEND net.ifnames=0` | 引导参数（cmdline） |
| `KERNEL memdisk` + `APPEND initrd=xxx.iso` | 引导类型 `chain`（Memdisk ISO） |
| `KERNEL http://.../ipxe.efi`（链式加载） | 引导类型 `chain`（加载 iPXE） |
| `LOCALBOOT 0` | 引导类型 `local` |

翻译完成后，把 Profile 绑定到主机（或设为默认菜单），客户端下次引导即走新菜单。迁移过程中两种格式可并存：PXELinux 客户端继续读旧配置，iPXE 客户端走新菜单。

---

## 什么时候该迁移

| 情况 | 建议 |
|------|------|
| 老环境大量 pxelinux.cfg 资产，短期不想动 | 方式一（兼容），需要时可开链式跳转 |
| 想统一走 iPXE（HTTP 引导更快、菜单更丰富） | 方式二快速迁移（开开关） |
| 想要可视化配置、版本管理、按主机绑定 | 逐步迁移到 Profile（最终形态） |

---

## 常见问题

**Q: 开启「链式加载到 iPXE」后 PXELinux 客户端加载失败？**
检查 iPXE 引导文件是否可用：`pxelinux.cfg` 返回的 `KERNEL http://server/boot/ipxe.efi` 地址应能被客户端访问（HTTP 服务运行中）。

**Q: 部分老配置语法不支持？**
解析器覆盖常用语法；不支持的语法按忽略处理。复杂定制建议迁移到 Profile 或自定义 iPXE 脚本（设置 → Netboot → 自定义 iPXE 脚本）。
