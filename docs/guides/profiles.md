# 引导配置（Profile 操作）

> Profile（引导配置）是「一个引导项」：某个系统或某个启动方式的具体配置。本文讲 Profile 的创建与管理；引导决策链与菜单配置见 [引导菜单配置](boot-config.md)。

**相关文档**: [引导菜单配置](boot-config.md) | [主机管理](host-management.md) | [网络启动目录](netboot.md)

---

## 什么时候用

- 想加一个**引导项**（如「安装 Ubuntu 22.04」「从 SAN 启动」）→ 创建 Profile
- 想把 Profile **给特定机器用** → 绑定主机
- 改坏了一个引导项 → 版本回滚

入口：**基础配置 → 引导菜单（Profiles）**（`/profiles`）。列表展示名称、架构、是否默认、引导类型。

## 任务 1：创建 Profile

点击「新建」：

| 字段 | 说明 |
|------|------|
| Profile 名称 | 必填，如 `Install Ubuntu 22.04` |
| 架构 | 适用客户端架构（x86_64 / arm64 等） |
| 引导类型 | `direct` / `chain` / `sanboot` / `wds` / `local` / `custom` |
| 内核路径 / Initrd 路径 | `direct` 类型填写 |
| 命令行参数 | 内核参数 |
| URL | `chain` / `sanboot` 类型的目标地址 |

各类型含义见[引导菜单配置](boot-config.md)的引导类型表。

## 任务 2：从 OS 安装目录一键创建

不想手动填内核/initrd？在 OS 安装目录中选中发行版 → 「创建 Profile」——PxeLab 自动从目录条目生成对应 Profile，省去查镜像路径。

## 任务 3：版本管理

每次修改 Profile（特别是 `custom` 类型脚本）自动保存版本快照：

- **查看历史版本**：Profile 详情 → 版本列表
- **差异对比**：比较当前与历史版本的差异
- **回滚**：一键恢复到任意历史版本

适合多人协作与变更审计：改错了随时回退。

## 任务 4：设为默认

Profile 列表可标记「默认」：在未绑定主机、未启用 OS 目录跳转的场景，默认 Profile 作为引导项出现（见[引导菜单配置](boot-config.md)的默认菜单配置）。
