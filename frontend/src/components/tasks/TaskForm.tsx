import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/common';
import { cn } from '@/utils/cn';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import { useGoals } from '@/hooks/useGoals';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(160, 'Max 160 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED'] as const).optional(),
  category: z.string().max(80, 'Max 80 characters').optional(),
  estimatedPomodoros: z.coerce.number().int().min(1).max(20).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  dueDate: z.string().optional(),
  goalId: z.coerce.number().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
});

export type TaskFormValues = z.infer<typeof schema>;

type TaskFormProps = {
  defaultValues?: Partial<TaskFormValues>;
  task?: Task;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showStatus?: boolean;
};

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--color-text-primary)]">
      {children}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-11 w-full appearance-none rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm transition-all duration-200',
        'text-[var(--color-text-primary)] dark:bg-[var(--color-surface)]',
        'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400',
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function TaskForm({
  defaultValues,
  task,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save',
  showStatus = false,
}: TaskFormProps) {
  const { data: goals = [] } = useGoals();
  const goalOptions = goals.map(g => ({ value: g.id, label: g.title }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? undefined,
      status: task?.status ?? undefined,
      category: task?.category ?? '',
      estimatedPomodoros: task?.estimatedPomodoros ?? undefined,
      dueDate: task?.dueDate ?? '',
      goalId: task?.goalId ?? undefined,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        category: task.category ?? '',
        estimatedPomodoros: task.estimatedPomodoros ?? undefined,
        dueDate: task.dueDate ?? '',
        goalId: task.goalId ?? undefined,
      });
    }
  }, [task, reset]);

  const priority = watch('priority');
  const status = watch('status');
  const goalId = watch('goalId');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Input
          id="task-title"
          label="Title *"
          placeholder="What needs to be done?"
          error={errors.title?.message}
          {...register('title')}
        />
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="task-description">Description</FieldLabel>
        <textarea
          id="task-description"
          placeholder="Add details (optional)"
          rows={3}
          className={cn(
            'w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm transition-all duration-200',
            'text-[var(--color-text-primary)] placeholder:text-text-secondary',
            'dark:bg-[var(--color-surface)]',
            'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400',
            'resize-none',
          )}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-error-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
          <SelectField
            id="task-priority"
            value={priority}
            onChange={(v) => setValue('priority', v as TaskPriority)}
            options={priorityOptions}
            placeholder="None"
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="task-due">Due date</FieldLabel>
          <input
            id="task-due"
            type="date"
            className={cn(
              'h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm transition-all duration-200',
              'text-[var(--color-text-primary)] dark:bg-[var(--color-surface)]',
              'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400',
            )}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p className="text-xs text-error-600">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Input
            id="task-category"
            label="Category"
            placeholder="e.g. Backend, Design"
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="task-pomodoros">Est. Pomodoros 🍅</FieldLabel>
          <input
            id="task-pomodoros"
            type="number"
            min={1}
            max={20}
            placeholder="e.g. 3"
            className={cn(
              'h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm transition-all duration-200',
              'text-[var(--color-text-primary)] dark:bg-[var(--color-surface)]',
              'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400',
            )}
            {...register('estimatedPomodoros')}
          />
          {errors.estimatedPomodoros && (
            <p className="text-xs text-error-600">{errors.estimatedPomodoros.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="task-goal">Goal (Optional)</FieldLabel>
        <SelectField
          id="task-goal"
          value={goalId}
          onChange={(v) => setValue('goalId', v ? Number(v) : undefined)}
          options={goalOptions}
          placeholder="No Goal"
        />
      </div>

      {showStatus && (
        <div className="space-y-1.5">
          <FieldLabel htmlFor="task-status">Status</FieldLabel>
          <SelectField
            id="task-status"
            value={status}
            onChange={(v) => setValue('status', v as TaskStatus)}
            options={statusOptions}
            placeholder="Select status"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
