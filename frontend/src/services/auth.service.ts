import { http, unwrapApiResponse } from '@/api/http';
import type {
  AuthenticationResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth';
import type { ApiResponse } from '@/types/api';

export const authService = {
  async login(payload: LoginRequest) {
    const response = await http.post<ApiResponse<AuthenticationResponse>>('/auth/login', payload);
    return unwrapApiResponse(response.data);
  },

  async register(payload: RegisterRequest) {
    const response = await http.post<ApiResponse<AuthenticationResponse>>('/auth/register', payload);
    return unwrapApiResponse(response.data);
  },

  async me() {
    const response = await http.get<ApiResponse<CurrentUser>>('/auth/me');
    return unwrapApiResponse(response.data);
  },
};
