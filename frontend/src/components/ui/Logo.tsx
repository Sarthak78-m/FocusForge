import { cn } from '../../lib/utils';

interface Props {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 24 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn('text-[var(--color-accent)]', className)}
      aria-label="MindSprint"
    >
      <rect width="32" height="32" rx="7" fill="currentColor" opacity="0.15" />
      <circle cx="9" cy="10" r="2.5" fill="currentColor" />
      <circle cx="23" cy="10" r="2.5" fill="currentColor" />
      <circle cx="16" cy="22" r="2.5" fill="currentColor" />
      <path
        d="M9 12 L16 19 M23 12 L16 19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
