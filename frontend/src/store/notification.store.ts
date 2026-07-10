import { create } from 'zustand';

export type NotificationTone = 'success' | 'error' | 'info' | 'warning';

export type Notification = {
  id: string;
  title: string;
  message?: string;
  tone: NotificationTone;
};

type NotificationState = {
  notifications: Notification[];
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  notify: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: crypto.randomUUID(),
          ...notification,
        },
      ],
    })),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),
  clear: () => set({ notifications: [] }),
}));
