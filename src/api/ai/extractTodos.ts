import api from '../client';
import type { Todo } from '../../types';

/**
 * 从 AI 消息中提取待办事项的 API
 */

interface ExtractTodosRequest {
  message: string;
  sessionContext?: string;
  useAI?: boolean; // 是否使用 AI 辅助提取
}

interface ExtractTodosResponse {
  todos: Todo[];
  method: 'json' | 'list' | 'ai' | 'ai-failed' | 'none';
  warning?: string;
}

/**
 * 调用后端 API 提取待办事项
 */
export const extractTodosFromMessage = async (
  message: string,
  options?: {
    sessionContext?: string;
    useAI?: boolean;
  }
): Promise<Todo[]> => {
  try {
    const response = await api.post<ExtractTodosResponse>('/extract-todos', {
      message,
      sessionContext: options?.sessionContext,
      useAI: options?.useAI ?? false,
    });

    return response.data.todos;
  } catch (error: any) {
    console.error('提取待办事项失败:', error);
    
    // 如果后端 API 失败，使用前端基础提取作为降级方案
    const { extractTodosFromAiMessage } = await import('../../utils/todoExtractor');
    return extractTodosFromAiMessage(message);
  }
};

