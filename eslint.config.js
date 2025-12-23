// 导入 ESLint 核心配置和插件
import js from '@eslint/js' // ESLint 推荐的 JavaScript 规则
import globals from 'globals' // 全局变量定义（如 window, document 等）
import reactHooks from 'eslint-plugin-react-hooks' // React Hooks 规则插件
import reactRefresh from 'eslint-plugin-react-refresh' // React Fast Refresh 支持

// ESLint Flat Config 格式（ESLint 9+）
export default [
  // 全局忽略
  {
     ignores: ['dist', 'node_modules', '.deps'] ,
  },
  {
    // 应用规则的文件模式：所有 .js 和 .jsx 文件
    files: ['**/*.{js,jsx,ts,tsx}'],
    
    // 继承的配置：组合多个推荐配置
    extends: [
      js.configs.recommended, // JavaScript 推荐规则
      reactHooks.configs.flat.recommended, // React Hooks 推荐规则
      reactRefresh.configs.vite, // Vite 环境下的 React Refresh 规则
      ts.configs.recommended, // TypeScript 推荐规则
    ],
    
    'react-refresh/only-export-components': [
      'warn', //只允许导出组件
      { allowConstantExport: true }, //允许导出常量
    ],
    // 语言选项配置
    languageOptions: {
      ecmaVersion: 2020, // 使用 ES2020 语法
      globals: globals.browser, // 浏览器全局变量（window, document, console 等）
      parserOptions: {
        ecmaVersion: 'latest', // 解析器使用最新 ECMAScript 版本
        ecmaFeatures: { jsx: true }, // 启用 JSX 语法支持
        sourceType: 'module', // 使用 ES6 模块系统
      },
    },
    
    // 自定义规则
    rules: {
      // 未使用变量规则：忽略以大写字母或下划线开头的变量（如常量、全局变量）
      // 例如：const API_URL = '...' 或 const _internalVar = '...' 不会报错
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
    prettierConfig,//禁用与prettier的冲突
  },
]
