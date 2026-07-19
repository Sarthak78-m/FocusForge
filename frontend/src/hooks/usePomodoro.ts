import { useCallback, useEffect, useRef, useState } from 'react';

export type PomodoroMode = 'work' | 'short-break' | 'long-break';

const DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const SESSIONS_BEFORE_LONG_BREAK = 4;

type PomodoroState = {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
};

function loadState(): PomodoroState {
  try {
    const raw = localStorage.getItem('pomodoro-state');
    if (raw) {
      const parsed = JSON.parse(raw) as PomodoroState;
      // Always reset to idle state on load (don't resume a running timer from storage)
      return { ...parsed, isRunning: false };
    }
  } catch {
    // ignore
  }
  return {
    mode: 'work',
    secondsLeft: DURATIONS.work,
    isRunning: false,
    sessionCount: 0,
  };
}

export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(loadState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mode, secondsLeft, isRunning, sessionCount } = state;

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pomodoro-state', JSON.stringify(state));
  }, [state]);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // When timer hits 0, advance to next mode
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      clearInterval_();
      setState((prev) => {
        const newSessionCount =
          prev.mode === 'work' ? prev.sessionCount + 1 : prev.sessionCount;
        const nextMode: PomodoroMode =
          prev.mode === 'work'
            ? newSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0
              ? 'long-break'
              : 'short-break'
            : 'work';
        return {
          mode: nextMode,
          secondsLeft: DURATIONS[nextMode],
          isRunning: false,
          sessionCount: newSessionCount,
        };
      });
    }
  }, [secondsLeft, isRunning, clearInterval_]);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return;
    setState((prev) => ({ ...prev, isRunning: true }));
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.secondsLeft <= 0) return prev;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clearInterval_();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, [clearInterval_]);

  const reset = useCallback(() => {
    clearInterval_();
    setState((prev) => ({
      ...prev,
      secondsLeft: DURATIONS[prev.mode],
      isRunning: false,
    }));
  }, [clearInterval_]);

  const setMode = useCallback(
    (newMode: PomodoroMode) => {
      clearInterval_();
      setState((prev) => ({
        ...prev,
        mode: newMode,
        secondsLeft: DURATIONS[newMode],
        isRunning: false,
      }));
    },
    [clearInterval_],
  );

  // Cleanup on unmount
  useEffect(() => {
    return clearInterval_;
  }, [clearInterval_]);

  const totalSeconds = DURATIONS[mode];
  const progress = (totalSeconds - secondsLeft) / totalSeconds;

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
    start,
    pause,
    reset,
    setMode,
  };
}
