import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn('relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-elevated border border-border dark:bg-[var(--color-surface)] dark:border-[var(--color-border)]')}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id="modal-title" className="text-lg font-semibold text-text-primary dark:text-[var(--color-text-primary)]">
                {title}
              </h2>
              <Button variant="ghost" size="icon" type="button" onClick={onClose} aria-label="Close dialog">
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <div>{children}</div>
            {footer ? <div className="mt-5 flex justify-end gap-3">{footer}</div> : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
