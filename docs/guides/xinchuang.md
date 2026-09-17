# 信创装机（openEuler / 麒麟 / 统信 UOS）

> 通过 PxeLab Hub 的「信创 OS 内容包」网络安装国产操作系统：openEuler 导入即装；麒麟 Kylin V10、统信 UOS 为两段式内容包，需自备安装镜像。

**相关文档**: [网络启动目录](netboot.md) | [安装任务](install-tasks.md) | [应答文件模板](answer-templates.md) | [文件管理](files.md)

---

## 内容包一览

| 系统 | 架构 | 镜像来源 | 应答方式 | 验证状态 |
|---|---|---|---|---|
| openEuler 24.03 LTS SP3 | x86_64 / aarch64 | 公网（repo.openeuler.org） | kickstart（可选） | 官方镜像，URL 已验证 |
| 麒麟 Kylin V10 SP3 | x86_64 / aarch64 | **需自备**（非公开分发） | kickstart | 社区贡献，未实测 |
| 统信 UOS Server V20 | x86_64 / aarch64 | **需自备**（非公开分发） | kickstart | 社区贡献，未实测 |

麒麟与统信均为 anaconda 系安装器，无人值守应答走 kickstart（`inst.ks=`）。

## openEuler：导入即装

1. 打开 **PxeLab Hub**（商店）页，找到 **openEuler**，点击「导入」。
2. 导入后条目出现在 **网络启动目录**，同时生成可直接指派的引导配置（Profile）。
3. 客户端 PXE 引导选择 openEuler-24.03-LTS-SP3（按客户端架构自动过滤 x86_64/aarch64 版本）即可进入安装器。

内核与 initrd 直接从 `repo.openeuler.org` 回源（HTTP 302 到 CDN），安装源通过 cmdline 的 `inst.repo=` 自动指向官方仓库，无需任何手工配置。内网环境可在目录的覆盖（Overlay）中把内核/initrd/仓库地址改到本地镜像。

## 麒麟 / UOS：两段式内容包

镜像非公开分发，内容包只提供**引导配置**与 **kickstart 应答模板**两段内容。导入时界面会明确提示「需自备安装镜像」，并自动跳转网络启动目录；导入的 kickstart 应答模板可在 **应答文件模板** 页查看（创建安装任务时选用）。

补齐镜像的步骤（以麒麟 x86_64 为例，aarch64 目录名对应替换）：

1. **提取引导文件** — 从 Kylin V10 SP3 安装 ISO 中提取 `images/pxeboot/vmlinuz` 与 `images/pxeboot/initrd.img`。注意麒麟的引导文件位于 `images/pxeboot/`（与 CentOS 系略有差异），不要使用 `isolinux/` 下的内核。
2. **上传内核/initrd** — 打开 **文件管理**，把两个文件上传到 `netboot/kylin/v10sp3-x86_64/`（UOS 为 `netboot/uos/v20-x86_64/`）。目录条目默认引用该本地路径。
3. **提供安装源** — 把 ISO 完整内容（含 `.treeinfo`、`Packages`、`repodata`）解压到 HTTP 或 NFS 可访问的路径（可用 PxeLab 自身的 NFS/HTTP 服务），然后在网络启动目录该条目的 **覆盖（Overlay）** 中，把对应版本的 cmdline 追加 `inst.repo=<该路径>`。
4. **创建安装任务** — 在 **安装任务** 页选择该发行版版本并关联导入的 kickstart 应答模板。条目的 `answer_param`（<code v-pre>inst.ks={{.AnswerURL}}</code>）会自动把应答文件 URL 注入内核 cmdline，无需手工配置覆盖。

补齐前，目录条目带有「需自备镜像」徽标；缺少文件时 PXE 引导会失败，请先完成上述步骤。

## LoongArch（龙芯）引导注意事项

- PxeLab 自带龙芯 iPXE 二进制（`ipxe-loong64.efi`，另有 Secure Boot 签名版 `ipxe-loong64-sb.efi`），默认架构映射已覆盖 IANA 架构号 **37（EFI LoongArch32）与 39（EFI LoongArch64）**，DHCP 会按客户端架构自动下发龙芯 bootloader，无需手工配置。
- 龙芯客户端只支持 **UEFI 网络引导**（无 BIOS/pxelinux 路径），请确认客户端固件设置为 UEFI PXE。
- openEuler、麒麟、统信均提供 loong64 架构镜像，但商店内容包当前仅收录 x86_64/aarch64 条目；龙芯镜像多为非公开或厂商渠道分发，请参照麒麟/UOS 的「自备镜像」流程手工补齐：在覆盖（Overlay）中为版本填入 loong64 的 kernel/initrd 地址与 `inst.repo`。
- 部分龙芯固件的 iPXE 驱动兼容性有限，若 iPXE 无法起网，可改用 `snponly-loong64.efi`（SNP 驱动）在 **设置 → 架构映射** 中替换。
