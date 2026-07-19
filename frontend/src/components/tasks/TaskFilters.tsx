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
          'h-9 appearance-none rounded-lg border border-stone-200 bg-white px-3 pr-8 text-sm',
          'text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500',
          !value && 'text-stone-400 dark:text-stone-500',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
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
          className="h-9 rounded-lg px-3 text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Clear
        </button>
      )}
    </div>
  );
}
