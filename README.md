# Today · 学习计划驾驶舱

一个基于 React + Vite + TypeScript 的轻量学习管理工具，帮你把「想学什么」拆成可执行的计划，并在同一个界面里完成规划、执行与复盘。

## 功能特性
- 多会话侧边栏：快速切换不同学习主题，支持增删与状态指示。
- Planning Phase：类 ChatGPT 对话体验，输入学习目标后自动生成任务清单，可手动补充与调整。
- Execution Phase：聚焦任务执行，支持打勾、展开填写笔记，总览完成进度与阶段状态。
- 视觉设计：结合像素风与现代卡片布局，针对桌面端做了平滑滚动与动画过渡。
- 轻量状态管理：所有数据暂存在前端内存，结构已为接入后端/LLM 预留好接口。

## 状态图例
- ✅ 已完成
- 🛠️ 进行中
- 🧭 计划中

## 技术栈
- React 19 / React DOM
- TypeScript（严格模式配置，Session/Todo 结构统一）
- Vite 7 快速开发与构建
- Tailwind CSS
- Lucide Icons 图标库

## 快速开始
```bash
# 1. 安装依赖
npm install

# 2. 本地开发（默认 http://localhost:5173）
npm run dev

# 3. 生产构建
npm run build

# 4. 预览打包产物
npm run preview
```

建议 Node.js ≥ 18。若端口被占用，可通过 `npm run dev -- --port xxxx` 指定。

## 目录速览
```
src/
├── App.tsx              # 主框架：左侧会话列表 + 右侧阶段容器
├── main.tsx             # React 入口
├── index.css            # Tailwind 及像素风样式
├── constants.ts         # 统一的 AI 提示语集合
├── types/               # Session/Todo/Message 等 TS 类型
└── components/
    ├── PlanningPhase.tsx   # 规划阶段：对话区 + 任务面板
    ├── ExecutionPhase.tsx  # 执行阶段：任务卡片与总结区
    └── PlanCard.tsx        # 🎮 复古风格的 SMART 计划表单
```

## 使用流程
1. 创建 Session：点击侧边栏 `New Session`，输入学习目标。
2. 规划阶段：
   - 与 AI 助手对话，描述你想学的内容。
   - 系统会生成若干 todo，可继续手工添加或删除。
   - 准备就绪后点击 `Start Learning` 进入执行阶段。
3. 执行阶段：
   - 勾选已完成任务，展开填写 `Your Notes` 记录收获。
   - 全部完成后使用 `Mark Session Completed` 结束本次学习。
4. 返回侧边栏可切换或删除会话；若刷新页面会回到一个新的空白会话。

## 迭代计划
1. 🛠️ **前端完善**
   - 完成所有 UI 组件（统计面板、复盘页、AI 建议区等）。
   - 补充输入校验、空状态与移动端优化。
2. 🧭 **状态管理升级**
   - 抽象 Session/Todo 的数据层，为后端接口预留 hook。
   - 加入全局 loading、错误提示与 optimistic UI。
3. 🧭 **后端与大模型接入**
   - 接入真实账户体系、会话存储与 Webhook。
   - 基于大模型生成/更新计划、自动复盘。
4. 🧭 **生产化**
   - 指标埋点、性能优化、错误监控。
   - 支持多端同步、导出到 Notion/Markdown。

## 更多想法
- 统计学习时长、番茄钟提醒与周度回顾。
- 导出 Markdown/Notion 笔记或同步到任务管理工具。

欢迎 fork / issue / PR，一起把学习这件事做得更自洽。Enjoy!
