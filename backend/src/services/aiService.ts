import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../prompts';
// 类型定义
export interface Message {
  role: "user" | "ai" | "assistant";
  content: string;
}

export interface AIResponse {
  message: string;
  todos?: Todo[];
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// 初始化 OpenAI 客户端
const getQwenClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置，请在 .env 文件中设置');
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', //这里使用的是阿里云的dashscope API
  });
};

/**
 * 调用 OpenAI API 获取 AI 回复
 */
export const callQwen = async (messages: Message[]): Promise<string> => {
  console.log('准备调用 Qwen API...');
  const qwen = getQwenClient();
  console.log('Qwen 客户端已创建');

  try {
    // 转换消息格式，并添加系统提示词
    console.log('格式化消息...');
    const formattedMessages = [
      // 系统提示词放在最前面
      { role: 'system' as const, content: SYSTEM_PROMPT },
      // 然后转换用户消息
      ...messages.map(msg => ({
        role: (msg.role === 'ai' ? 'assistant' : msg.role) as 'user' | 'assistant',
        content: msg.content,
      })),
    ];
    console.log('消息已格式化，数量:', formattedMessages.length);

    console.log('开始调用 Qwen API，模型:', process.env.QWEN_MODEL || 'qwen-plus');
    const response = await qwen.chat.completions.create({
      model: process.env.QWEN_MODEL || 'qwen-plus',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    console.log('API 调用成功，收到响应');

    const aiMessage = response.choices[0]?.message?.content;
    
    if (!aiMessage) {
      console.error('AI 未返回有效回复，响应:', response);
      throw new Error('AI 未返回有效回复');
    }
    return aiMessage;
  } catch (error: any) {
    console.error('Qwen API 调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    
    if (error.status === 401) {
      throw new Error('API Key 无效，请检查配置');
    } else if (error.status === 429) {
      throw new Error('API 调用频率过高，请稍后重试');
    } else if (error.status === 500) {
      throw new Error('服务器错误，请稍后重试');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('无法连接到 API 服务器，请检查网络');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('请求超时，请稍后重试');
    }
    
    throw new Error(error.message || 'AI 调用失败');
  }
};

/**
 * 从 AI 回复中提取待办事项
 * 支持多种格式：
 * 1. 任务内容
 * - 任务内容
 * • 任务内容
 * 1) 任务内容
 */
export const extractTodosFromMessage = (message: string): Todo[] => {
  const todos: Todo[] = [];
  const lines = message.split('\n');

  lines.forEach((line, index) => {
    // 匹配多种列表格式
    const match = line.match(/^[\d\-•]\s*[\.、\)]\s*(.+)$/);
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
 * 尝试从消息中提取 JSON 格式的待办事项
 * 如果 AI 返回了 JSON 格式，优先使用
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
 * 生成学习计划的待办事项
 * 构建专门的 prompt 来生成待办事项
 */
export const generateTodos = async (
  userGoal: string,
  existingTodos: Todo[] = []
): Promise<Todo[]> => {
  const qwen = getQwenClient();

  const existingTodosText = existingTodos.length > 0
    ? `\n已有的任务：\n${existingTodos.map(t => `- ${t.text}`).join('\n')}`
    : '';

  const prompt = `你是一个学习计划助手。用户想要学习：${userGoal}${existingTodosText}

请生成 3-5 个具体的学习任务，要求：
1. 具体可执行
2. 有明确的成果
3. 适合从初学者到进阶的学习路径
4. 避免与已有任务重复

请以列表形式返回，格式如下：
1. 任务1
2. 任务2
3. 任务3`;

  try {
    const response = await qwen.chat.completions.create({
      model: process.env.QWEN_MODEL || 'qwen-plus',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const message = response.choices[0]?.message?.content || '';
    return extractTodosFromMessage(message);
  } catch (error: any) {
    console.error('生成待办事项失败:', error);
    throw error;
  }
};

/**
 * 处理 AI 聊天请求
 * 这是主要的 AI 服务函数
 */
export const handleAIChat = async (
  messages: Message[],
): Promise<AIResponse> => {
  try {
    console.log('handleAIChat 开始处理，消息数量:', messages.length);
    
    // 1. 调用 AI 获取回复
    console.log('开始调用 callQwen...');
    const aiMessage = await callQwen(messages);
    console.log('callQwen 调用成功，回复长度:', aiMessage.length);
    
    // 2. 尝试提取待办事项
    let todos: Todo[] = [];
    const jsonTodos = extractTodosFromJSON(aiMessage);
    todos = jsonTodos || extractTodosFromMessage(aiMessage);
    console.log('提取到待办事项数量:', todos.length);

    return {
      message: aiMessage,
      todos: todos.length > 0 ? todos : undefined,
    };
  } catch (error: any) {
    console.error('AI 聊天处理失败:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
};

