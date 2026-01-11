# AI 分析转 TodoList 功能实现计划

## 📋 功能概述

将数据分析页面改造为「AI 分析转 TodoList」功能页面，允许用户从历史 AI 对话中提取待办事项并添加到 TodoList。

## 🎯 核心功能

1. **会话选择** - 显示所有会话列表，支持筛选和搜索
2. **AI 消息展示** - 显示选中会话的所有 AI 回复
3. **智能提取** - 从 AI 消息中自动提取待办事项
4. **待办预览** - 预览提取的待办事项，支持编辑
5. **批量添加** - 将提取的待办事项添加到当前会话或全局 TodoList
6. **权限验证** - 需要权限验证才能访问此功能

## 📐 页面设计

### 页面布局

```
┌─────────────────────────────────────────────────┐
│  AI 分析转 TodoList                              │
├─────────────────────────────────────────────────┤
│  [会话选择器] [搜索框]                            │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌────────────────────────┐ │
│  │  会话列表     │  │  AI 消息列表            │ │
│  │              │  │                        │ │
│  │ • Session 1  │  │  [AI 消息卡片 1]        │ │
│  │ • Session 2  │  │  [提取待办] [查看详情]  │ │
│  │ • Session 3  │  │                        │ │
│  │              │  │  [AI 消息卡片 2]        │ │
│  └──────────────┘  │  [提取待办] [查看详情]  │ │
│                     └────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  提取的待办事项预览                               │
│  ┌───────────────────────────────────────────┐ │
│  │ ☐ 待办 1                    [编辑] [删除] │ │
│  │ ☐ 待办 2                    [编辑] [删除] │ │
│  │ ☐ 待办 3                    [编辑] [删除] │ │
│  └───────────────────────────────────────────┘ │
│  [添加到当前会话] [添加到全局列表] [清空]        │
└─────────────────────────────────────────────────┘
```

## 🔧 技术实现

### 1. 文件结构

```
src/
├── pages/
│   └── AiToTodoPage.tsx          # 新页面组件（替换 AnalysisPage）
├── components/
│   ├── SessionSelector.tsx        # 会话选择器组件
│   ├── AiMessageCard.tsx         # AI 消息卡片组件
│   ├── TodoExtractor.tsx         # 待办提取器组件
│   └── ExtractedTodosPreview.tsx # 提取的待办预览组件
├── utils/
│   └── todoExtractor.ts          # 待办提取工具函数
└── api/
    └── ai/
        └── extractTodos.ts       # 提取待办 API（如果需要后端支持）
```

### 2. 核心组件设计

#### AiToTodoPage（主页面）
- **功能**：
  - 页面布局和状态管理
  - 会话数据获取
  - 权限验证集成
  - 待办事项添加逻辑

- **状态管理**：
  ```typescript
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const [extractedTodos, setExtractedTodos] = useState<Todo[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  ```

#### SessionSelector（会话选择器）
- **功能**：
  - 显示所有会话列表
  - 支持搜索和筛选
  - 高亮选中会话
  - 显示会话基本信息（标题、消息数、创建时间）

#### AiMessageCard（AI 消息卡片）
- **功能**：
  - 显示 AI 消息内容（支持 Markdown）
  - 显示消息时间
  - "提取待办" 按钮
  - "查看详情" 按钮（展开/收起完整消息）

#### TodoExtractor（待办提取器）
- **功能**：
  - 从 AI 消息文本中提取待办事项
  - 支持多种格式识别（列表、JSON、自然语言）
  - 提取结果预览和编辑
  - 批量提取功能

#### ExtractedTodosPreview（提取的待办预览）
- **功能**：
  - 显示提取的待办事项列表
  - 支持编辑、删除单个待办
  - 批量操作（全选、删除）
  - 添加到会话或全局列表

### 3. 待办提取逻辑

#### 提取策略（优先级从高到低）

1. **JSON 格式提取**
   ```typescript
   // 匹配 JSON 格式：{"todos": [...]}
   const jsonMatch = message.match(/\{[\s\S]*"todos"[\s\S]*\}/);
   ```

2. **列表格式提取**
   ```typescript
   // 匹配列表格式：
   // - 任务内容
   // • 任务内容
   // 1. 任务内容
   // 1) 任务内容
   const listMatch = line.match(/^[\d\-•]\s*[.、)]\s*(.+)$/);
   ```

3. **自然语言提取**（使用 AI 辅助）
   - 如果前两种方法失败，调用 AI API 进行智能提取
   - 使用专门的 prompt 引导 AI 提取待办事项

#### 提取函数设计

