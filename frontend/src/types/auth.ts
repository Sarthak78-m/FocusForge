export type UserRole = 'USER' | 'ADMIN';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  token: string;
  refreshToken?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthenticationResponse = {
  token: string;
  refreshToken?: string;
};
