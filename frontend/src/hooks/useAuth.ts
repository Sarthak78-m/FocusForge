import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { paths } from '@/routes/paths';
import type {
  EmailRequest,
  LoginRequest,
  RegisterRequest,
  RegistrationResponse,
  ResetPasswordRequest,
} from '@/types/auth';
import type { ApiErrorPayload } from '@/types/api';

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

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

type LoginOptions = {
  onUnverified?: (email: string) => void;
};

export function useLogin(options: LoginOptions = {}) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const notify = useNotificationStore((state) => state.notify);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: async (tokens) => {
      setSession(tokens);
      try {
        const user = await authService.me();
        setUser(user);
      } catch {
        // A successful token is sufficient; the protected view can fetch the profile again.
      }
      navigate(paths.dashboard, { replace: true });
    },
    onError: (error: AxiosError<ApiErrorPayload>, variables: LoginRequest) => {
      const status = error.response?.status;
      const message = error.response?.data?.message
        ?? (status && status >= 500
          ? 'Unable to reach the authentication server. Start the backend and try again.'
          : 'Invalid email or password');
      if (error.response?.status === 403 && message === 'Please verify your email before logging in.') {
        options.onUnverified?.(variables.email);
      }
      notify({ title: 'Login failed', message, tone: 'error' });
    },
  });
}

type RegisterOptions = {
  onRegistered?: (response: RegistrationResponse) => void;
};

export function useRegister(options: RegisterOptions = {}) {
  const notify = useNotificationStore((state) => state.notify);

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    onSuccess: (response) => {
      options.onRegistered?.(response);
      notify({
        title: 'Account created',
        message: 'Check your email to verify your account before logging in.',
        tone: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorPayload>) => {
      const message = error.response?.data?.message ?? 'Registration failed. Please try again.';
      notify({ title: 'Registration failed', message, tone: 'error' });
    },
  });
}

export function useResendVerification() {
  const notify = useNotificationStore((state) => state.notify);

  return useMutation({
    mutationFn: (payload: EmailRequest) => authService.resendVerification(payload),
    onSuccess: () => {
      notify({
        title: 'Verification email requested',
        message: 'Check your inbox for a verification link.',
        tone: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorPayload>) => {
      notify({
        title: 'Could not resend verification email',
        message: error.response?.data?.message ?? 'Please try again shortly.',
        tone: 'error',
      });
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: EmailRequest) => authService.forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
  });
}
