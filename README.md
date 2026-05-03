# SmartWrite - 智能写作平台

一个基于 Next.js 的在线写作平台，提供简洁美观的文档编辑体验。

## 项目概述

SmartWrite 是一个现代化的在线写作工具，主要功能包括：
- ✅ 富文本编辑器（支持粗体、斜体、标题、列表等）
- ✅ 文档创建、编辑、删除
- ✅ 自动保存
- ✅ 用户认证（登录/注册）
- 📁 数据持久化（文件系统存储，无需数据库）
- 🗄️ 可选 MySQL 数据库支持

## 目录结构

```
smartwrite-ai/
├── apps/
│   └── web/                    # 主应用
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   │   ├── api/        # API 路由
│       │   │   │   └── documents/  # 文档 API
│       │   │   ├── editor/     # 编辑器页面
│       │   │   ├── layout.tsx  # 根布局
│       │   │   └── page.tsx    # 首页
│       │   ├── components/     # React 组件
│       │   │   ├── Auth/       # 认证组件
│       │   │   ├── Editor/     # 编辑器组件
│       │   │   └── ui/         # UI 组件
│       │   ├── context/        # React Context
│       │   ├── hooks/          # 自定义 Hooks
│       │   └── lib/            # 工具库
│       ├── public/             # 静态资源
│       ├── scripts/            # 脚本文件
│       ├── package.json
│       └── next.config.ts
├── packages/
│   └── db/                     # 数据库包（Prisma）
├── infrastructure/
│   └── docker/                 # Docker 配置
├── configs/
│   ├── eslint/                 # ESLint 配置
│   └── typescript/             # TypeScript 配置
├── package.json                # 根 package.json
├── pnpm-workspace.yaml         # pnpm monorepo 配置
└── README.md
```

## 快速开始

### 前置要求

- **Node.js**: v20.x 或更高版本
- **pnpm**: v8.x 或更高版本
- **磁盘空间**: 至少 1GB 可用空间

### 安装步骤

#### 1. 克隆项目

```bash
cd e:\githubproject\SmartWrite-AI
```

#### 2. 安装 pnpm（如果尚未安装）

```bash
npm install -g pnpm
```

#### 3. 安装项目依赖

在项目根目录运行：

```bash
pnpm install
```

#### 4. 启动开发服务器

```bash
pnpm dev
```

#### 5. 访问应用

打开浏览器，访问：
- **首页**: http://localhost:3000 （或 http://localhost:3001，如果3000端口被占用）
- **编辑器**: http://localhost:3000/editor （或 http://localhost:3001/editor）

### 首次使用

1. 打开 http://localhost:3000（或 http://localhost:3001）
2. 点击"注册"创建一个账号（或使用已有的账号登录）
3. 登录后会自动跳转到编辑器
4. 点击"新建文档"开始写作

## 数据存储

项目支持两种数据存储方式，默认使用**文件系统存储**：

### 文件系统存储（默认）

无需任何配置，数据会自动保存在项目根目录的 `.data/` 文件夹中：
- `.data/users.json` - 用户数据
- `.data/documents.json` - 文档数据

这种方式适合开发和个人使用，数据持久化且简单可靠。

### MySQL 存储（可选）

如果需要使用 MySQL 数据库，请参考 [MYSQL_SETUP.md](apps/web/MYSQL_SETUP.md) 进行配置。

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行代码检查 |

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 18 + Tailwind CSS 3.4
- **编辑器**: TipTap 2.9
- **包管理**: pnpm (monorepo)
- **语言**: TypeScript
- **数据存储**: 文件系统 / MySQL (可选)

## 主要功能模块

### 1. 认证系统
- 用户注册/登录/登出
- 会话管理（localStorage）
- 页面访问保护

### 2. 编辑器
- 富文本编辑（粗体、斜体、标题、列表）
- 自动保存（2秒防抖）
- 手动保存
- 文档标题编辑

### 3. 文件管理
- 创建新文档
- 删除文档
- 文档列表（按更新时间排序）
- 文档内容加载和保存

## 常见问题

### Q: 依赖安装失败怎么办？

A: 尝试以下步骤：
1. 清理 node_modules：`rm -rf node_modules pnpm-lock.yaml`
2. 重新安装：`pnpm install`
3. 如果还是失败，检查 Node.js 版本是否为 v20+

### Q: 数据保存在哪里？

A: 默认保存在项目根目录的 `.data/` 文件夹中，你可以直接查看或备份这些 JSON 文件。

### Q: 如何重置数据？

A: 删除 `.data/` 文件夹即可，重启应用后会自动创建新的空数据文件。

### Q: 支持深色模式吗？

A: 目前暂不支持，这是一个待开发的功能。

## 项目架构说明

### 前端应用 (apps/web)

这是项目的核心，包含：
- **页面路由**: 使用 Next.js App Router
- **状态管理**: 使用 React Context (AuthContext, FileManagerContext)
- **API 层**: 通过 `/api/documents` 与后端通信
- **组件库**: 自定义 UI 组件 + Tailwind CSS

### 数据层

数据存储采用了灵活的设计：
- API 路由会自动检测 MySQL 是否可用
- 如果 MySQL 可用，使用 MySQL 存储
- 否则自动降级到文件系统存储
- 两种存储方式使用相同的 API 接口

## 下一步

项目当前是一个基础可用的版本，还有很多可以改进的地方：
- 完善编辑器功能（图片、代码块、表格、链接等）
- 文档版本控制和历史记录
- 文件夹/标签分类
- 文档搜索
- 导出功能（PDF、Markdown）
- AI 辅助写作
- 多人协作
- 深色模式
- 响应式优化

---

祝你使用愉快！如有问题，欢迎随时反馈。
