import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  taskService,
  type CreateTaskPayload,
  type GetTasksParams,
  type UpdateTaskPayload,
} from '@/services/task.service';
import { useNotificationStore } from '@/store/notification.store';

export const TASKS_KEY = 'tasks';

export function useTasks(params: GetTasksParams = {}) {
  return useQuery({
    queryKey: [TASKS_KEY, params],
    queryFn: () => taskService.getTasks(params),
  });
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: [TASKS_KEY, taskId],
    queryFn: () => taskService.getTask(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      notify({ title: 'Task created', tone: 'success' });
    },
    onError: () => {
      notify({ title: 'Failed to create task', tone: 'error' });
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
      notify({ title: 'Task updated', tone: 'success' });
    },
    onError: () => {
      notify({ title: 'Failed to update task', tone: 'error' });
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
      notify({ title: 'Task completed', tone: 'success' });
    },
    onError: () => {
      notify({ title: 'Failed to complete task', tone: 'error' });
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
      notify({ title: 'Task deleted', tone: 'info' });
    },
    onError: () => {
      notify({ title: 'Failed to delete task', tone: 'error' });
    },
  });
}
