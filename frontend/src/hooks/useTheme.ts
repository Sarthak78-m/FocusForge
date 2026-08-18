import { useEffect, useMemo } from 'react';
import { useThemeStore, type ThemeAccent } from '@/store/theme.store';

export const ACCENT_PALETTES: Record<ThemeAccent, { primary: string; hover: string; light: string; gradient: string; glow: string; label: string; bgClass: string }> = {
  coral: {
    label: 'Warm Terracotta',
    primary: '#E45834',
    hover: '#CD4725',
    light: '#FDF2EE',
    gradient: '#E45834',
    glow: 'none',
    bgClass: 'bg-orange-600',
  },
  indigo: {
    label: 'Deep Slate',
    primary: '#334155',
    hover: '#1e293b',
    light: '#f1f5f9',
    gradient: '#334155',
    glow: 'none',
    bgClass: 'bg-slate-800',
  },
  cyan: {
    label: 'Zinc Gray',
    primary: '#52525b',
    hover: '#3f3f46',
    light: '#f4f4f5',
    gradient: '#52525b',
    glow: 'none',
    bgClass: 'bg-zinc-700',
  },
  emerald: {
    label: 'Muted Olive',
    primary: '#3f483d',
    hover: '#2c332b',
    light: '#f2f4f2',
    gradient: '#3f483d',
    glow: 'none',
    bgClass: 'bg-stone-800',
  },
  fuchsia: {
    label: 'Graphite',
    primary: '#262626',
    hover: '#171717',
    light: '#f5f5f5',
    gradient: '#262626',
    glow: 'none',
    bgClass: 'bg-neutral-800',
  },
};




export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent || 'coral');
  const setMode = useThemeStore((state) => state.setMode);
  const setAccent = useThemeStore((state) => state.setAccent);
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
    root.setAttribute('data-accent', accent);

    const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.coral;
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-hover', palette.hover);
    root.style.setProperty('--color-primary-light', palette.light);
    root.style.setProperty('--color-primary-subtle', palette.light);
  }, [mode, accent, prefersDark]);

  return { mode, accent, setMode, setAccent, toggleMode, activePalette: ACCENT_PALETTES[accent] || ACCENT_PALETTES.coral };
}
