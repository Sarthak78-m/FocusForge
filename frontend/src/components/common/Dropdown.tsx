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
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary dark:text-[var(--color-text-primary)]">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text-primary transition-all duration-200',
          'hover:border-primary-300 focus-visible:ring-secondary-400',
          'dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)]',
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
