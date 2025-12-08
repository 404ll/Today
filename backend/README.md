后端 README 内容如下，可直接创建 `backend/README.md`：

```markdown
# Today Backend API

基于 Express + Prisma + PostgreSQL 的 RESTful API 服务，为前端应用提供会话、待办和消息的数据管理。

## 📦 技术栈

- **Express** - Node.js Web 框架
- **Prisma** - 类型安全的 ORM（对象关系映射）
- **PostgreSQL** - 关系型数据库
- **TypeScript** - 类型安全的 JavaScript

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装生产依赖
npm install express cors dotenv prisma @prisma/client

# express - Web 框架，处理 HTTP 请求
# cors - 跨域资源共享中间件，允许前端跨域访问
# dotenv - 环境变量管理，从 .env 文件读取配置
# prisma - Prisma CLI 工具，用于数据库迁移和生成
# @prisma/client - Prisma 客户端，提供类型安全的数据库访问
```

```bash
# 安装开发依赖
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon

# typescript - TypeScript 编译器
# @types/* - TypeScript 类型定义文件
# ts-node - 直接运行 TypeScript 文件（无需编译）
# nodemon - 开发时自动重启服务器（监听文件变化）
```

### 2. 配置数据库

创建 `.env` 文件：

```env
DATABASE_URL="postgresql://用户名:密码@localhost:5432/today_db?schema=public"
PORT=3000
NODE_ENV=development
```

**说明**：
- `DATABASE_URL` - PostgreSQL 连接字符串，格式：`postgresql://用户:密码@主机:端口/数据库名`
- 确保 PostgreSQL 已安装并运行
- 数据库 `today_db` 需要先创建（可通过 `createdb today_db` 或 pgAdmin）

### 3. 初始化数据库

```bash
# 运行数据库迁移（创建表结构）
npm run prisma:migrate

# 生成 Prisma Client（生成类型定义和客户端代码）
npm run prisma:generate
```

**说明**：
- `prisma:migrate` - 根据 `prisma/schema.prisma` 创建数据库表
- `prisma:generate` - 生成 TypeScript 类型，让代码有自动补全和类型检查

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 📁 项目结构

```
backend/
├── src/
│   ├── index.ts           # 应用入口，Express 配置
│   ├── lib/
│   │   └── prisma.ts      # Prisma Client 单例
│   └── routes/
│       └── sessions.ts     # Sessions 路由处理
├── prisma/
│   └── schema.prisma      # 数据库模型定义
├── .env                   # 环境变量（不提交到 Git）
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖和脚本
```

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（自动重启） |
| `npm run build` | 编译 TypeScript 到 `dist/` 目录 |
| `npm start` | 运行编译后的生产版本 |
| `npm run prisma:migrate` | 创建数据库迁移 |
| `npm run prisma:generate` | 生成 Prisma Client |
| `npm run prisma:studio` | 打开 Prisma Studio（数据库可视化工具） |

## 🔌 API 端点

### Sessions

- `GET /api/sessions` - 获取所有会话
- `GET /api/sessions/:id` - 获取单个会话
- `POST /api/sessions` - 创建会话
- `PATCH /api/sessions/:id` - 更新会话
- `DELETE /api/sessions/:id` - 删除会话

### 健康检查

- `GET /api/health` - 服务器状态检查

## 📝 核心概念

### Prisma Schema

`prisma/schema.prisma` 定义了数据库模型，包括：
- **Session** - 学习会话（包含标题、状态等）
- **Message** - 消息记录（用户/AI 对话）
- **Todo** - 待办事项（任务列表）

修改 Schema 后需要：
1. 运行 `npm run prisma:migrate` 更新数据库
2. 运行 `npm run prisma:generate` 更新类型

### Prisma Client

通过 `prisma` 对象访问数据库，提供类型安全的方法：
- `prisma.session.findMany()` - 查询多个会话
- `prisma.session.create()` - 创建会话
- `prisma.session.update()` - 更新会话
- `prisma.session.delete()` - 删除会话

### 关联查询

使用 `include` 可以一次性获取关联数据：

```typescript
const session = await prisma.session.findUnique({
  where: { id },
  include: {
    messages: true,  // 同时获取消息
    todos: true,     // 同时获取待办
  },
});
```

## 🔒 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | 服务器端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` / `production` |

## 🐛 常见问题

**Q: 数据库连接失败？**  
A: 检查 `.env` 中的 `DATABASE_URL` 是否正确，确保 PostgreSQL 服务已启动。

**Q: Prisma Client 类型错误？**  
A: 运行 `npm run prisma:generate` 重新生成类型。

**Q: 修改 Schema 后数据丢失？**  
A: 迁移会保留数据，但删除字段会丢失该字段的数据。开发环境可以使用 `prisma migrate reset` 重置（会清空数据）。

## 📚 相关文档

- [Express 文档](https://expressjs.com/)
- [Prisma 文档](https://www.prisma.io/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

---

**提示**：首次运行前确保 PostgreSQL 已安装并创建了数据库。
```

要点：
1. 安装命令有解释：每个依赖的作用
2. 代码示例精简：只保留关键概念
3. 结构清晰：分步骤、表格、代码块
4. 实用信息：常见问题、核心概念说明
