import { http, unwrapApiResponse } from '@/api/http';
import type {
  AuthenticationResponse,
  CurrentUser,
  EmailRequest,
  LoginRequest,
  RegisterRequest,
  RegistrationResponse,
  ResetPasswordRequest,
} from '@/types/auth';
import type { ApiResponse } from '@/types/api';

export const authService = {
  async login(payload: LoginRequest): Promise<AuthenticationResponse> {
    try {
      const response = await http.post<ApiResponse<AuthenticationResponse>>('/auth/login', payload);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const stored = localStorage.getItem('mindsprint_mock_user');
        let resolvedName = '';
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.name && parsed?.email?.toLowerCase() === payload.email.toLowerCase()) {
              resolvedName = parsed.name;
            }
          } catch {}
        }
        if (!resolvedName) {
          const rawPrefix = payload.email.split('@')[0].replace(/[0-9]+/g, '').replace(/[._-]/g, ' ').trim();
          resolvedName = rawPrefix
            ? rawPrefix.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : payload.email.split('@')[0];
        }

        const mockUser: CurrentUser = {
          id: 1,
          name: resolvedName,
          email: payload.email,
          role: 'USER',
        };
        localStorage.setItem('mindsprint_mock_user', JSON.stringify(mockUser));
        return {
          token: 'mindsprint_demo_jwt_token_' + Date.now(),
        };
      }
      throw err;
    }
  },

  async register(payload: RegisterRequest): Promise<RegistrationResponse> {
    try {
      const response = await http.post<ApiResponse<RegistrationResponse>>('/auth/register', payload);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const mockUser: CurrentUser = {
          id: Date.now(),
          name: payload.name,
          email: payload.email,
          role: 'USER',
        };
        localStorage.setItem('mindsprint_mock_user', JSON.stringify(mockUser));
        return {
          email: payload.email,
          emailVerificationRequired: false,
        };
      }
      throw err;
    }
  },

  async verifyEmail(token: string) {
    try {
      const response = await http.post<ApiResponse<void>>('/auth/verify-email', { token });
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return;
      }
      throw err;
    }
  },

  async resendVerification(payload: EmailRequest) {
    try {
      const response = await http.post<ApiResponse<void>>('/auth/resend-verification', payload);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return;
      }
      throw err;
    }
  },

  async forgotPassword(payload: EmailRequest) {
    try {
      const response = await http.post<ApiResponse<void>>('/auth/forgot-password', payload);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return;
      }
      throw err;
    }
  },

  async resetPassword(payload: ResetPasswordRequest) {
    try {
      const response = await http.post<ApiResponse<void>>('/auth/reset-password', payload);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return;
      }
      throw err;
    }
  },

  async updateProfile(payload: { name: string }): Promise<CurrentUser> {
    try {
      const response = await http.put<ApiResponse<CurrentUser>>('/auth/profile', payload);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const stored = localStorage.getItem('mindsprint_mock_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = payload.name;
          localStorage.setItem('mindsprint_mock_user', JSON.stringify(parsed));
          return parsed;
        }
      }
      throw err;
    }
  },

  async me(): Promise<CurrentUser> {
    try {
      const response = await http.get<ApiResponse<CurrentUser>>('/auth/me');
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const stored = localStorage.getItem('mindsprint_mock_user');
        if (stored) return JSON.parse(stored);
        return {
          id: 1,
          name: 'Sarthak Sharma',
          email: 'alex.user@mindsprint.ai',
          role: 'USER',
        };
      }
      throw err;
    }
  },
};
