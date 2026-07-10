import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ isOpen, title, children, onClose, footer }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn('surface w-full max-w-lg rounded-lg p-5')}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-950 dark:text-white">
            {title}
          </h2>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} aria-label="Close dialog">
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
