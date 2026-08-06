import { cn } from '@/utils/cn';

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      {/* Bot avatar */}
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-50 text-xs text-primary-600 shadow-sm dark:bg-primary-950 dark:text-primary-300">
        <span aria-hidden="true">🤖</span>
      </div>

      {/* Typing bubble */}
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[var(--color-border)] bg-white px-4 py-3 shadow-soft dark:bg-[var(--color-surface)]">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400 dark:bg-primary-500"
          style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400 dark:bg-primary-500"
          style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400 dark:bg-primary-500"
          style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
        />
      </div>
    </div>
  );
}
