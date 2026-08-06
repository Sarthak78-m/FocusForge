import { cn } from '@/utils/cn';

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn('animate-pulse rounded-xl bg-primary-100/50 dark:bg-primary-900/30', className)} />;
}
