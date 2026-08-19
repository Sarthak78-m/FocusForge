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
    const response = await http.post<ApiResponse<AuthenticationResponse>>('/auth/login', payload);
    return unwrapApiResponse(response.data);
  },

  async register(payload: RegisterRequest): Promise<RegistrationResponse> {
    const response = await http.post<ApiResponse<RegistrationResponse>>('/auth/register', payload);
    return unwrapApiResponse(response.data);
  },

  async verifyEmail(token: string) {
    const response = await http.post<ApiResponse<void>>('/auth/verify-email', { token });
    return unwrapApiResponse(response.data);
  },

  async resendVerification(payload: EmailRequest) {
    const response = await http.post<ApiResponse<void>>('/auth/resend-verification', payload);
    return unwrapApiResponse(response.data);
  },

  async forgotPassword(payload: EmailRequest) {
    const response = await http.post<ApiResponse<void>>('/auth/forgot-password', payload);
    return unwrapApiResponse(response.data);
  },

  async resetPassword(payload: ResetPasswordRequest) {
    const response = await http.post<ApiResponse<void>>('/auth/reset-password', payload);
    return unwrapApiResponse(response.data);
  },

  async updateProfile(payload: { name: string }): Promise<CurrentUser> {
    const response = await http.put<ApiResponse<CurrentUser>>('/auth/profile', payload);
    return unwrapApiResponse(response.data);
  },

  async me(): Promise<CurrentUser> {
    const response = await http.get<ApiResponse<CurrentUser>>('/auth/me');
    return unwrapApiResponse(response.data);
  },
};
