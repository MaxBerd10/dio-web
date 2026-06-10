import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: har bir so'rovga access token qo'shish ---
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: 401 bo'lsa refresh qilib qayta urinish ---
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 va birinchi marta — refresh qilib ko'ramiz
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Bir vaqtning o'zida ko'p so'rovlar — navbatga qo'yamiz
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (token) {
              originalRequest.headers = originalRequest.headers || {};
              (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = tokenStorage.getRefresh();
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
        tokenStorage.set(data.access, data.refresh || refresh);

        processQueue(data.access);

        originalRequest.headers = originalRequest.headers || {};
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(null);
        tokenStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);