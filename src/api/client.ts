import axios from "axios";

//创建axios实例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"
  });

//响应拦截器
api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // 处理错误
      if (error.response) {
        // 服务器返回了错误响应
        throw new Error(error.response.data?.message || '请求失败');
      } else {
        // 其他错误
        throw new Error(error.message || '未知错误');
      }
    }
  );

export default api;