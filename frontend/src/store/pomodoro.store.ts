import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PomodoroMode = 'work' | 'short-break' | 'long-break';

export const DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const SESSIONS_BEFORE_LONG_BREAK = 4;

type PomodoroStoreState = {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  targetEndTime: number | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: PomodoroMode) => void;
  tick: () => void;
};

export const usePomodoroStore = create<PomodoroStoreState>()(
  persist(
    (set, get) => ({
      mode: 'work',
      secondsLeft: DURATIONS.work,
      isRunning: false,
      sessionCount: 0,
      targetEndTime: null,

      start: () => {
        const { isRunning, secondsLeft } = get();
        if (isRunning) return;
        const targetEndTime = Date.now() + secondsLeft * 1000;
        set({ isRunning: true, targetEndTime });
      },

      pause: () => {
        const { isRunning, targetEndTime } = get();
        if (!isRunning) return;
        const now = Date.now();
        const secondsLeft = targetEndTime
          ? Math.max(0, Math.round((targetEndTime - now) / 1000))
          : get().secondsLeft;
        set({ isRunning: false, targetEndTime: null, secondsLeft });
      },

      reset: () => {
        const mode = get().mode;
        set({
          secondsLeft: DURATIONS[mode],
          isRunning: false,
          targetEndTime: null,
        });
      },

      setMode: (newMode: PomodoroMode) => {
        set({
          mode: newMode,
          secondsLeft: DURATIONS[newMode],
          isRunning: false,
          targetEndTime: null,
        });
      },

      tick: () => {
        const { isRunning, targetEndTime, mode, sessionCount } = get();
        if (!isRunning || !targetEndTime) return;

        const now = Date.now();
        const diffSeconds = Math.round((targetEndTime - now) / 1000);

        if (diffSeconds <= 0) {
          const newSessionCount = mode === 'work' ? sessionCount + 1 : sessionCount;
          const nextMode: PomodoroMode =
            mode === 'work'
              ? newSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0
                ? 'long-break'
                : 'short-break'
              : 'work';

          set({
            mode: nextMode,
            secondsLeft: DURATIONS[nextMode],
            isRunning: false,
            targetEndTime: null,
            sessionCount: newSessionCount,
          });
        } else {
          set({ secondsLeft: diffSeconds });
        }
      },
    }),
    {
      name: 'mindsprint_pomodoro_global_store',
      partialize: (state) => ({
        mode: state.mode,
        secondsLeft: state.secondsLeft,
        isRunning: state.isRunning,
        sessionCount: state.sessionCount,
        targetEndTime: state.targetEndTime,
      }),
    }
  )
);
