/**
 * Prompt 模板常量
 * 
 * 集中管理所有 AI Prompt，便于：
 * - 统一修改和优化
 * - 复用和组合
 * - 版本控制
 */

/**
 * 生成学习计划待办事项的 Prompt 模板
 * 
 * @param userGoal - 用户的学习目标
 * @param existingTodos - 已有的待办事项列表
 * @returns 完整的 prompt 字符串
 */
export const generateTodosPrompt = (
  userGoal: string,
  existingTodos: string[] = []
): string => {
  const existingTodosText = existingTodos.length > 0
    ? `\n已有的任务：\n${existingTodos.map(t => `- ${t}`).join('\n')}`
    : '';

  return `你是一个学习计划助手。用户想要学习：${userGoal}${existingTodosText}

请生成 3-5 个具体的学习任务，要求：
1. 具体可执行
2. 有明确的成果
3. 适合从初学者到进阶的学习路径
4. 避免与已有任务重复

请以列表形式返回，格式如下：
1. 任务1
2. 任务2
3. 任务3`;
};

/**
 * 系统角色提示词
 * 用于设置 AI 的角色和行为
 */
export const SYSTEM_PROMPT = `你是一个专业的学习计划助手，擅长帮助用户制定清晰、可执行的学习计划。
你的回复应该：
- 友好、鼓励
- 具体、可操作
- 结构化、易读`;


