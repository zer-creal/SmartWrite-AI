# MySQL 后端配置说明

## 已完成的配置步骤

### 1. 安装依赖
- 在 `package.json` 中添加了 `mysql2` 依赖
- 运行 `npm install` 安装

### 2. 数据库配置文件
- 创建/更新了 `src/lib/mysql-config.js`
- 配置了连接参数：
  - host: localhost
  - port: 3307
  - user: root
  - password: mysql@123456
  - database: smartwrite

### 3. 数据库连接模块
- 创建/更新了 `src/lib/mysql.js`
- 提供了数据库连接池和查询功能

### 4. 数据库初始化脚本
- 创建了 `scripts/init-mysql.cjs`
- 功能：
  - 连接到 MySQL 服务器
  - 创建数据库（如果不存在）
  - 创建用户表和文档表
  - 创建默认用户

### 5. API 路由
- `/api/documents` - GET（获取列表）/ POST（创建文档）
- `/api/documents/[docId]` - GET（获取详情）/ PUT（更新）/ DELETE（删除）

### 6. 前端集成
- 更新了 `FileManagerContext` - 从本地存储改为使用 API
- 更新了 `TiptapEditor` - 支持从 API 加载文档内容

## 下一步：启动 MySQL 服务并初始化数据库

### 确保 MySQL 服务在端口 3307 上运行

### 运行数据库初始化脚本
```bash
cd apps/web
node scripts/init-mysql.cjs
```

## 数据库表结构

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键，用户ID |
| email | VARCHAR(255) | 唯一，用户邮箱 |
| name | VARCHAR(255) | 用户名称 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### documents 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键，文档ID |
| title | VARCHAR(255) | 文档标题 |
| content | JSON | 文档内容（JSON格式） |
| user_id | VARCHAR(36) | 外键，关联用户 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## API 使用说明

### 获取文档列表
```
GET /api/documents
```

### 创建文档
```
POST /api/documents
Content-Type: application/json
{
  "title": "文档标题",
  "content": null
}
```

### 获取单个文档
```
GET /api/documents/[docId]
```

### 更新文档
```
PUT /api/documents/[docId]
Content-Type: application/json
{
  "title": "新标题",
  "content": { ... }
}
```

### 删除文档
```
DELETE /api/documents/[docId]
```
