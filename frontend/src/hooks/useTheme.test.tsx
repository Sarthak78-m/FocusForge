import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';

describe('useTheme', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' });
    document.documentElement.classList.remove('dark');
  });

  it('applies dark mode to the document root', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setMode('dark'));

    expect(document.documentElement).toHaveClass('dark');
  });

  it('removes dark mode when light mode is selected', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setMode('dark'));
    act(() => result.current.setMode('light'));

    expect(document.documentElement).not.toHaveClass('dark');
  });
});
