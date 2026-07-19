import type { ReactNode } from 'react';
import { Sidebar } from '@/layouts/Sidebar';
import { Topbar } from '@/layouts/Topbar';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { FloatingButton } from '@/components/chat/FloatingButton';
import { ChatWindow } from '@/components/chat/ChatWindow';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
        <Sidebar />
        <div className="min-h-screen lg:pl-64">
          <Topbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>

        {/* Floating AI Coach */}
        <FloatingButton />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
