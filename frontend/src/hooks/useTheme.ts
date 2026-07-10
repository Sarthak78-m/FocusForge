import { useEffect, useMemo } from 'react';
import { useThemeStore } from '@/store/theme.store';

export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  const prefersDark = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const shouldUseDark = mode === 'dark' || (mode === 'system' && prefersDark);
    root.classList.toggle('dark', shouldUseDark);
  }, [mode, prefersDark]);

  return { mode, setMode, toggleMode };
}
