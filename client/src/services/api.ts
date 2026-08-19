import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
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
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);
