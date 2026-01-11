import type { Todo } from '../types';

/**
 * 从 AI 消息中提取待办事项（基础提取）
 * 支持多种格式：JSON、列表格式等
 */

/**
 * 尝试从消息中提取 JSON 格式的待办事项
 */
export const extractTodosFromJSON = (message: string): Todo[] | null => {
  try {
    // 尝试找到 JSON 对象
    const jsonMatch = message.match(/\{[\s\S]*"todos"[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.todos && Array.isArray(data.todos)) {
        return data.todos.map((todo: any, index: number) => ({
          id: todo.id || `todo-${Date.now()}-${index}`,
          text: todo.text || todo.content || String(todo),
          completed: todo.completed || false,
          summary: todo.summary,
        }));
      }
    }
  } catch (error) {
    // JSON 解析失败，返回 null，使用其他方法
    return null;
  }

  return null;
};

/**
 * 从消息中提取列表格式的待办事项
 * 支持多种格式：
 * - 任务内容
 * • 任务内容
 * 1. 任务内容
 * 1) 任务内容
 */
export const extractTodosFromMessage = (message: string): Todo[] => {
  const todos: Todo[] = [];
  const lines = message.split('\n');

  lines.forEach((line, index) => {
    // 匹配多种列表格式
    const match = line.match(/^[\d\-•]\s*[.、)]\s*(.+)$/);
    if (match && match[1].trim().length > 0) {
      todos.push({
        id: `todo-${Date.now()}-${index}`,
        text: match[1].trim(),
        completed: false,
      });
    }
  });

  return todos;
};

/**
 * 从 AI 消息中提取待办事项（基础提取，不使用 AI）
 * 优先使用 JSON 格式，其次使用列表格式
 */
export const extractTodosFromAiMessage = (message: string): Todo[] => {
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

  return [];
};

