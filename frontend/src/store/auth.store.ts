import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, CurrentUser } from '@/types/auth';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isSessionExpired: boolean;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: CurrentUser | null) => void;
  setSession: (tokens: AuthTokens, user?: CurrentUser | null) => void;
  clearSession: (expired?: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isSessionExpired: false,
      setTokens: (tokens) =>
        set({
          token: tokens.token,
          refreshToken: tokens.refreshToken ?? null,
          isSessionExpired: false,
        }),
      setUser: (user) => set({ user }),
      setSession: (tokens, user = null) =>
        set({
          token: tokens.token,
          refreshToken: tokens.refreshToken ?? null,
          user,
          isSessionExpired: false,
        }),
      clearSession: (expired = false) =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isSessionExpired: expired,
        }),
    }),
    {
      name: 'ai-study-coach-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
