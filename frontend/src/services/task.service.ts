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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getUserStorageKey(): string {
  try {
    const mockUser = localStorage.getItem('mindsprint_mock_user');
    if (mockUser) {
      const parsed = JSON.parse(mockUser);
      if (parsed?.email) {
        return `mindsprint_user_tasks_${parsed.email.toLowerCase()}`;
      }
    }
  } catch {}
  return 'mindsprint_user_tasks_default';
}

function getStoredTasks(): Task[] {
  try {
    const key = getUserStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const tasks: Task[] = JSON.parse(raw);
    const now = Date.now();
    return tasks.filter((t) => {
      const created = new Date(t.createdAt).getTime();
      return now - created <= THIRTY_DAYS_MS;
    });
  } catch {
    return [];
  }
}

function saveStoredTasks(tasks: Task[]): void {
  try {
    const key = getUserStorageKey();
    localStorage.setItem(key, JSON.stringify(tasks));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export const taskService = {
  async getTasks(params: GetTasksParams = {}): Promise<PaginatedResponse<Task>> {
    try {
      const { page = 0, size = 20, ...filters } = params;
      const response = await http.get<ApiResponse<PaginatedResponse<Task>>>('/tasks', {
        params: { ...filters, page, size },
      });
      const result = unwrapApiResponse(response.data);
      if (result.content && result.content.length > 0) {
        saveStoredTasks(result.content);
      }
      return result;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const localTasks = getStoredTasks();
        let filtered = [...localTasks];
        if (params.status) {
          filtered = filtered.filter((t) => t.status === params.status);
        }
        if (params.priority) {
          filtered = filtered.filter((t) => t.priority === params.priority);
        }
        return {
          content: filtered,
          number: 0,
          size: Math.max(20, filtered.length),
          totalElements: filtered.length,
          totalPages: 1,
          first: true,
          last: true,
        };

      }
      throw err;
    }
  },

  async getTask(taskId: number): Promise<Task> {
    try {
      const response = await http.get<ApiResponse<Task>>(`/tasks/${taskId}`);
      return unwrapApiResponse(response.data);
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const local = getStoredTasks().find((t) => t.id === taskId);
        if (local) return local;
      }
      throw err;
    }
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    try {
      const response = await http.post<ApiResponse<Task>>('/tasks', payload);
      const created = unwrapApiResponse(response.data);
      const current = getStoredTasks();
      saveStoredTasks([created, ...current]);
      return created;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const newTask: Task = {
          id: Date.now(),
          title: payload.title,
          description: payload.description || '',
          status: 'TODO',
          priority: payload.priority || 'MEDIUM',
          dueDate: payload.dueDate || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const current = getStoredTasks();
        saveStoredTasks([newTask, ...current]);
        return newTask;
      }
      throw err;
    }
  },

  async updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
    try {
      const response = await http.put<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
      const updated = unwrapApiResponse(response.data);
      const current = getStoredTasks().map((t) => (t.id === taskId ? updated : t));
      saveStoredTasks(current);
      return updated;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const current = getStoredTasks();
        let target = current.find((t) => t.id === taskId);
        if (!target) {
          throw new Error('Task not found');
        }
        const updated: Task = {
          ...target,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        saveStoredTasks(current.map((t) => (t.id === taskId ? updated : t)));
        return updated;
      }
      throw err;
    }
  },

  async completeTask(taskId: number): Promise<Task> {
    try {
      const response = await http.patch<ApiResponse<Task>>(`/tasks/${taskId}/complete`);
      const updated = unwrapApiResponse(response.data);
      const current = getStoredTasks().map((t) => (t.id === taskId ? updated : t));
      saveStoredTasks(current);
      return updated;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        const current = getStoredTasks();
        let target = current.find((t) => t.id === taskId);
        if (!target) {
          throw new Error('Task not found');
        }
        const updated: Task = {
          ...target,
          status: 'COMPLETED',
          updatedAt: new Date().toISOString(),
        };
        saveStoredTasks(current.map((t) => (t.id === taskId ? updated : t)));
        return updated;
      }
      throw err;
    }
  },

  async deleteTask(taskId: number): Promise<void> {
    try {
      await http.delete<ApiResponse<void>>(`/tasks/${taskId}`);
    } catch (err: any) {
      // Ignore network errors in local mode
    } finally {
      const current = getStoredTasks().filter((t) => t.id !== taskId);
      saveStoredTasks(current);
    }
  },
};
