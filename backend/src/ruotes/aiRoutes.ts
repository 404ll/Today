import express from 'express';
import { handleAIChat } from '../services/aiService';

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

/**
 * GET /api/ai/health
 * 检查 AI 服务健康状态
 */
router.get('/health', async (req, res) => {
  try {
    // TODO: 检查 OpenAI API Key 是否配置
    // const hasApiKey = ???;
    
    // TODO: 返回健康状态
    // res.json({
    //   status: hasApiKey ? 'healthy' : 'unhealthy',
    //   message: '???',
    //   hasApiKey,
    // });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
