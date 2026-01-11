import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, Sparkles } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useNavigate } from 'react-router-dom';

/**
 * 登录页面
 * 使用 Web3 钱包连接进行身份验证
 */
function LoginPage() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  // 如果已连接，保存认证信息并跳转
  useEffect(() => {
    if (isConnected && address) {
      // 保存钱包地址到 localStorage
      localStorage.setItem('wallet-address', address);
      localStorage.setItem('user-auth', 'true');
      
      // 延迟跳转，让用户看到连接成功的反馈
      setTimeout(() => {
        navigate('/');
      }, 500);
    }
  }, [isConnected, address, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Today
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用钱包连接以开始使用
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {!isConnected ? (
            <div className="space-y-6">
              <div className="text-center">
                <Wallet className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  连接钱包
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  请连接你的 Web3 钱包以继续
                </p>
              </div>

              {/* ConnectKit 连接按钮 */}
              <div className="flex justify-center">
                <ConnectKitButton.Custom>
                  {({ isConnecting, show }) => {
                    return (
                      <button
                        onClick={show}
                        className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                      >
                        {isConnecting ? '连接中...' : '连接钱包'}
                      </button>
                    );
                  }}
                </ConnectKitButton.Custom>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>支持的钱包：</strong>
                  <br />
                  MetaMask, WalletConnect, Coinbase Wallet 等
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <Wallet className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  已连接
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                  {address}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  进入应用
                </button>
                <button
                  onClick={() => {
                    disconnect();
                    localStorage.removeItem('wallet-address');
                    localStorage.removeItem('user-auth');
                  }}
                  className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
                >
                  断开连接
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>通过连接钱包，你同意我们的服务条款</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

