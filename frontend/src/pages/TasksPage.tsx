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
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Task Management Studio
          </h1>
          <p className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]">
            {isLoading ? 'Loading workspace tasks…' : `${totalElements} total work task${totalElements !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher Pills */}
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white p-1 shadow-xs dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105"
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

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          completingId={completingId}
          onComplete={handleComplete}
          onEdit={(task) => setEditingTask(task)}
          onDelete={(id) => setDeletingId(id)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backlog Column */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  To Do ({tasks.filter((t) => t.status === 'TODO').length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === 'TODO')
                .map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-medium text-slate-400">{task.dueDate ?? 'No deadline'}</span>
                      <button
                        type="button"
                        onClick={() => handleComplete(task.id)}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  In Progress ({tasks.filter((t) => t.status === 'IN_PROGRESS').length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === 'IN_PROGRESS')
                .map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-medium text-slate-400">{task.dueDate ?? 'No deadline'}</span>
                      <button
                        type="button"
                        onClick={() => handleComplete(task.id)}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Completed ({tasks.filter((t) => t.status === 'COMPLETED').length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === 'COMPLETED')
                .map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm opacity-80 dark:border-slate-800 dark:bg-slate-900/70 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-through">{task.title}</h4>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Done
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

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
