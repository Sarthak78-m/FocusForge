import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pomodoroService } from '@/services/pomodoro.service';
import type { CreateSessionPayload } from '@/types/pomodoro';
import { useNotificationStore } from '@/store/notification.store';

export const POMO_SESSIONS_KEY = 'pomodoroSessions';
export const POMO_STATS_KEY = 'pomodoroStats';

/** Fetch all Pomodoro sessions for the current user */
export function usePomodoroSessions() {
  return useQuery({
    queryKey: [POMO_SESSIONS_KEY],
    queryFn: () => pomodoroService.getSessions(),
    refetchOnWindowFocus: true,
  });
}

/** Fetch aggregated Pomodoro statistics */
export function usePomodoroStats() {
  return useQuery({
    queryKey: [POMO_STATS_KEY],
    queryFn: () => pomodoroService.getStats(),
    refetchOnWindowFocus: true,
  });
}

/** Record a completed Pomodoro session to the backend */
export function useLogPomodoroSession() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => pomodoroService.logSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POMO_SESSIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [POMO_STATS_KEY] });
    },
    onError: () => {
      notify({ title: 'Failed to save session', tone: 'error' });
    },
  });
}
