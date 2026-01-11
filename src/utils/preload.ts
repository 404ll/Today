/**
 * 路由预加载工具
 * 用于在用户 hover 链接时预加载对应的路由组件
 */

// 预加载函数映射
const preloadMap: Record<string, () => Promise<any>> = {
  '/': () => import('../pages/HomePage'),
  '/login': () => import('../pages/LoginPage'),
  '/ai-to-todo': () => import('../pages/AiToTodoPage'),
};

/**
 * 预加载指定路由的组件
 * @param path 路由路径
 */
export const preloadRoute = (path: string) => {
  const preloadFn = preloadMap[path];
  if (preloadFn) {
    preloadFn().catch((err) => {
      console.warn(`预加载路由 ${path} 失败:`, err);
    });
  }
};

/**
 * 预加载所有路由
 */
export const preloadAllRoutes = () => {
  Object.values(preloadMap).forEach((preloadFn) => {
    preloadFn().catch((err) => {
      console.warn('预加载路由失败:', err);
    });
  });
};

