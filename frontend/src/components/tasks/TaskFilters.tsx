import { ChevronDown } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/types/task';
import { cn } from '@/utils/cn';

type TaskFiltersProps = {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  onStatusChange: (v: TaskStatus | '') => void;
  onPriorityChange: (v: TaskPriority | '') => void;
};

function Select({
  value,
  onChange,
  options,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  id: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 appearance-none rounded-xl border border-[var(--color-border)] bg-white px-3 pr-8 text-sm transition-all duration-200',
          'text-[var(--color-text-primary)] dark:bg-[var(--color-surface)]',
          'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400',
          !value && 'text-text-secondary dark:text-[var(--color-text-secondary)]',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
    </div>
  );
}

export function TaskFilters({ status, priority, onStatusChange, onPriorityChange }: TaskFiltersProps) {
  const hasFilters = Boolean(status || priority);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        id="filter-status"
        value={status}
        onChange={(v) => onStatusChange(v as TaskStatus | '')}
        placeholder="All statuses"
        options={[
          { value: 'TODO', label: 'To Do' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'COMPLETED', label: 'Completed' },
        ]}
      />
      <Select
        id="filter-priority"
        value={priority}
        onChange={(v) => onPriorityChange(v as TaskPriority | '')}
        placeholder="All priorities"
        options={[
          { value: 'HIGH', label: 'High' },
          { value: 'MEDIUM', label: 'Medium' },
          { value: 'LOW', label: 'Low' },
        ]}
      />
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            onStatusChange('');
            onPriorityChange('');
          }}
          className="h-10 rounded-xl px-3 text-sm font-medium text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 dark:hover:bg-primary-950"
        >
          Clear
        </button>
      )}
    </div>
  );
}
