import axios from 'axios';
import { message } from 'antd';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // 从环境变量读取
  timeout: 10000,
});

// 请求拦截器：自动添加 token（示例从 localStorage 读取）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误提示
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const msg = error.response.data?.message || '请求失败';
      message.error(msg);
    } else if (error.request) {
      message.error('网络异常，请检查网络');
    } else {
      message.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;