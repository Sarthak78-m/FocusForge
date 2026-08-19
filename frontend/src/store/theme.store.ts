import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeAccent = 'indigo' | 'cyan' | 'coral' | 'emerald' | 'fuchsia';

type ThemeState = {
  mode: ThemeMode;
  accent: ThemeAccent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
  toggleMode: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      accent: 'coral',
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      toggleMode: () => {
        const current = get().mode;
        set({ mode: current === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'mindsprint-theme-v4',
    },
  ),
);

