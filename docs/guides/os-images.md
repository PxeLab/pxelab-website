# OS 镜像管理（系统镜像）

> ISO 镜像的上传、导入、挂载、解压与文件浏览——把系统镜像变成可引导的资源。

**相关文档**: [网络启动目录](netboot.md) | [文件管理](files.md) | [REST API 参考](../reference/api-reference.md)

---

## 什么时候用

- 需要**自己的系统镜像**（官方 ISO、定制镜像）用于网络安装 → 上传/导入 ISO
- 镜像内容要**直接引导**（免解压挂载）→ 挂载 ISO
- 检查镜像内容 → 文件浏览

入口：**基础配置 → 系统镜像**（`/os-images`）。

## API 端点

```
GET    /api/v1/os-images                # 列出所有镜像
POST   /api/v1/os-images/upload         # 上传 ISO
POST   /api/v1/os-images/import         # 导入本地文件
GET    /api/v1/os-images/{id}           # 获取镜像详情
PUT    /api/v1/os-images/{id}           # 更新元数据
DELETE /api/v1/os-images/{id}           # 删除镜像
POST   /api/v1/os-images/{id}/extract   # 解压 ISO
POST   /api/v1/os-images/{id}/mount     # 挂载 ISO
POST   /api/v1/os-images/{id}/unmount   # 卸载 ISO
POST   /api/v1/os-images/{id}/reprocess # 重新处理
GET    /api/v1/os-images/{id}/file      # 下载文件
```

---

## 功能

- **上传 ISO** — 拖拽或选择上传
- **导入本地文件** — 指定服务器本地路径导入
- **自动检测** — 自动识别发行版类型
- **挂载/卸载** — ISO 挂载点管理
- **文件浏览** — 浏览镜像挂载点内容
- **下载** — 下载镜像文件
- **重新处理** — 重新检测和解析镜像
