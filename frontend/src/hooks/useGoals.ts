import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goal.service';
import type { CreateGoalPayload } from '@/types/goal';
import { useNotificationStore } from '@/store/notification.store';

export const GOALS_KEY = 'goals';

/** Fetch all goals for the current user */
export function useGoals() {
  return useQuery({
    queryKey: [GOALS_KEY],
    queryFn: () => goalService.getGoals(),
    refetchOnWindowFocus: true,
  });
}

/** Fetch only active (non-completed) goals */
export function useActiveGoals() {
  return useQuery({
    queryKey: [GOALS_KEY, 'active'],
    queryFn: () => goalService.getActiveGoals(),
    refetchOnWindowFocus: true,
  });
}

/** Create a new goal */
export function useCreateGoal() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalService.createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      notify({ title: 'Goal created', tone: 'success' });
    },
    onError: () => {
      notify({ title: 'Failed to create goal', tone: 'error' });
    },
  });
}

/** Increment goal progress by N units (default 1) */
export function useIncrementGoalProgress() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: ({ goalId, units = 1 }: { goalId: number; units?: number }) =>
      goalService.incrementProgress(goalId, units),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      if (updated.completed) {
        notify({ title: '🎉 Goal achieved!', tone: 'success' });
      } else {
        notify({ title: 'Progress updated', tone: 'success' });
      }
    },
    onError: () => {
      notify({ title: 'Failed to update progress', tone: 'error' });
    },
  });
}

/** Delete a goal */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (goalId: number) => goalService.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      notify({ title: 'Goal deleted', tone: 'info' });
    },
    onError: () => {
      notify({ title: 'Failed to delete goal', tone: 'error' });
    },
  });
}
