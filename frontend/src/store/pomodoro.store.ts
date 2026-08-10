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

import { useNotificationStore } from '@/store/notification.store';

function playAudioChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

function triggerCompletionNotification(mode: PomodoroMode) {
  const isWork = mode === 'work';
  const title = isWork ? '🎉 Focus Session Complete!' : '☕ Break Time Over!';
  const body = isWork
    ? 'Great job! Time to take a break and recharge.'
    : 'Ready to sprint? Let’s jump back into focus.';

  playAudioChime();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/favicon.ico' });
    } catch {}
  }

  useNotificationStore.getState().notify({
    title,
    message: body,
    tone: isWork ? 'success' : 'info',
    durationMs: 5000,
  });
}

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

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

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
          triggerCompletionNotification(mode);

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
