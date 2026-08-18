import { cn } from '../../lib/utils';

interface Props {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name = 'You', size = 'md', className }: Props) {
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center select-none',
        sizes[size],
        className,
      )}
      aria-label={`${name} avatar`}
    >
      {getInitials(name)}
    </div>
  );
}
