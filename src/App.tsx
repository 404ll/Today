import React, { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { ThemeProvider } from './context/ThemeContext';
import { SideBarIsOpenProvider } from './context/SideBarContext';
import { config } from './config/wagmi';
import { routes } from './routes';
import { LoadingFallback } from './components/ui/LoadingFallback';

// 创建 React Query 客户端
const queryClient = new QueryClient();

// 路由组件
const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <ThemeProvider>
            <SideBarIsOpenProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </SideBarIsOpenProvider>
          </ThemeProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
