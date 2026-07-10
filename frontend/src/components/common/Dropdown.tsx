import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: DropdownOption[];
};

export function Dropdown({ className, label, id, options, ...props }: DropdownProps) {
  const selectId = id ?? props.name;

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(
          'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900',
          'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
