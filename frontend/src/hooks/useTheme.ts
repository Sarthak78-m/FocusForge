import { useEffect, useMemo } from 'react';
import { useThemeStore, type ThemeAccent } from '@/store/theme.store';

export const ACCENT_PALETTES: Record<ThemeAccent, { primary: string; hover: string; light: string; gradient: string; glow: string; label: string; bgClass: string }> = {
  coral: {
    label: 'Todoist Coral',
    primary: '#E44332',
    hover: '#B31F14',
    light: '#FFDAD4',
    gradient: 'linear-gradient(135deg, #E44332 0%, #B31F14 100%)',
    glow: 'rgba(228, 67, 50, 0.35)',
    bgClass: 'bg-rose-600',
  },
  indigo: {
    label: 'Indigo Violet',
    primary: '#4F46E5',
    hover: '#4338CA',
    light: '#EEF2FF',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    glow: 'rgba(79, 70, 229, 0.35)',
    bgClass: 'bg-indigo-600',
  },
  cyan: {
    label: 'Obsidian Cyan',
    primary: '#0EA5E9',
    hover: '#0284C7',
    light: '#F0F9FF',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    glow: 'rgba(14, 165, 233, 0.35)',
    bgClass: 'bg-sky-500',
  },
  emerald: {
    label: 'Emerald Mint',
    primary: '#10B981',
    hover: '#059669',
    light: '#ECFDF5',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    glow: 'rgba(16, 185, 129, 0.35)',
    bgClass: 'bg-emerald-500',
  },
  fuchsia: {
    label: 'Electric Rose',
    primary: '#D946EF',
    hover: '#C026D3',
    light: '#FDF4FF',
    gradient: 'linear-gradient(135deg, #D946EF 0%, #E879F9 100%)',
    glow: 'rgba(217, 70, 239, 0.35)',
    bgClass: 'bg-fuchsia-500',
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
