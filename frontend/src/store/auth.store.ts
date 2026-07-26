import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, CurrentUser } from '@/types/auth';

type AuthState = {
  token: string | null;
  user: CurrentUser | null;
  isSessionExpired: boolean;
  setToken: (token: string) => void;
  setUser: (user: CurrentUser | null) => void;
  setSession: (tokens: AuthTokens, user?: CurrentUser | null) => void;
  clearSession: (expired?: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isSessionExpired: false,
      setToken: (token) =>
        set({
          token,
          isSessionExpired: false,
        }),
      setUser: (user) => set({ user }),
      setSession: (tokens, user = null) =>
        set({
          token: tokens.token,
          user,
          isSessionExpired: false,
        }),
      clearSession: (expired = false) =>
        set({
          token: null,
          user: null,
          isSessionExpired: expired,
        }),
    }),
    {
      name: 'ai-study-coach-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
