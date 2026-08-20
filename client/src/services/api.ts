import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'https://skincare-backend-api-wifp.onrender.com/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 25000, // 25s timeout for Render cold start allowance
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach session ID for guest carts
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('skincare_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('skincare_session_id', sessionId);
  }
  return sessionId;
};

api.interceptors.request.use((config) => {
  config.headers['x-session-id'] = getOrCreateSessionId();
  const token = localStorage.getItem('skincare_auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Smart Retry on Cold Start (502, 503, 504 or network timeout) for safe GET requests
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;
    if (!config) return Promise.reject(error.response?.data || error);

    const isGet = config.method?.toUpperCase() === 'GET';
    const isColdStartOrNetwork =
      !error.response ||
      [502, 503, 504, 408].includes(error.response.status) ||
      error.code === 'ECONNABORTED';

    config._retryCount = config._retryCount || 0;

    if (isGet && isColdStartOrNetwork && config._retryCount < 2) {
      config._retryCount += 1;
      const delay = config._retryCount * 1500; // 1.5s then 3s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Fire an immediate non-blocking health ping to warm up backend on initial load
if (typeof window !== 'undefined') {
  api.get('/health').catch(() => {});
}

