import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import type { Notification } from '@/store/notification.store';
import { useNotificationStore } from '@/store/notification.store';
import { cn } from '@/utils/cn';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
};

const tones = {
  success: 'border-success-200 bg-success-50 text-success-900 dark:border-success-900 dark:bg-success-950 dark:text-success-100',
  error: 'border-error-200 bg-error-50 text-error-900 dark:border-error-900 dark:bg-error-950 dark:text-error-100',
  info: 'border-accent-200 bg-accent-50 text-accent-900 dark:border-accent-900 dark:bg-accent-950 dark:text-accent-100',
  warning: 'border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-100',
};

function ToastItem({ notification }: { notification: Notification }) {
  const dismiss = useNotificationStore((state) => state.dismiss);
  const Icon = icons[notification.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md', tones[notification.tone])}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-tight">{notification.title}</p>
        {notification.message ? <p className="mt-1 text-xs leading-relaxed opacity-90">{notification.message}</p> : null}
      </div>
      <button
        type="button"
        className="h-6 w-6 flex items-center justify-center rounded-lg opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => dismiss(notification.id)}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export function ToastViewport() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] flex flex-col gap-3 pointer-events-none items-center sm:items-end" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <ToastItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
