import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
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
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
};

function ToastItem({ notification }: { notification: Notification }) {
  const dismiss = useNotificationStore((state) => state.dismiss);
  const Icon = icons[notification.tone];

  return (
    <div className={cn('flex w-full max-w-sm gap-3 rounded-lg border p-4 shadow-soft', tones[notification.tone])}>
      <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{notification.title}</p>
        {notification.message ? <p className="mt-1 text-sm opacity-85">{notification.message}</p> : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => dismiss(notification.id)}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ToastViewport() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
