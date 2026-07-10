import { create } from 'zustand';
import type { CurrentUser } from '@/types/auth';

type UserState = {
  profile: CurrentUser | null;
  setProfile: (profile: CurrentUser | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
