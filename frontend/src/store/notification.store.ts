import { create } from 'zustand';

export type NotificationTone = 'success' | 'error' | 'info' | 'warning';

export type Notification = {
  id: string;
  title: string;
  message?: string;
  tone: NotificationTone;
  durationMs?: number;
};

type NotificationState = {
  notifications: Notification[];
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  notify: (notification) => {
    const id = crypto.randomUUID();
    const duration = notification.durationMs ?? 3000; // Auto dismiss after 3s default

    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id,
          ...notification,
        },
      ],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, duration);
    }
  },
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clear: () => set({ notifications: [] }),
}));
