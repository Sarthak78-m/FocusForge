import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const canGoBack = page > 0;
  const canGoNext = page + 1 < totalPages;

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!canGoBack}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </Button>
      <span className="text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
        Page {Math.min(page + 1, Math.max(totalPages, 1))} of {Math.max(totalPages, 1)}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
