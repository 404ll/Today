// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // 插件
  build: {// 构建配置
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'], // 手动拆分 React 相关依赖
          router: ['react-router-dom'], // 手动拆分 React Router 相关依赖
          web3: ['wagmi', 'ethers'], // 手动拆分 Web3 相关依赖
        },
      },
    },// 构建配置
  },
});// 导出配置
