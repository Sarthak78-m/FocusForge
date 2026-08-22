import { useQuery } from '@tanstack/react-query';
import { pomodoroService } from '@/services/pomodoro.service';

export const POMO_SESSIONS_KEY = 'pomodoroSessions';
export const POMO_TODAY_SESSIONS_KEY = 'pomodoroTodaySessions';

export function usePomodoroSessions() {
  return useQuery({
    queryKey: [POMO_SESSIONS_KEY],
    queryFn: () => pomodoroService.getSessions(),
  });
}

export function useTodayPomodoroSessions() {
  return useQuery({
    queryKey: [POMO_TODAY_SESSIONS_KEY],
    queryFn: () => pomodoroService.getTodaySessions(),
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });
}
