import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// 首页组件（原有 App 内容）
const HomePage = lazy(() => import('../pages/HomePage'));

// 登录页面
const LoginPage = lazy(() => import('../pages/LoginPage'));

// AI 分析转 TodoList 页面（按需加载）
const AiToTodoPage = lazy(() => import('../pages/AiToTodoPage'));

// 路由配置
export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requireAuth={false}>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ai-to-todo',
    element: (
      <ProtectedRoute requireAuth={true}>
        <AiToTodoPage />
      </ProtectedRoute>
    ),
  },
];

