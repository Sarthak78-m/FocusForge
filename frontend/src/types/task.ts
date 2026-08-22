export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string | null;
  estimatedPomodoros?: number | null;
  dueDate?: string | null;
  completedAt?: string | null;
  goalId?: number | null;
  createdAt: string;
  updatedAt: string;
};
