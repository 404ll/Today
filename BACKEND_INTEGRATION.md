# 后端数据库接入方案

## 📋 目录
1. [架构设计](#架构设计)
2. [技术选型](#技术选型)
3. [API 设计](#api-设计)
4. [前端改造](#前端改造)
5. [实施步骤](#实施步骤)
6. [最佳实践](#最佳实践)

---

## 🏗️ 架构设计

### 当前状态
```
前端 (React + Vite)
  └─ 数据：内存状态 (useState)
  └─ 持久化：无
```

### 目标架构
```
前端 (React + Vite)         后端 (Node.js/其他)        数据库
  └─ API Client              └─ REST/GraphQL API      └─ PostgreSQL/MongoDB
  └─ 状态管理 (React Query)   └─ 业务逻辑层            └─ ORM/ODM
  └─ 类型共享 (TypeScript)   └─ 数据访问层
```

### 核心原则
- **前后端分离**：前端专注 UI，后端专注业务逻辑
- **类型安全**：共享 TypeScript 类型定义
- **渐进式迁移**：先实现核心功能，再优化体验
- **错误处理**：统一的错误边界和用户提示

---

## 🛠️ 技术选型

### 后端框架（推荐）

#### 选项 1：Node.js + Express + Prisma（推荐新手）
```bash
# 优势
✅ TypeScript 支持好
✅ Prisma 类型安全 ORM
✅ 生态成熟，文档完善
✅ 学习曲线平缓

# 适合场景
- 快速原型开发
- 中小型项目
- 需要强类型支持
```

#### 选项 2：Node.js + Fastify + TypeORM
```bash
# 优势
✅ 性能更好（Fastify）
✅ TypeORM 功能强大
✅ 支持复杂查询

# 适合场景
- 性能要求高
- 复杂数据关系
```

#### 选项 3：Next.js API Routes（全栈方案）
```bash
# 优势
✅ 前后端同仓库
✅ 部署简单（Vercel）
✅ 类型共享天然

# 适合场景
- 想用 Next.js 重构
- 快速上线
```

### 数据库选择

| 数据库 | 适用场景 | 推荐度 |
|--------|---------|--------|
| **PostgreSQL** | 关系型数据，需要 ACID | ⭐⭐⭐⭐⭐ |
| **MongoDB** | 文档型，快速迭代 | ⭐⭐⭐⭐ |
| **SQLite** | 开发/测试，轻量级 | ⭐⭐⭐ |

**推荐：PostgreSQL**（关系清晰，扩展性好）

---

## 📡 API 设计

### RESTful API 规范

#### 基础 URL
```
开发环境：http://localhost:3000/api
生产环境：https://your-domain.com/api
```

#### 端点设计

```typescript
// Sessions 资源
GET    /api/sessions           // 获取所有会话
GET    /api/sessions/:id       // 获取单个会话
POST   /api/sessions           // 创建会话
PATCH  /api/sessions/:id       // 更新会话（部分字段）
PUT    /api/sessions/:id       // 替换会话（全量）
DELETE /api/sessions/:id       // 删除会话

// Todos 资源（嵌套在 Session 下）
GET    /api/sessions/:id/todos        // 获取会话的所有待办
POST   /api/sessions/:id/todos       // 创建待办
PATCH  /api/sessions/:id/todos/:todoId  // 更新待办
DELETE /api/sessions/:id/todos/:todoId  // 删除待办

// Messages 资源（嵌套在 Session 下）
GET    /api/sessions/:id/messages     // 获取消息历史
POST   /api/sessions/:id/messages     // 发送消息（用户/AI）
```

### 请求/响应格式

#### 创建会话
```http
POST /api/sessions
Content-Type: application/json

{
  "title": "学习 React Hooks",
  "status": "planning"
}

Response 201:
{
  "id": "uuid-here",
  "title": "学习 React Hooks",
  "status": "planning",
  "messages": [{ "role": "ai", "content": "Hi! What would you like to learn today?" }],
  "todos": [],
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T10:00:00Z"
}
```

#### 更新会话
```http
PATCH /api/sessions/:id
Content-Type: application/json

{
  "status": "executing",
  "todos": [
    { "id": "todo-1", "text": "阅读文档", "completed": false }
  ]
}

Response 200:
{
  "id": "uuid-here",
  "status": "executing",
  "todos": [...],
  "updatedAt": "2025-01-20T10:05:00Z"
}
```

#### 错误响应
```http
Response 400:
{
  "error": "ValidationError",
  "message": "Title is required",
  "details": { "field": "title" }
}

Response 404:
{
  "error": "NotFoundError",
  "message": "Session not found"
}

Response 500:
{
  "error": "InternalServerError",
  "message": "Database connection failed"
}
```

---

## 🎨 前端改造

### 1. 安装依赖

```bash
# HTTP 客户端（推荐 axios 或 fetch wrapper）
npm install axios

# 状态管理（推荐 React Query）
npm install @tanstack/react-query

# 环境变量管理
npm install -D @types/node
```

### 2. 项目结构

```
src/
├── api/                    # API 层
│   ├── client.ts          # HTTP 客户端配置
│   ├── sessions.ts        # Sessions API
│   ├── todos.ts           # Todos API
│   └── messages.ts        # Messages API
├── hooks/                  # 自定义 Hooks
│   ├── useSessions.ts     # 会话数据管理
│   └── useSession.ts      # 单个会话管理
├── services/              # 业务逻辑层（可选）
│   └── sessionService.ts
└── types/
    ├── index.ts           # 共享类型
    └── api.ts             # API 响应类型
```

### 3. API Client 实现

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 请求拦截器（添加 token 等）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器（统一错误处理）
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 统一错误处理
    if (error.response) {
      throw new Error(error.response.data.message || '请求失败');
    }
    throw new Error('网络错误，请检查连接');
  }
);
```

### 4. API 函数

```typescript
// src/api/sessions.ts
import { apiClient } from './client';
import type { Session } from '../types';

export const sessionsApi = {
  // 获取所有会话
  getAll: async (): Promise<Session[]> => {
    return apiClient.get('/sessions');
  },

  // 获取单个会话
  getById: async (id: string): Promise<Session> => {
    return apiClient.get(`/sessions/${id}`);
  },

  // 创建会话
  create: async (data: Partial<Session>): Promise<Session> => {
    return apiClient.post('/sessions', data);
  },

  // 更新会话
  update: async (id: string, data: Partial<Session>): Promise<Session> => {
    return apiClient.patch(`/sessions/${id}`, data);
  },

  // 删除会话
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/sessions/${id}`);
  },
};
```

### 5. React Query Hooks

```typescript
// src/hooks/useSessions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '../api/sessions';
import type { Session } from '../types';

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 分钟内不重新请求
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      // 创建成功后刷新列表
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Session> }) =>
      sessionsApi.update(id, data),
    onSuccess: (_, variables) => {
      // 更新成功后刷新列表和单个会话
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.id] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
```

### 6. App.tsx 改造示例

```typescript
// src/App.tsx (改造后)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from './hooks/useSessions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { data: sessions = [], isLoading } = useSessions();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const handleCreateSession = async () => {
    const newSession = await createSession.mutateAsync({
      title: 'New Session',
      status: 'planning',
    });
    // 自动更新列表（React Query 处理）
  };

  const handleUpdateSession = async (id: string, data: Partial<Session>) => {
    await updateSession.mutateAsync({ id, data });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // ... 其余 JSX
}

export default function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
```

---

## 📝 实施步骤

### Phase 1: 后端搭建（1-2 天）

1. **初始化后端项目**
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express prisma @prisma/client
   npm install -D typescript @types/express @types/node ts-node nodemon
   ```

2. **配置 Prisma**
   ```bash
   npx prisma init
   # 编辑 prisma/schema.prisma
   ```

3. **数据库 Schema**
   ```prisma
   // prisma/schema.prisma
   model Session {
     id        String   @id @default(uuid())
     title     String
     status    String   // 'planning' | 'executing' | 'completed'
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     messages  Message[]
     todos     Todo[]
   }

   model Message {
     id        String   @id @default(uuid())
     role      String   // 'user' | 'ai'
     content   String   @db.Text
     createdAt DateTime @default(now())
     
     sessionId String
     session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
   }

   model Todo {
     id        String   @id @default(uuid())
     text      String
     completed Boolean  @default(false)
     summary   String?  @db.Text
     createdAt DateTime @default(now())
     
     sessionId String
     session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
   }
   ```

4. **实现基础 API**
   - 创建 Express 路由
   - 实现 CRUD 操作
   - 添加错误处理中间件

### Phase 2: 前端改造（1-2 天）

1. **安装依赖**
   ```bash
   npm install @tanstack/react-query axios
   ```

2. **创建 API 层**
   - `src/api/client.ts`
   - `src/api/sessions.ts`

3. **创建 Hooks**
   - `src/hooks/useSessions.ts`

4. **逐步替换 useState**
   - 先替换 `sessions` 列表
   - 再替换 `updateSession` 逻辑
   - 最后处理删除和创建

### Phase 3: 联调测试（1 天）

1. **本地开发环境**
   ```bash
   # 终端 1：启动后端
   cd backend && npm run dev

   # 终端 2：启动前端
   cd frontend && npm run dev
   ```

2. **测试场景**
   - 创建会话
   - 更新会话状态
   - 添加/删除待办
   - 刷新页面数据持久化

### Phase 4: 优化体验（可选）

1. **加载状态**：Skeleton UI
2. **错误提示**：Toast 通知
3. **乐观更新**：先更新 UI，再同步后端
4. **离线支持**：Service Worker + IndexedDB

---

## ✨ 最佳实践

### 1. 类型安全

```typescript
// 共享类型定义（前后端）
// types/shared.ts
export interface SessionResponse {
  id: string;
  title: string;
  status: SessionStatus;
  // ...
}

// 后端使用
import type { SessionResponse } from '@shared/types';

// 前端使用
import type { SessionResponse } from '../types/shared';
```

### 2. 错误处理

```typescript
// 统一错误类型
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// 在 API Client 中抛出
if (error.response) {
  throw new ApiError(
    error.response.status,
    error.response.data.message,
    error.response.data
  );
}
```

### 3. 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 4. 请求去重

React Query 自动处理相同请求的去重，无需手动实现。

### 5. 缓存策略

```typescript
// 会话列表：5 分钟缓存
staleTime: 1000 * 60 * 5

// 单个会话：实时数据，但保留缓存
staleTime: 0,
cacheTime: 1000 * 60 * 10
```

---

## 🚀 快速开始（推荐方案：Express + Prisma）

### 后端初始化脚本

```bash
# 1. 创建后端目录
mkdir backend && cd backend

# 2. 初始化项目
npm init -y

# 3. 安装依赖
npm install express cors dotenv
npm install prisma @prisma/client
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon

# 4. 初始化 TypeScript
npx tsc --init

# 5. 初始化 Prisma
npx prisma init

# 6. 配置数据库连接（.env）
DATABASE_URL="postgresql://user:password@localhost:5432/today_db"

# 7. 运行迁移
npx prisma migrate dev --name init

# 8. 生成 Prisma Client
npx prisma generate
```

### 前端改造脚本

```bash
# 1. 安装依赖
npm install @tanstack/react-query axios

# 2. 创建 API 层（参考上面的代码）

# 3. 在 main.tsx 包裹 QueryClientProvider

# 4. 逐步替换 App.tsx 中的 useState
```

---

## 📚 延伸学习

1. **React Query 官方文档**：https://tanstack.com/query/latest
2. **Prisma 文档**：https://www.prisma.io/docs
3. **RESTful API 设计**：https://restfulapi.net/
4. **TypeScript 类型共享**：Monorepo 或 npm 包

---

## ❓ 常见问题

**Q: 需要立即实现所有 API 吗？**  
A: 不需要。先实现核心的 CRUD（创建、读取、更新、删除会话），其他功能可以渐进式添加。

**Q: 前端需要立即全部改造吗？**  
A: 建议分阶段：先替换数据获取（GET），再替换更新操作（POST/PATCH），最后处理删除。

**Q: 如何处理并发更新？**  
A: 使用乐观更新 + 错误回滚，或实现版本号/时间戳机制。

**Q: 需要身份认证吗？**  
A: 如果只是个人使用，可以先跳过。多人使用时再添加 JWT/OAuth。

---

**下一步行动**：选择一个后端方案，我可以帮你生成具体的代码模板。

