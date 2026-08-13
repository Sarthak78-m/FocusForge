import { useEffect } from 'react';
import { usePomodoroStore, type PomodoroMode } from '@/store/pomodoro.store';

export type { PomodoroMode };

export function usePomodoro() {
  const mode = usePomodoroStore((s) => s.mode);
  const secondsLeft = usePomodoroStore((s) => s.secondsLeft);
  const totalSecondsState = usePomodoroStore((s) => s.totalSeconds);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const sessionCount = usePomodoroStore((s) => s.sessionCount);
  const durations = usePomodoroStore((s) => s.durations);
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const reset = usePomodoroStore((s) => s.reset);
  const setMode = usePomodoroStore((s) => s.setMode);
  const adjustTime = usePomodoroStore((s) => s.adjustTime);
  const setCustomDuration = usePomodoroStore((s) => s.setCustomDuration);
  const tick = usePomodoroStore((s) => s.tick);

  useEffect(() => {
    if (!isRunning) return;
    tick();
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, tick]);

  const totalSeconds = totalSecondsState || durations[mode] || 1500;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds)) : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    mode,
    display,
    progress,
    isRunning,
    sessionCount,
    secondsLeft,
    totalSeconds,
    durations,
    start,
    pause,
    reset,
    setMode,
    adjustTime,
    setCustomDuration,
  };
}
