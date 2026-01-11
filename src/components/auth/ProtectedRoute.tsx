import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

/**
 * 权限拦截组件
 * 支持 Web3 钱包认证和传统认证方式
 */
export function ProtectedRoute({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isConnected, address } = useAccount();

  // 权限检查逻辑
  const isAuthenticated = () => {
    // 1. 检查 Web3 钱包连接
    if (isConnected && address) {
      const savedAddress = localStorage.getItem('wallet-address');
      // 验证地址是否匹配
      if (savedAddress && savedAddress.toLowerCase() === address.toLowerCase()) {
        console.log('钱包地址匹配');
        return true;
      }
    }

    // 2. 检查 localStorage 中的认证信息
    const hasAuth = localStorage.getItem('user-auth') === 'true';
    const hasWalletAddress = localStorage.getItem('wallet-address');
    
    // 3. 如果有钱包地址但没有连接，需要重新连接
    if (hasWalletAddress && !isConnected) {
      console.log('钱包地址存在，但未连接');
      return false;
    }

    // 4. 检查是否有会话数据（表示用户已使用过应用，作为降级方案）
    const hasSessions = localStorage.getItem('today-sessions');
    
    // 如果设置了 requireAuth，则必须通过钱包或认证
    if (requireAuth) {
      return hasAuth || (hasWalletAddress && isConnected);
    }
    
    // 如果不要求认证，只要有会话数据即可
    return hasAuth || !!hasSessions;
  };

  if (requireAuth && !isAuthenticated()) {
    // 未授权时重定向到登录页
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

