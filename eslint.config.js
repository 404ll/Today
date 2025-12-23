import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  // 1. 全局忽略
  { ignores: ['dist', 'node_modules', '.deps'] },

  // 2. TS + React 主规则
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks 官方规则
      ...reactHooks.configs.recommended.rules,

      // Vite HMR 安全规则
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TS 常用工程规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],

      // 开发阶段允许 console
      'no-console': 'off',
    },
  },

  // 3. 禁用所有与 Prettier 冲突的格式规则
  prettierConfig,
)