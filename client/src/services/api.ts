import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'https://skincare-backend-api-wifp.onrender.com/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);
