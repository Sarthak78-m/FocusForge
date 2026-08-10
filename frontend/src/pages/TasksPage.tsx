import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Layers } from 'lucide-react';
import { Button, ConfirmationDialog, Modal } from '@/components/common';
import { TaskFilters, TaskForm, TaskList } from '@/components/tasks';
import type { TaskFormValues } from '@/components/tasks';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useDeleteTask,
} from '@/hooks/useTasks';
import { useTheme } from '@/hooks/useTheme';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

export function TasksPage() {
  const { activePalette } = useTheme();

  // Filters & Views
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [page, setPage] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Data
  const { data, isLoading } = useTasks({
    status: status || undefined,
    priority: priority || undefined,
    page,
    size: 10,
  });

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: completeTask } = useCompleteTask();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const tasks = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleCreate = (values: TaskFormValues) => {
    createTask(
      {
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
      },
      { onSuccess: () => setIsCreateOpen(false) },
    );
  };

  const handleUpdate = (values: TaskFormValues) => {
    if (!editingTask) return;
    updateTask(
      {
        taskId: editingTask.id,
        payload: {
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
          dueDate: values.dueDate || undefined,
        },
      },
      { onSuccess: () => setEditingTask(null) },
    );
  };

  const handleComplete = (id: number) => {
    setCompletingId(id);
    completeTask(id, { onSettled: () => setCompletingId(null) });
  };

  const handleDelete = () => {
    if (deletingId === null) return;
    deleteTask(deletingId, { onSettled: () => setDeletingId(null) });
  };

  // Reset page when filters change
  const handleStatusChange = (v: TaskStatus | '') => {
    setStatus(v);
    setPage(0);
  };
  const handlePriorityChange = (v: TaskPriority | '') => {
    setPriority(v);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Task Management Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isLoading ? 'Loading workspace tasks…' : `${totalElements} total study task${totalElements !== 1 ? 's' : ''}`} · Inspired by ClickUp & Paymo
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher Pills */}
          <div className="flex items-center gap-1 rounded-full border border-slate-200/90 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
            style={{ background: activePalette.gradient }}
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        status={status}
        priority={priority}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
      />

      {/* List */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onComplete={handleComplete}
        onEdit={setEditingTask}
        onDelete={setDeletingId}
        completingId={completingId}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--color-border)] text-text-secondary hover:bg-primary-50 hover:text-[var(--color-text-primary)] disabled:opacity-40 transition-colors dark:hover:bg-primary-950"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--color-border)] text-text-secondary hover:bg-primary-50 hover:text-[var(--color-text-primary)] disabled:opacity-40 transition-colors dark:hover:bg-primary-950"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={isCreateOpen}
        title="New task"
        onClose={() => setIsCreateOpen(false)}
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={isCreating}
          submitLabel="Create task"
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={Boolean(editingTask)}
        title="Edit task"
        onClose={() => setEditingTask(null)}
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            showStatus
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            isSubmitting={isUpdating}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={deletingId !== null}
        title="Delete task"
        message="This task will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
