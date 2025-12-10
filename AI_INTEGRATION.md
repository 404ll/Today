# AI 对接指南

## 📋 配置说明

### 方式一：通过后端 API（推荐）

1. **配置后端 API 地址**
   
   在项目根目录创建 `.env` 文件：
   ```bash
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_USE_BACKEND_API=true
   ```

2. **后端需要实现的 API 端点**
   
   ```http
   POST /api/ai/chat
   Content-Type: application/json
   
   {
     "messages": [
       { "role": "user", "content": "我想学习 React" },
       { "role": "ai", "content": "好的，我来帮你制定学习计划" }
     ]
   }
   
   Response:
   {
     "message": "AI 回复内容",
     "todos": [
       { "id": "1", "text": "学习 React 基础", "completed": false }
     ]
   }
   ```

### 方式二：直接调用 OpenAI API（开发测试用）

⚠️ **注意**：这种方式会将 API Key 暴露在前端，仅用于开发测试，不适合生产环境。

1. **获取 OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 创建新的 API Key

2. **配置环境变量**
   
   在项目根目录创建 `.env` 文件：
   ```bash
   VITE_USE_BACKEND_API=false
   VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **重启开发服务器**
   ```bash
   npm run dev
   ```

## 🚀 使用方式

配置完成后，在聊天界面输入学习目标，AI 会自动：
1. 生成回复消息
2. 创建学习计划（待办事项）

## 🔧 代码结构

```
src/
├── api/
│   ├── client.ts      # HTTP 客户端配置
│   └── ai.ts          # AI API 调用函数
└── components/
    └── MainPanel.tsx  # 主面板组件（已集成 AI）
```

## 📝 API 函数说明

### `generateTodos(userGoal, existingTodos)`
生成学习计划的待办事项

**参数：**
- `userGoal: string` - 用户的学习目标
- `existingTodos: Todo[]` - 现有的待办事项（可选）

**返回：**
- `Promise<Todo[]>` - 生成的待办事项列表

### `callAI(messages)`
通过后端 API 调用 AI

### `callOpenAIDirect(messages)`
直接调用 OpenAI API（仅开发测试）

## 🐛 故障排查

### 问题：AI 调用失败

1. **检查 API Key 是否正确**
   ```bash
   # 在浏览器控制台检查
   console.log(import.meta.env.VITE_OPENAI_API_KEY)
   ```

2. **检查网络连接**
   - 确保可以访问 OpenAI API（可能需要代理）

3. **检查错误信息**
   - 打开浏览器控制台查看详细错误

### 问题：待办事项没有生成

- AI 回复可能不包含列表格式
- 检查 `extractTodosFromMessage` 函数的解析逻辑
- 可以改进为让 AI 返回 JSON 格式的结构化数据

## 🔒 安全建议

1. **生产环境必须使用后端 API**
   - 不要在前端代码中暴露 API Key
   - 通过后端代理所有 AI 请求

2. **API Key 管理**
   - 使用环境变量，不要提交到 Git
   - 在 `.gitignore` 中添加 `.env`

3. **请求限制**
   - 在后端实现速率限制
   - 添加用户认证和授权

## 📚 下一步优化

1. **改进 AI 提示词**
   - 让 AI 返回结构化的 JSON 数据
   - 优化学习计划的生成逻辑

2. **添加流式响应**
   - 使用 Server-Sent Events (SSE) 或 WebSocket
   - 实现打字机效果

3. **错误重试机制**
   - 自动重试失败的请求
   - 显示重试进度

4. **缓存优化**
   - 缓存相似的 AI 回复
   - 减少 API 调用次数

