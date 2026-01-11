# 钱包登录功能设置指南

## 📋 概述

本项目已集成 ConnectKit 和 wagmi，支持使用 Web3 钱包进行身份验证。

## 🚀 快速开始

### 1. 获取 WalletConnect Project ID

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 注册/登录账号
3. 创建新项目
4. 复制 Project ID

### 2. 配置环境变量

创建 `.env` 文件（参考 `env.frontend.example`）：

```env
# WalletConnect 项目 ID
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here

# API 配置（可选）
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 🔐 功能特性

### 支持的钱包

- **MetaMask** - 最流行的浏览器钱包
- **WalletConnect** - 支持移动端钱包
- **Coinbase Wallet** - Coinbase 官方钱包
- **其他** - 所有支持 WalletConnect 协议的钱包

### 认证流程

1. 用户访问需要权限的页面（如 `/ai-to-todo`）
2. 如果未连接钱包，自动重定向到 `/login`
3. 用户点击"连接钱包"按钮
4. 选择钱包并确认连接
5. 连接成功后，钱包地址保存到 localStorage
6. 自动跳转到目标页面

### 权限验证

`ProtectedRoute` 组件会检查：
1. 钱包是否已连接
2. 钱包地址是否与保存的地址匹配
3. 如果验证失败，重定向到登录页

## 📁 文件结构

```
src/
├── config/
│   └── wagmi.ts              # wagmi 配置
├── pages/
│   └── LoginPage.tsx         # 登录页面
├── components/
│   ├── ProtectedRoute.tsx   # 权限拦截组件（已更新）
│   └── Sidebar.tsx          # 侧边栏（已添加钱包按钮）
└── App.tsx                   # 主应用（已集成 ConnectKit）
```

## 🎨 使用示例

### 在组件中使用钱包连接

```tsx
import { useAccount, useConnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

function MyComponent() {
  const { isConnected, address } = useAccount();
  
  return (
    <div>
      {isConnected ? (
        <p>已连接: {address}</p>
      ) : (
        <ConnectKitButton />
      )}
    </div>
  );
}
```

### 自定义 ConnectKit 按钮

```tsx
<ConnectKitButton.Custom>
  {({ isConnected, show, address }) => (
    <button onClick={show}>
      {isConnected ? address : '连接钱包'}
    </button>
  )}
</ConnectKitButton.Custom>
```

## 🔧 配置说明

### wagmi 配置

在 `src/config/wagmi.ts` 中配置：

- **支持的链**: mainnet, sepolia, localhost（开发环境）
- **RPC 端点**: 使用公共 RPC 或自定义 RPC
- **应用信息**: 应用名称、图标、描述等

### 自定义链配置

如果需要添加其他链：

```typescript
import { polygon, arbitrum } from 'wagmi/chains';

export const config = createConfig(
  getDefaultConfig({
    // ...
    chains: [mainnet, sepolia, polygon, arbitrum],
    // ...
  })
);
```

## 🐛 常见问题

### 1. ConnectKit 样式未加载

确保在 `src/main.tsx` 中导入了样式：

```typescript
import 'connectkit/styles.css';
```

### 2. WalletConnect Project ID 错误

- 检查 `.env` 文件中的 `VITE_WALLETCONNECT_PROJECT_ID` 是否正确
- 确保项目 ID 来自 WalletConnect Cloud
- 重启开发服务器

### 3. 钱包连接失败

- 检查浏览器是否安装了钱包扩展
- 确保钱包扩展已启用
- 尝试刷新页面

### 4. 权限验证不通过

- 检查钱包是否已连接
- 检查 localStorage 中是否有 `wallet-address`
- 确认地址是否匹配

## 🔒 安全注意事项

1. **不要硬编码私钥**: 永远不要在代码中存储私钥
2. **验证地址**: 在服务器端验证钱包地址签名
3. **HTTPS**: 生产环境必须使用 HTTPS
4. **环境变量**: 不要将 `.env` 文件提交到版本控制

## 📚 相关资源

- [ConnectKit 文档](https://docs.family.co/connectkit)
- [wagmi 文档](https://wagmi.sh/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [viem 文档](https://viem.sh/)

## 🎯 下一步

- [ ] 添加消息签名验证
- [ ] 实现服务器端认证
- [ ] 添加用户资料管理
- [ ] 支持多链切换
- [ ] 添加交易功能

---

**注意**: 当前实现使用 localStorage 存储钱包地址，仅用于前端演示。生产环境建议实现服务器端签名验证。

