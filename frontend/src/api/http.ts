import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorPayload, ApiResponse } from '@/types/api';
import type { AuthenticationResponse } from '@/types/auth';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

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
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (status === 401 && refreshToken && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post<ApiResponse<AuthenticationResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );
        const tokens = response.data.data;
        useAuthStore.getState().setTokens(tokens);
        originalRequest.headers.Authorization = `Bearer ${tokens.token}`;
        return http(originalRequest);
      } catch {
        useAuthStore.getState().clearSession(true);
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }

    if (status === 401) {
      useAuthStore.getState().clearSession(true);
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    return Promise.reject(error);
  },
);

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}
