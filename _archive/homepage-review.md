# PxeLab 官网首页内容评审

> 基于 `apps/web/src/pages/index.astro` 及其组件的静态内容分析。

## 一、整体结构

首页共 11 个区块：

1. Nav（导航）
2. Hero（首屏）
3. Features（核心能力 Bento）
4. Platform（平台能力）
5. UIPreview（界面预览）
6. Architecture（工作原理）
7. Matrix（架构支持矩阵）
8. QuickStart（快速开始）
9. FAQ（常见问题）
10. Acknowledgments（致谢）
11. CTA + Footer（行动号召 + 页脚）

结构完整，覆盖了“是什么、能做什么、怎么做、常见问题、致谢”的完整漏斗。

## 二、优点

- **首屏价值清晰**：“All-in-one PXE server with a modern web UI” 一句话说清定位。
- **技术覆盖面全**：DHCP/TFTP/HTTP/DNS/NFS、多架构、Server/App 双模式、WOL/IPMI/OS 部署都有体现。
- **架构矩阵专业**：支持 BIOS/UEFI/ARM64/RISC-V/LoongArch 并标明 Secure Boot，对运维人群很有说服力。
- **快速开始实用**：给出了具体命令，降低首次体验门槛。
- **开源协议明确**：Hero badge 直接标注 Open Source · AGPL-3.0。
- **国际化**：中英文切换已预留。

## 三、不足与优化建议

### 1. Hero 标题缺乏 slogan

**问题**：`h1` 只有 `PxeLab`，没有一句话标语。

**建议**：增加副标题，例如：

> PxeLab — 一体化 PXE 网络引导服务器  
> 用一个二进制文件，替代 DHCP + TFTP + HTTP + DNS + NFS 的全套 PXE 基础设施。

### 2. 缺少真实 UI 截图

**问题**：`UIPreview` 是 CSS 手绘的 mock，用户无法判断真实界面质感。

**建议**：替换为实际 Web UI 的截图或短视频/GIF，展示 dashboard、主机列表、引导菜单编辑器等真实界面。

### 3. 快速开始命令存在断链风险

**问题**：`curl` 命令把 URL 折行写成 `github.com/PxeLab/pxelab/\releases/latest/download/\pxelab_linux_amd64.tar.gz`，直接复制粘贴会 404。

**建议**：改为单行可执行命令，或提供复制按钮。

```bash
curl -LO https://github.com/PxeLab/pxelab/releases/latest/download/pxelab_linux_amd64.tar.gz
tar xzf pxelab_linux_amd64.tar.gz
chmod +x pxelab
./pxelab
```

### 4. 缺少社会认同与差异化

**问题**：没有用户案例、GitHub Star 数、下载量、与竞品（如 Foreman、Cobbler、netboot.xyz）的对比。

**建议**：增加一个轻量对比区或用户证言区，例如：

> “替代 Cobbler 的现代化选择，无需 Python 依赖，单个二进制即可运行。”

### 5. Architecture 与 Features 有重复

**问题**：Features 区已有 “Two-stage network boot” 流程图，Architecture 区又讲了一次。

**建议**：Features 区保留高密度能力卡片；Architecture 区改成更完整的端到端流程图（含 client → DHCP → TFTP → iPXE → HTTP → NFS → OS install），或合并为一个视觉更强的区块。

### 6. CTA 区行动点单一

**问题**：底部 CTA 只有 GitHub、Docs、Download，缺少 “Get started in 5 minutes” 的引导。

**建议**：CTA 按钮直接链到 QuickStart 或 `/docs/getting-started`，并补充一句“30 秒启动，5 分钟部署第一台机器”。

### 7. 移动端可读性需验证

Bento 网格、架构矩阵、代码块在移动端可能过密，建议实际用手机预览并调整。

## 四、结论

当前首页内容**合理、全面**，能够体现 PxeLab 的核心技术优势（一体化、多架构、现代 UI、跨平台）。但要真正“高端大气”并提升转化，建议优先做三件事：

1. 用真实 UI 截图/视频替换 CSS mock。
2. 优化 Hero slogan 和 QuickStart 命令的可执行性。
3. 增加与竞品/传统方案的差异化对比或社会认同。
