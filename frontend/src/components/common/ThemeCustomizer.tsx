import { useState } from 'react';
import { Palette, Check, Moon, Sun, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, ACCENT_PALETTES } from '@/hooks/useTheme';
import { type ThemeAccent } from '@/store/theme.store';
import { cn } from '@/utils/cn';

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, accent, setMode, setAccent } = useTheme();

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        title="Customize Color Theme"
      >
        <Palette className="h-3.5 w-3.5 text-[var(--color-primary)]" />
        <span className="hidden sm:inline">Theme Palette</span>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: ACCENT_PALETTES[accent]?.primary }}
        />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Theme Customizer
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  APPEARANCE MODE
                </p>
                <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setMode('light')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                      mode === 'light'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('dark')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                      mode === 'dark'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Accent Swatches */}
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  INTERACTIVE ACCENT COLOR
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(ACCENT_PALETTES) as ThemeAccent[]).map((key) => {
                    const palette = ACCENT_PALETTES[key];
                    const isSelected = accent === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAccent(key)}
                        className={cn(
                          'relative flex h-10 w-full items-center justify-center rounded-xl transition-all duration-200 hover:scale-105',
                          isSelected ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] dark:ring-offset-slate-900' : ''
                        )}
                        style={{ background: palette.gradient }}
                        title={palette.label}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  MindSprint Custom Color Engine
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