```typescript
// utils/todoExtractor.ts

/**
 * 从 AI 消息中提取待办事项
 * @param message AI 消息内容
 * @param options 提取选项
 * @returns 提取的待办事项数组
 */
export const extractTodosFromAiMessage = async (
  message: string,
  options?: {
    useAI?: boolean;  // 是否使用 AI 辅助提取
    sessionId?: string;  // 会话 ID（用于上下文）
  }
): Promise<Todo[]> => {
  // 1. 尝试 JSON 提取
  const jsonTodos = extractTodosFromJSON(message);
  if (jsonTodos && jsonTodos.length > 0) {
    return jsonTodos;
  }

  // 2. 尝试列表格式提取
  const listTodos = extractTodosFromMessage(message);
  if (listTodos && listTodos.length > 0) {
    return listTodos;
  }

  // 3. 如果启用 AI 辅助，调用 AI 提取
  if (options?.useAI) {
    return await extractTodosWithAI(message, options.sessionId);
  }

  return [];
};
```

### 4. API 设计（可选）

如果需要后端支持更智能的提取：

```typescript
// api/ai/extractTodos.ts

/**
 * 调用后端 API 提取待办事项
 */
export const extractTodosFromMessage = async (
  message: string,
  sessionId?: string
): Promise<Todo[]> => {
  // 调用后端 API
  const response = await api.post('/ai/extract-todos', {
    message,
    sessionId,
  });
  return response.data.todos;
};
```

### 5. 权限验证

使用现有的 `ProtectedRoute` 组件：

```tsx
{
  path: '/ai-to-todo',
  element: (
    <ProtectedRoute>
      <AiToTodoPage />
    </ProtectedRoute>
  ),
}
```

## 📝 实现步骤

### Phase 1: 基础结构搭建
1. ✅ 创建 `AiToTodoPage.tsx` 页面组件
2. ✅ 更新路由配置，替换 `/analysis` 为 `/ai-to-todo`
3. ✅ 集成权限验证
4. ✅ 基础布局和样式

### Phase 2: 会话选择功能
1. ✅ 创建 `SessionSelector` 组件
2. ✅ 实现会话列表展示
3. ✅ 实现会话搜索和筛选
4. ✅ 实现会话选择逻辑

### Phase 3: AI 消息展示
1. ✅ 创建 `AiMessageCard` 组件
2. ✅ 实现消息列表展示
3. ✅ 实现消息展开/收起
4. ✅ 集成 Markdown 渲染

### Phase 4: 待办提取功能
1. ✅ 创建 `todoExtractor.ts` 工具函数
2. ✅ 实现 JSON 格式提取
3. ✅ 实现列表格式提取
4. ✅ 实现 AI 辅助提取（可选）
5. ✅ 创建 `TodoExtractor` 组件

### Phase 5: 待办预览和添加
1. ✅ 创建 `ExtractedTodosPreview` 组件
2. ✅ 实现待办编辑功能
3. ✅ 实现批量操作
4. ✅ 实现添加到会话功能
5. ✅ 实现添加到全局列表功能

### Phase 6: 优化和测试
1. ✅ 错误处理
2. ✅ 加载状态
3. ✅ 用户体验优化
4. ✅ 性能优化
5. ✅ 测试和修复

## 🎨 UI/UX 设计要点

1. **响应式设计**
   - 移动端：单列布局
   - 桌面端：双列布局（会话列表 + 消息列表）

2. **交互反馈**
   - 提取中显示加载动画
   - 提取成功显示提示
   - 添加成功显示确认

3. **视觉层次**
   - 清晰的卡片设计
   - 合理的间距和留白
   - 支持暗色模式

4. **操作便捷性**
   - 一键提取待办
   - 批量操作支持
   - 快速添加到列表

## 🔒 权限验证逻辑

使用现有的权限验证机制：
- 检查用户是否有会话数据（表示已使用过应用）
- 或检查特定的认证标记
- 未授权时重定向到首页

## 📊 数据流

```
用户选择会话
    ↓
加载会话的 AI 消息
    ↓
用户点击"提取待办"
    ↓
调用提取函数（JSON/列表/AI）
    ↓
显示提取结果预览
    ↓
用户编辑/确认待办
    ↓
添加到会话或全局列表
    ↓
更新 UI 和存储
```

## 🚀 后续优化方向

1. **智能推荐** - 根据用户历史推荐相关待办
2. **批量提取** - 支持一次提取多个消息的待办
3. **待办分类** - 自动分类待办事项
4. **优先级识别** - 识别待办的重要程度
5. **时间估算** - AI 估算每个待办的完成时间

## 📚 相关文件

- `src/types/index.ts` - 类型定义
- `src/store/TodoListStore.ts` - TodoList 状态管理
- `src/components/TodoListCard.tsx` - TodoList 组件
- `src/components/ProtectedRoute.tsx` - 权限验证组件
- `backend/src/services/aiService.ts` - 后端提取逻辑（参考）

---

**开始时间**: 待定
**预计完成时间**: 待定
**优先级**: 高

