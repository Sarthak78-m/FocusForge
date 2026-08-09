export type UserRole = 'USER' | 'ADMIN';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  token: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthenticationResponse = {
  token: string;
};

export type RegistrationResponse = {
  email: string;
  emailVerificationRequired: boolean;
};

export type EmailRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};
