import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './ruotes/aiRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API 路由
app.use('/api', aiRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: '路由不存在' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

