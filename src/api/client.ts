// api/client.ts
import axios from "axios";

// 提取 BaseURL，保证单点维护
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// 提取获取 Token 的逻辑（假设存在 localStorage）
export const getToken = () => localStorage.getItem('token') || '';

const api = axios.create({
  baseURL: BASE_URL,
});

// 请求拦截器：注入 Token
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 保持你原有的优雅错误处理
    const msg = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(msg));
  }
);

export default api;