# 环境变量与 CLI 参考

> PxeLab 的 CLI 参数、配置优先级与数据目录结构。

**相关文档**: [配置文件参考](config-file.md) | [部署模式](../guides/deployment.md)

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

> `--data-dir` 与 `--log-level` 分别覆盖 `global.data_dir` 与 `log.level` 配置项。

---

## 配置优先级

命令行参数 > 配置文件 > 默认值

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1（最高） | `--config` / `--data-dir` / `--log-level` 等 CLI 参数 | 命令行显式指定 |
| 2 | `config.yaml` | 配置文件（`--config` 指定路径，否则按搜索顺序查找） |
| 3（最低） | 内置默认值 | 硬编码默认值 |

> 注意：PxeLab **不读取任何 `PXELAB_*` 环境变量**。所有设置均通过 CLI 参数与配置文件管理。
> 数据目录默认值仅受系统用户主目录影响（`$HOME` / Windows `USERPROFILE`）。

---

## 数据目录结构

默认数据目录为 `~/.pxelab/`（可通过 `--data-dir` 或 `global.data_dir` 修改）：

```
~/.pxelab/
├── config.yaml          # 配置文件（保存设置时写回此处）
├── pxelab.db            # SQLite 数据库
├── boot/                # 引导文件根目录（iPXE、PXELinux、GRUB2 二进制）
│   ├── isos/            # 解压后的 OS 镜像（HTTP /boot/isos/*、NFS 默认导出）
│   ├── ipxe.efi
│   ├── undionly.kpxe
│   └── ...
├── isos/                # OS 镜像上传存储
│   └── mnt/             # 镜像挂载目录（isos/mnt/<id>）
├── netboot/             # 网络启动目录
│   ├── catalog/         # 发行版索引
│   ├── menu/            # 生成的启动菜单
│   └── scripts/         # 发行版脚本
├── cache/
│   └── netboot/         # 目录文件缓存
└── logs/                # 日志文件（默认 data_dir/logs/pxelab.log）
    └── pxelab.log
```
