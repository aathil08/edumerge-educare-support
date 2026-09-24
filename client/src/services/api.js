import axios from 'axios';
import { getToken } from '../utils/storage.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

let onUnauthorized = null;

// AuthProvider registers a handler that runs when a request comes back 401.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Login/register set skipAuthRedirect because a 401 there means "wrong credentials".
    if (status === 401 && !error.config?.skipAuthRedirect && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;