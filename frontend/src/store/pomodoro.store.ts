import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PomodoroMode = 'work' | 'short-break' | 'long-break';

export const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

export const DURATIONS = DEFAULT_DURATIONS;

const SESSIONS_BEFORE_LONG_BREAK = 4;

type PomodoroStoreState = {
  mode: PomodoroMode;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  sessionCount: number;
  targetEndTime: number | null;
  activeSessionId: number | null;
  durations: Record<PomodoroMode, number>;
  init: () => Promise<void>;
  start: (taskId?: number | null) => Promise<void>;
  pause: () => void;
  reset: () => Promise<void>;
  skip: () => Promise<void>;
  setMode: (mode: PomodoroMode) => Promise<void>;
  adjustTime: (deltaSeconds: number) => void;
  setCustomDuration: (mode: PomodoroMode, minutes: number) => void;
  tick: () => Promise<void>;
};

import { useNotificationStore } from '@/store/notification.store';
import { pomodoroService } from '@/services/pomodoro.service';
import { queryClient } from '@/api/queryClient';

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
      durations: { ...DEFAULT_DURATIONS },
      secondsLeft: DEFAULT_DURATIONS.work,
      totalSeconds: DEFAULT_DURATIONS.work,
      isRunning: false,
      sessionCount: 0,
      targetEndTime: null,

      activeSessionId: null,

      init: async () => {
        try {
          const active = await pomodoroService.getActiveSession();
          if (active?.status === 'STARTED') {
            // Restore session from backend with authoritative timing
            set({ 
              activeSessionId: active.id,
              // Set mode based on session type
              mode: active.sessionType === 'FOCUS' ? 'work' : active.sessionType === 'SHORT_BREAK' ? 'short-break' : 'long-break',
              // Set total seconds based on planned duration from backend
              totalSeconds: (active.plannedDuration || 25) * 60,
              // Calculate remaining time based on backend timestamps
              secondsLeft: Math.max(0, Math.round(((active.plannedDuration || 25) * 60) - (Date.now() - new Date(active.startedAt).getTime()) / 1000)),
              isRunning: false, // Always start paused on restore
              targetEndTime: null,
            });
          } else {
            // The backend reconciles expired sessions before responding.
            set({ activeSessionId: null, isRunning: false, targetEndTime: null });
          }
        } catch (err) {
          console.error('Failed to init pomodoro sessions', err);
        }
      },

      start: async (taskId?: number | null) => {
        const { isRunning, secondsLeft, mode, durations, activeSessionId } = get();
        if (isRunning) return;

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

        try {
          if (!activeSessionId) {
            const mappedType = mode === 'work' ? 'FOCUS' : mode === 'short-break' ? 'SHORT_BREAK' : 'LONG_BREAK';
            const plannedMin = Math.round(durations[mode] / 60);
            
            const session = await pomodoroService.startSession({
              sessionType: mappedType,
              plannedDuration: plannedMin,
              taskId: taskId ?? null,
            });
            set({ activeSessionId: session.id });
          }
          const targetEndTime = Date.now() + secondsLeft * 1000;
          set({ isRunning: true, targetEndTime });
        } catch (error) {
          useNotificationStore.getState().notify({
            title: 'Failed to start session',
            message: 'Network error or backend unavailable.',
            tone: 'error',
          });
        }
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

      reset: async () => {
        const { mode, durations, activeSessionId, totalSeconds, secondsLeft } = get();
        if (activeSessionId) {
          try {
            const actualDuration = Math.round((totalSeconds - secondsLeft) / 60);
            await pomodoroService.interruptSession(activeSessionId, { actualDuration });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['rewards'] });
          } catch (e) {
             console.error('Failed to interrupt session during reset', e);
             useNotificationStore.getState().notify({
               title: 'Session Interrupt Failed',
               message: 'Unable to save session interruption. Your data may not be synced.',
               tone: 'error',
               durationMs: 5000,
             });
          }
        }
        
        const defaultSec = durations[mode] || DEFAULT_DURATIONS[mode];
        set({
          secondsLeft: defaultSec,
          totalSeconds: defaultSec,
          isRunning: false,
          targetEndTime: null,
          activeSessionId: null,
        });
      },

      skip: async () => {
        const { mode, durations, activeSessionId, sessionCount, totalSeconds, secondsLeft } = get();
        if (activeSessionId) {
          try {
            const actualDuration = Math.round((totalSeconds - secondsLeft) / 60);
            await pomodoroService.interruptSession(activeSessionId, { actualDuration });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['rewards'] });
          } catch (e) {
             console.error('Failed to interrupt session during skip', e);
             useNotificationStore.getState().notify({
               title: 'Session Interrupt Failed',
               message: 'Unable to save session interruption. Your data may not be synced.',
               tone: 'error',
               durationMs: 5000,
             });
          }
        }
        
        const newSessionCount = mode === 'work' ? sessionCount + 1 : sessionCount;
        const nextMode = mode === 'work'
          ? (newSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'long-break' : 'short-break')
          : 'work';
          
        const nextDuration = durations[nextMode] || DEFAULT_DURATIONS[nextMode];
        set({
          mode: nextMode,
          secondsLeft: nextDuration,
          totalSeconds: nextDuration,
          isRunning: false,
          targetEndTime: null,
          activeSessionId: null,
          sessionCount: newSessionCount,
        });
      },

      setMode: async (newMode: PomodoroMode) => {
        const { durations, activeSessionId, totalSeconds, secondsLeft } = get();
        if (activeSessionId) {
          try {
            const actualDuration = Math.round((totalSeconds - secondsLeft) / 60);
            await pomodoroService.interruptSession(activeSessionId, { actualDuration });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['rewards'] });
          } catch (e) {
             console.error('Failed to interrupt session during mode change', e);
             useNotificationStore.getState().notify({
               title: 'Session Interrupt Failed',
               message: 'Unable to save session interruption. Your data may not be synced.',
               tone: 'error',
               durationMs: 5000,
             });
          }
        }
        const defaultSec = durations[newMode] || DEFAULT_DURATIONS[newMode];
        set({
          mode: newMode,
          secondsLeft: defaultSec,
          totalSeconds: defaultSec,
          isRunning: false,
          targetEndTime: null,
          activeSessionId: null,
        });
      },

      adjustTime: (deltaSeconds: number) => {
        const { isRunning, secondsLeft, totalSeconds } = get();
        const maxLimit = 180 * 60; // max 3 hours
        const newSeconds = Math.max(0, Math.min(maxLimit, secondsLeft + deltaSeconds));
        
        let newTargetEndTime: number | null = null;
        if (isRunning) {
          newTargetEndTime = Date.now() + newSeconds * 1000;
        }

        const newTotalSeconds = Math.max(totalSeconds, newSeconds);

        set({
          secondsLeft: newSeconds,
          totalSeconds: newTotalSeconds,
          targetEndTime: isRunning ? newTargetEndTime : null,
        });
      },

      setCustomDuration: (modeToSet: PomodoroMode, minutes: number) => {
        const sanitizedMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
        const newSec = sanitizedMinutes * 60;
        const { mode, isRunning, durations } = get();
        const updatedDurations = { ...durations, [modeToSet]: newSec };

        const updates: Partial<PomodoroStoreState> = {
          durations: updatedDurations,
        };

        if (mode === modeToSet) {
          updates.secondsLeft = newSec;
          updates.totalSeconds = newSec;
          if (isRunning) {
            updates.targetEndTime = Date.now() + newSec * 1000;
          }
        }

        set(updates);
      },

      tick: async () => {
        const { isRunning, targetEndTime, mode, sessionCount, durations, activeSessionId } = get();
        if (!isRunning || !targetEndTime) return;

        const now = Date.now();
        const diffSeconds = Math.round((targetEndTime - now) / 1000);

        if (diffSeconds <= 0) {
          // Timer reached zero - pause the timer locally while we complete the session
          set({ isRunning: false });
          
          triggerCompletionNotification(mode);

          if (activeSessionId) {
            try {
              // Call backend to complete the session
              // Note: Backend now derives actualDuration authoritatively from timestamps
              await pomodoroService.completeSession(activeSessionId, {
                actualDuration: Math.round((durations[mode] || 1500) / 60), // Sent for reference only
              });
              
              // Only invalidate queries after successful completion
              queryClient.invalidateQueries({ queryKey: ['analytics'] });
              queryClient.invalidateQueries({ queryKey: ['rewards'] });
              
              // Backend succeeded - clear the session and transition
              const newSessionCount = mode === 'work' ? sessionCount + 1 : sessionCount;
              const nextMode: PomodoroMode =
                mode === 'work'
                  ? newSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0
                    ? 'long-break'
                    : 'short-break'
                  : 'work';

              const nextDuration = durations[nextMode] || DEFAULT_DURATIONS[nextMode];

              set({
                mode: nextMode,
                secondsLeft: nextDuration,
                totalSeconds: nextDuration,
                isRunning: false,
                targetEndTime: null,
                activeSessionId: null,
                sessionCount: newSessionCount,
              });
            } catch (err) {
              // Backend completion failed - preserve session state
              console.error('Failed to complete session', err);
              
              // Keep the session active and show error
              useNotificationStore.getState().notify({
                title: 'Session Completion Failed',
                message: 'Unable to save session completion. Please retry or contact support.',
                tone: 'error',
                durationMs: 10000,
              });
              
              // Keep session active with 0 seconds left, don't auto-transition
              set({
                secondsLeft: 0,
                isRunning: false,
                // Keep activeSessionId so user can retry
              });
            }
          } else {
            // No active session - just transition locally
            const newSessionCount = mode === 'work' ? sessionCount + 1 : sessionCount;
            const nextMode: PomodoroMode =
              mode === 'work'
                ? newSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0
                  ? 'long-break'
                  : 'short-break'
                : 'work';

            const nextDuration = durations[nextMode] || DEFAULT_DURATIONS[nextMode];

            set({
              mode: nextMode,
              secondsLeft: nextDuration,
              totalSeconds: nextDuration,
              isRunning: false,
              targetEndTime: null,
              sessionCount: newSessionCount,
            });
          }
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
        totalSeconds: state.totalSeconds,
        isRunning: state.isRunning,
        sessionCount: state.sessionCount,
        targetEndTime: state.targetEndTime,
        durations: state.durations,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
