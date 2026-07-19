import { cn } from '@/utils/cn';

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      {/* Bot avatar */}
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-indigo-100 text-xs dark:bg-indigo-950">
        <span aria-hidden="true">🤖</span>
      </div>

      {/* Typing bubble */}
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-stone-400 dark:bg-stone-500"
          style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-stone-400 dark:bg-stone-500"
          style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-stone-400 dark:bg-stone-500"
          style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
        />
      </div>
    </div>
  );
}
