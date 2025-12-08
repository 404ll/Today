/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          'mono': ['"Space Mono"', 'monospace'], // 强制替换默认 mono
          'sans': ['"Space Mono"', 'monospace'], // 甚至可以把 sans 也替换掉以保持风格统一
        },
        colors: {
          'pixel-green': '#4ADE80', // 复古亮绿
          'pixel-bg': '#E0E0E0',
        }
      },
    },
    plugins: [],
  }