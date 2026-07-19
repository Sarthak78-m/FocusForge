import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string; // ISO date: YYYY-MM-DD
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
};

export type GetTasksParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueBefore?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export const taskService = {
  async getTasks(params: GetTasksParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<Task>>>('/tasks', {
      params: { ...filters, page, size },
    });
    return unwrapApiResponse(response.data);
  },

  async getTask(taskId: number) {
    const response = await http.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return unwrapApiResponse(response.data);
  },

  async createTask(payload: CreateTaskPayload) {
    const response = await http.post<ApiResponse<Task>>('/tasks', payload);
    return unwrapApiResponse(response.data);
  },

  async updateTask(taskId: number, payload: UpdateTaskPayload) {
    const response = await http.put<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
    return unwrapApiResponse(response.data);
  },

  async completeTask(taskId: number) {
    const response = await http.patch<ApiResponse<Task>>(`/tasks/${taskId}/complete`);
    return unwrapApiResponse(response.data);
  },

  async deleteTask(taskId: number) {
    await http.delete<ApiResponse<void>>(`/tasks/${taskId}`);
  },
};
