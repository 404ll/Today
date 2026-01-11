import express from 'express';
import { callQwenWithStream, handleAIChat } from '../services/aiService';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log(messages);
    // 验证请求体
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'messages 必须是数组',
      });
    }

    // 验证消息格式
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          error: 'ValidationError',
          message: '每个消息必须包含 role 和 content 字段',
        });
      }
      
      if (!['user', 'ai', 'assistant'].includes(msg.role)) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'role 必须是 user、ai 或 assistant',
        });
      }
    }

    // 调用 AI 服务
    console.log('准备调用 handleAIChat...');
    const response = await handleAIChat(messages);
    console.log('handleAIChat 调用成功，准备返回响应');

    // 返回结果
    res.json(response);
    console.log('响应已发送给前端');
  } catch (error: any) {
    console.error('AI 路由错误:', error);
    
    // 错误处理
    if (error.message.includes('API Key')) {
      return res.status(500).json({
        error: 'ConfigurationError',
        message: 'AI 服务配置错误',
      });
    }
    
    if (error.message.includes('频率')) {
      return res.status(429).json({
        error: 'RateLimitError',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'InternalServerError',
      message: error.message || 'AI 服务调用失败',
    });
  }
});

router.get('/health', async (req, res) => {
  try {
    // 检查 Qwen API Key 是否配置
    const hasApiKey = process.env.QWEN_API_KEY ? true : false;
    
    res.json({
      status: hasApiKey ? 'healthy' : 'unhealthy',
      message: 'AI 服务可用',
      hasApiKey,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * 从 AI 消息中提取待办事项
 * POST /api/extract-todos
 * Body: { message: string, sessionContext?: string, useAI?: boolean }
 */
router.post('/extract-todos', async (req, res) => {
  try {
    const { message, sessionContext, useAI = false } = req.body;

    // 验证请求体
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'message 必须是字符串',
      });
    }

    // 导入提取函数
    const { extractTodosFromJSON, extractTodosFromMessage, extractTodosWithAI } = await import('../services/aiService');

    // 1. 先尝试基础提取（JSON 和列表格式）
    const jsonTodos = extractTodosFromJSON(message);
    if (jsonTodos && jsonTodos.length > 0) {
      return res.json({
        todos: jsonTodos,
        method: 'json',
      });
    }

    const listTodos = extractTodosFromMessage(message);
    if (listTodos && listTodos.length > 0) {
      return res.json({
        todos: listTodos,
        method: 'list',
      });
    }

    // 2. 如果基础提取失败且启用 AI，使用 AI 辅助提取
    if (useAI) {
      try {
        const aiTodos = await extractTodosWithAI(message, sessionContext);
        return res.json({
          todos: aiTodos,
          method: 'ai',
        });
      } catch (aiError: any) {
        console.error('AI 提取失败:', aiError);
        // AI 提取失败时，返回空数组而不是错误
        return res.json({
          todos: [],
          method: 'ai-failed',
          warning: 'AI 提取失败，已返回空结果',
        });
      }
    }

    // 3. 如果都不成功，返回空数组
    return res.json({
      todos: [],
      method: 'none',
    });
  } catch (error: any) {
    console.error('提取待办事项错误:', error);
    
    if (error.message?.includes('API Key')) {
      return res.status(500).json({
        error: 'ConfigurationError',
        message: 'AI 服务配置错误',
      });
    }

    res.status(500).json({
      error: 'InternalServerError',
      message: error.message || '提取待办事项失败',
    });
  }
});

router.post('/chat-stream', async (req, res) => {
  try {
    const {messages} = req.body;

    //验证请求体
    if(!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "messages 必须是数组",
      })
    }

    //验证消息格式
    for(const msg of messages) {
      if(!msg.role || !msg.content) {
        return res.status(400).json({
          error: "ValidationError",
          message: "每个消息必须包含 role 和 content 字段",
        })
      }
      
      if(!['user','ai','assistant'].includes(msg.role)) {
        return res.status(400).json({
          error: "ValidationError",
          message: "role 必须是 user、ai 或 assistant",
        })
      }
    }

    // 🔑 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

    //发送流式数据
    try {
      let fullResponse = "";
      const stream = callQwenWithStream(messages); 
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        //SSE格式：data: {JSON}\n\n
        res.write(`data: ${JSON.stringify({
          content: chunk, //内容
          done: false //是否完成
        })}\n\n`);
      }
      
      //发送完成信号
      res.write(`data: ${JSON.stringify({
        content: '', // 完成时不需要重复发送完整内容
        done: true,
        fullMessage: fullResponse // 可选：如果需要完整消息
      })}\n\n`);

      res.end();
      console.log("流式响应已发送给前端");
    } catch (streamError: any) {
      // 🔑 内层 catch：处理流式输出过程中的错误
      console.error("流式输出错误:", streamError);
      
      // 如果已经开始流式输出，发送错误事件
      if (!res.headersSent) {
        // 如果响应头还没发送，可以发送 JSON 错误
        return res.status(500).json({
          error: 'InternalServerError',
          message: streamError.message || '流式输出失败',
        });
      } else {
        // 如果已经开始流式输出，发送错误事件
        res.write(`data: ${JSON.stringify({
          error: streamError.message || '流式输出失败',
          done: true
        })}\n\n`);
        res.end();
      }
    }
  } catch (error: any) {
    // 🔑 外层 catch：处理验证等错误
    console.error("流式响应错误:", error);
    
    // 如果响应头还没发送，可以发送 JSON 错误
    if (!res.headersSent) {
      if (error.message?.includes('API Key')) {
        return res.status(500).json({
          error: 'ConfigurationError',
          message: 'AI 服务配置错误',
        });
      }
      
      if (error.message?.includes('频率')) {
        return res.status(429).json({
          error: 'RateLimitError',
          message: error.message,
        });
      }

      return res.status(500).json({
        error: 'InternalServerError',
        message: error.message || 'AI 服务调用失败',
      });
    } else {
      // 如果已经开始流式输出，发送错误事件
      res.write(`data: ${JSON.stringify({
        error: error.message || 'AI 服务调用失败',
        done: true
      })}\n\n`);

      res.end();//结束响应
      console.log("流式响应已发送给前端");
    }
  }
});

export default router;
