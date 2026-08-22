import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  taskService,
  type CreateTaskPayload,
  type GetTasksParams,
  type UpdateTaskPayload,
} from '@/services/task.service';
import { useNotificationStore } from '@/store/notification.store';
import type { ApiErrorPayload } from '@/types/api';

export const TASKS_KEY = 'tasks';

/** Extract a human-readable error message from an Axios error response. */
function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorPayload> | undefined;
  return axiosError?.response?.data?.message ?? fallback;
}

export function useTasks(params: GetTasksParams = {}) {
  return useQuery({
    queryKey: [TASKS_KEY, params],
    queryFn: () => taskService.getTasks(params),
    refetchOnWindowFocus: true,
  });
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: [TASKS_KEY, taskId],
    queryFn: () => taskService.getTask(taskId),
    enabled: Boolean(taskId),
  });
}

import { ANALYTICS_KEY } from '@/hooks/useAnalytics';

export function useCreateTask() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      notify({ title: 'Task created', tone: 'success' });
    },
    onError: (error) => {
      notify({ title: 'Failed to create task', message: extractErrorMessage(error, 'Please check your input and try again.'), tone: 'error' });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskPayload }) =>
      taskService.updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      notify({ title: 'Task updated', tone: 'success' });
    },
    onError: (error) => {
      notify({ title: 'Failed to update task', message: extractErrorMessage(error, 'Please check your input and try again.'), tone: 'error' });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (taskId: number) => taskService.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      notify({ title: 'Task completed', tone: 'success' });
    },
    onError: (error) => {
      notify({ title: 'Failed to complete task', message: extractErrorMessage(error, 'Please try again.'), tone: 'error' });
    },
  });
}

export function useReopenTask() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (taskId: number) => taskService.reopenTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      notify({ title: 'Task reopened', tone: 'success' });
    },
    onError: (error) => {
      notify({ title: 'Failed to reopen task', message: extractErrorMessage(error, 'Please try again.'), tone: 'error' });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (taskId: number) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      notify({ title: 'Task deleted', tone: 'info' });
    },
    onError: (error) => {
      notify({ title: 'Failed to delete task', message: extractErrorMessage(error, 'Please try again.'), tone: 'error' });
    },
  });
}
