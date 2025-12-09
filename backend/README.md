# Today Backend API

基于 Express + Prisma + PostgreSQL 的 RESTful API 服务，为前端应用提供会话、待办和消息的数据管理。

## 📦 技术栈

- **Express** - Node.js Web 框架
- **Prisma** - 类型安全的 ORM（对象关系映射）
- **PostgreSQL** - 关系型数据库（通过 Docker 运行）
- **TypeScript** - 类型安全的 JavaScript
- **Docker** - 容器化数据库（推荐，无需本地安装 PostgreSQL）

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- Docker Desktop（用于运行数据库）

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

### 2. 启动数据库（Docker）

使用 Docker Compose 一键启动 PostgreSQL：

```bash
# 启动数据库容器（首次会自动下载镜像）
docker-compose up -d

# 查看数据库日志
docker-compose logs -f

# 停止数据库
docker-compose down

# 停止并删除数据（清理所有数据）
docker-compose down -v
```

**说明**：
- `docker-compose up -d` - 后台启动数据库容器
- Docker 会自动创建用户、数据库和权限
- 数据存储在 Docker volume 中，删除容器不会丢失数据（除非使用 `-v`）
- 无需在本地安装 PostgreSQL

### 3. 配置环境变量

创建 `.env` 文件（参考 `env.example`）：

```env
DATABASE_URL="postgresql://elemen:123456@localhost:5432/today_db?schema=public"
PORT=3000
NODE_ENV=development
```

**说明**：
- `DATABASE_URL` - PostgreSQL 连接字符串，Docker 映射到 `localhost:5432`
- 用户名、密码、数据库名已在 `docker-compose.yml` 中配置
- `.env` 文件不要提交到 Git

### 4. 初始化数据库

```bash
# 运行数据库迁移（创建表结构）
npm run prisma:migrate

# 生成 Prisma Client（生成类型定义和客户端代码）
npm run prisma:generate
```

**说明**：
- `prisma:migrate` - 根据 `prisma/schema.prisma` 创建数据库表
- `prisma:generate` - 生成 TypeScript 类型，让代码有自动补全和类型检查

### 5. 启动开发服务器

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
├── docker-compose.yml      # Docker 数据库配置
├── .env                   # 环境变量（不提交到 Git）
├── env.example            # 环境变量模板
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖和脚本
```

## 🛠️ 可用命令

### 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（自动重启） |
| `npm run build` | 编译 TypeScript 到 `dist/` 目录 |
| `npm start` | 运行编译后的生产版本 |

### Prisma 命令

| 命令 | 说明 |
|------|------|
| `npm run prisma:migrate` | 创建数据库迁移 |
| `npm run prisma:generate` | 生成 Prisma Client |
| `npm run prisma:studio` | 打开 Prisma Studio（数据库可视化工具） |

### Docker 命令

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 启动数据库容器 |
| `docker-compose down` | 停止数据库容器（保留数据） |
| `docker-compose down -v` | 停止并删除所有数据 |
| `docker-compose logs -f` | 查看数据库日志 |
| `docker ps` | 查看运行中的容器 |

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

### Docker Compose

`docker-compose.yml` 配置了 PostgreSQL 容器：
- 自动创建用户和数据库
- 数据持久化在 Docker volume 中
- 端口映射到本地 `5432`

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
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://elemen:123456@localhost:5432/today_db?schema=public` |
| `PORT` | 服务器端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` / `production` |

## 🐛 常见问题

**Q: Docker 容器启动失败？**  
A: 检查 Docker Desktop 是否运行，端口 5432 是否被占用。可以运行 `docker ps` 查看容器状态。

**Q: 数据库连接失败？**  
A: 
1. 确保 Docker 容器正在运行：`docker ps`
2. 检查 `.env` 中的 `DATABASE_URL` 是否正确
3. 查看容器日志：`docker-compose logs`

**Q: 如何重置数据库？**  
A: 
```bash
# 停止并删除数据
docker-compose down -v

# 重新启动
docker-compose up -d

# 重新运行迁移
npm run prisma:migrate
```

**Q: Prisma Client 类型错误？**  
A: 运行 `npm run prisma:generate` 重新生成类型。

**Q: 如何查看数据库数据？**  
A: 使用 Prisma Studio：`npm run prisma:studio`，或通过 Docker：
```bash
docker exec -it today_postgres psql -U elemen -d today_db
```

**Q: 数据会丢失吗？**  
A: 
- `docker-compose down`：数据保留在 Docker volume 中
- `docker-compose down -v`：会删除所有数据
- 数据存储在 Docker volume，删除容器不会丢失数据

## 🎯 为什么使用 Docker？

### 优势

1. **无需安装 PostgreSQL** - 不需要在本地安装和配置数据库
2. **环境隔离** - 不影响本地系统，每个项目独立数据库
3. **一键启动** - `docker-compose up -d` 即可
4. **易于清理** - `docker-compose down -v` 完全清理
5. **跨平台一致** - macOS、Windows、Linux 体验相同

### 对比直接安装

| 特性 | 直接安装 | Docker |
|------|---------|--------|
| 安装 | 需要 brew install | 只需 Docker |
| 启动 | `brew services start` | `docker-compose up` |
| 清理 | 需要手动卸载 | `docker-compose down -v` |
| 隔离 | 全局共享 | 项目独立 |

## 📚 相关文档

- [Express 文档](https://expressjs.com/)
- [Prisma 文档](https://www.prisma.io/docs)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

---

**提示**：首次运行前确保 Docker Desktop 已安装并运行。
