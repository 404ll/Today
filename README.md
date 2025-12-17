# Today · 学习计划驾驶舱

一个基于 React + Vite + TypeScript 的轻量学习管理工具，帮你把「想学什么」拆成可执行的计划，并在同一个界面里完成规划、执行与复盘。

## ✨ 功能特性

### 核心功能
- 🤖 **AI 对话助手**：基于流式输出的实时对话体验，支持 Markdown 渲染
- 💬 **多会话管理**：侧边栏快速切换不同学习主题，支持创建、删除和状态指示
- 🎨 **主题切换**：支持亮色/暗色模式，自动保存偏好设置
- 💾 **本地存储**：所有会话数据自动保存到 localStorage，刷新不丢失
- 📝 **Markdown 支持**：AI 回复支持 Markdown 格式，代码高亮、表格、列表等

### 界面特性
- 🎮 **像素风格设计**：结合像素风与现代卡片布局
- 📱 **响应式布局**：针对桌面端优化，支持平滑滚动与动画过渡
- 🌓 **暗色模式**：完整的暗色主题支持，避免页面刷新闪烁

## 🛠️ 技术栈

### 前端
- **React 19** - 最新版本的 React 框架
- **TypeScript** - 严格模式配置，完整的类型安全
- **Vite 7** - 快速开发与构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide Icons** - 现代图标库
- **React Markdown** - Markdown 渲染组件
- **Axios** - HTTP 客户端

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 处理工具
- **TypeScript** - 类型检查

## 🚀 快速开始

### 前置要求
- Node.js ≥ 18
- npm 或 yarn

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选）
# 复制 env.frontend.example 为 .env
# 设置 VITE_API_BASE_URL（后端 API 地址）

# 3. 本地开发（默认 http://localhost:5173）
npm run dev

# 4. 生产构建
npm run build

# 5. 预览打包产物
npm run preview
```

### 环境变量配置

创建 `.env` 文件（参考 `env.frontend.example`）：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**说明**：
- `VITE_API_BASE_URL` - 后端 API 基础地址（可选，如果不配置则使用默认值）
- 如果只使用前端功能，可以不配置此变量

## 📁 项目结构

```
today/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── ai/
│   │   │   └── chat.ts         # AI 聊天接口（流式/非流式）
│   │   └── client.ts           # Axios 客户端配置
│   ├── components/             # React 组件
│   │   ├── Sidebar.tsx         # 侧边栏（会话列表）
│   │   ├── MainPanel.tsx       # 主面板（对话区域）
│   │   ├── ChatCard.tsx        # 聊天卡片容器
│   │   ├── MessageContent.tsx  # 消息内容（Markdown 渲染）
│   │   ├── ExecutionPhase.tsx  # 执行阶段组件
│   │   └── PlanCard.tsx        # 计划卡片组件
│   ├── context/                # React Context
│   │   ├── ThemeContext.tsx    # 主题上下文（亮色/暗色）
│   │   └── SideBarContext.tsx   # 侧边栏状态上下文
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts            # Session/Message/Todo 等类型
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # React 入口文件
│   ├── index.css               # 全局样式（Tailwind + 自定义）
│   └── constants.ts            # 常量定义（AI 提示语等）
├── public/                     # 静态资源
│   ├── logo.png                # 网站图标
│   └── vite.svg                # Vite 图标
├── index.html                  # HTML 模板
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                # 项目依赖
```

## 💡 使用流程

1. **创建会话**
   - 点击侧边栏 `New Session` 按钮
   - 或自动创建新会话

2. **开始对话**
   - 在输入框中描述你的学习目标
   - AI 助手会实时流式回复（打字机效果）
   - 支持 Markdown 格式的回复

3. **管理会话**
   - 侧边栏显示所有会话列表
   - 点击会话切换，点击删除按钮移除会话
   - 所有数据自动保存到本地

4. **主题切换**
   - 点击侧边栏顶部的太阳/月亮图标
   - 主题偏好自动保存

## 🎨 核心组件说明

### Sidebar（侧边栏）
- 会话列表展示
- 新建/删除会话
- 主题切换按钮
- 响应式收起/展开

### MainPanel（主面板）
- 对话界面
- 流式消息接收与展示
- 输入框与发送按钮
- 自动滚动到底部

### MessageContent（消息内容）
- Markdown 渲染
- 代码高亮
- 表格、列表支持
- 用户/AI 消息样式区分

### ThemeContext（主题上下文）
- 亮色/暗色模式切换
- localStorage 持久化
- 页面加载时立即应用（避免闪烁）

## 🔌 API 接口

### 流式聊天
- **POST** `/api/chat-stream` - 流式 AI 对话
  - 请求体：`{ messages: Message[] }`
  - 响应：Server-Sent Events (SSE) 流式数据

### 非流式聊天（备用）
- **POST** `/api/chat` - 非流式 AI 对话
  - 请求体：`{ messages: Message[] }`
  - 响应：`{ message: string, todos?: Todo[] }`

## 📊 数据模型

### Session（会话）
```typescript
interface Session {
  id: string;
  title: string;
  status: 'planning' | 'executing' | 'completed';
  messages: Message[];
  todos: Todo[];
  createdAt: number;
  // ... 其他字段
}
```

### Message（消息）
```typescript
interface Message {
  role: 'user' | 'ai';
  content: string;
}
```

### Todo（待办事项）
```typescript
interface Todo {
  id: string;
  text: string;
  completed?: boolean;
  summary?: string;
}
```

## 🎯 未来规划

### 🧭 待办任务功能
- [ ] 从 AI 回复中自动提取待办事项
- [ ] 手动添加/编辑/删除待办
- [ ] 待办完成状态管理
- [ ] 待办进度统计

### 🧭 后端完整实现
- [ ] 用户认证系统
- [ ] 会话数据持久化（数据库）
- [ ] RESTful API 完整实现
- [ ] WebSocket 实时同步
- [ ] 数据备份与恢复

### 🧭 执行阶段功能
- [ ] 任务执行跟踪
- [ ] 学习笔记记录
- [ ] 进度可视化
- [ ] 学习总结生成

### 🧭 高级功能
- [ ] 学习时长统计
- [ ] 番茄钟提醒
- [ ] 周度/月度回顾
- [ ] 数据导出（Markdown/Notion）
- [ ] 多端同步
- [ ] 分享功能

### 🧭 性能优化
- [ ] 虚拟滚动（长列表优化）
- [ ] 代码分割与懒加载
- [ ] 缓存策略优化
- [ ] 性能监控与埋点

### 🧭 用户体验
- [ ] 移动端适配
- [ ] 键盘快捷键
- [ ] 搜索功能
- [ ] 标签分类
- [ ] 拖拽排序

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**提示**：这是一个学习项目，持续迭代中。如有问题或建议，欢迎提出！
