# 组件分类说明

组件已按功能分类整理，便于维护和查找。

## 📁 目录结构

```
components/
├── auth/              # 认证相关组件
│   └── ProtectedRoute.tsx      # 权限拦截组件
├── chat/              # 聊天相关组件
│   ├── AiMessageCard.tsx       # AI消息卡片
│   ├── ChatCard.tsx            # 聊天卡片
│   └── MessageContent.tsx     # 消息内容渲染（支持Markdown）
├── layout/            # 布局相关组件
│   ├── Layout.tsx             # 主布局组件
│   └── Sidebar.tsx            # 侧边栏组件
├── session/           # 会话相关组件
│   ├── MainPanel.tsx          # 主面板（聊天+待办）
│   └── SessionSelector.tsx    # 会话选择器
├── todo/              # 待办相关组件
│   ├── ExecutionPhase.tsx     # 执行阶段组件
│   ├── ExtractedTodosPreview.tsx  # 提取的待办预览
│   ├── TodoItem.tsx           # 单个待办项
│   └── TodoListCard.tsx       # 待办列表卡片
└── ui/                # 通用UI组件
    └── LoadingFallback.tsx    # 加载占位组件
```

## 📦 组件分类说明

### 🔐 auth（认证组件）
- **ProtectedRoute**: 路由权限拦截，支持 Web3 钱包认证和传统认证

### 💬 chat（聊天组件）
- **ChatCard**: 聊天界面主容器，包含消息列表和输入框
- **AiMessageCard**: AI 消息卡片，支持展开/收起和提取待办
- **MessageContent**: 消息内容渲染组件，支持 Markdown 格式

### 📐 layout（布局组件）
- **Layout**: 应用主布局，包含侧边栏和主内容区
- **Sidebar**: 侧边栏导航，包含会话列表和导航链接

### 📋 session（会话组件）
- **MainPanel**: 主面板组件，整合聊天和待办列表功能
- **SessionSelector**: 会话选择器，支持搜索和筛选会话

### ✅ todo（待办组件）
- **TodoItem**: 单个待办事项组件，支持编辑、删除、完成
- **TodoListCard**: 待办列表卡片容器
- **ExtractedTodosPreview**: 从 AI 消息中提取的待办预览
- **ExecutionPhase**: 执行阶段组件，显示待办执行进度

### 🎨 ui（通用UI组件）
- **LoadingFallback**: 加载占位组件，用于 Suspense fallback

## 🔗 组件依赖关系

```
Layout
  └── Sidebar

MainPanel
  ├── ChatCard
  │   └── MessageContent
  └── TodoListCard
      └── TodoItem

AiMessageCard
  └── MessageContent

ExtractedTodosPreview
  └── (独立组件)
```

## 📝 使用示例

### 导入组件

```typescript
// 布局组件
import Layout from '../components/layout/Layout';
import Sidebar from '../components/layout/Sidebar';

// 聊天组件
import ChatCard from '../components/chat/ChatCard';
import AiMessageCard from '../components/chat/AiMessageCard';

// 待办组件
import TodoListCard from '../components/todo/TodoListCard';
import TodoItem from '../components/todo/TodoItem';

// 认证组件
import ProtectedRoute from '../components/auth/ProtectedRoute';

// UI组件
import LoadingFallback from '../components/ui/LoadingFallback';
```

## 🎯 分类原则

1. **按功能分类**：相同功能的组件放在同一目录
2. **保持独立**：每个组件目录相对独立，减少相互依赖
3. **清晰命名**：目录名简洁明了，便于快速定位
4. **易于扩展**：新增组件时按功能归类到对应目录

