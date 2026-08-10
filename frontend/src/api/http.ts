import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorPayload, ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const requestUrl = error.config?.url ?? '';
    const isPublicEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify-email') ||
      requestUrl.includes('/auth/resend-verification') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    if (error.response?.status === 401 && !isPublicEndpoint) {
      useAuthStore.getState().clearSession(true);
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    return Promise.reject(error);
  },
);

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}
