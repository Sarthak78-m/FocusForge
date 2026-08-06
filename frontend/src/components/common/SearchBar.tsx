import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder = 'Search', className }: SearchBarProps) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm text-text-primary placeholder:text-text-secondary transition-all duration-200 hover:border-primary-300 focus-visible:ring-secondary-400 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)]"
        type="search"
      />
    </label>
  );
}
