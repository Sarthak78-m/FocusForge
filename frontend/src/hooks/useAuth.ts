import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { paths } from '@/routes/paths';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import type { AxiosError } from 'axios';
import type { ApiErrorPayload } from '@/types/api';

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: async (tokens) => {
      setSession(tokens);
      try {
        const user = await authService.me();
        setUser(user);
      } catch {
        // user fetch optional
      }
      navigate(paths.dashboard, { replace: true });
    },
    onError: (error: AxiosError<ApiErrorPayload>) => {
      const message = error.response?.data?.message ?? 'Invalid email or password';
      notify({ title: 'Login failed', message, tone: 'error' });
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: async (tokens) => {
      setSession(tokens);
      navigate(paths.dashboard, { replace: true });
      try {
        const user = await authService.me();
        setUser(user);
      } catch {
        // user fetch optional — session is already set so dashboard loads fine
      }
    },
    onError: (error: AxiosError<ApiErrorPayload>) => {
      const message = error.response?.data?.message ?? 'Registration failed. Please try again.';
      notify({ title: 'Registration failed', message, tone: 'error' });
    },
  });
}
