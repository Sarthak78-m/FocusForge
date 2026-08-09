import type { ReactNode } from 'react';
import { Topbar } from '@/layouts/Topbar';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { ChatNavigationListener } from '@/components/chat/ChatNavigationListener';
import { FloatingButton } from '@/components/chat/FloatingButton';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ErrorBoundary } from '@/components/common';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <ErrorBoundary componentName="AppShell">
      <ChatProvider>
        <ChatNavigationListener />

        {/* Full-page wrapper */}
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">

          {/* Top navigation bar — replaces sidebar */}
          <Topbar />

          {/* Page content */}
          <main
            className="mx-auto w-full max-w-content px-6 py-8"
            /* Extra bottom padding on mobile so content clears the fixed bottom tab bar */
            style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 4.5rem))' }}
          >
            {children}
          </main>
        </div>

        {/* Floating AI Coach — isolated so a crash can't break the page */}
        <ErrorBoundary componentName="ChatWidget">
          <FloatingButton />
          <ChatWindow />
        </ErrorBoundary>
      </ChatProvider>
    </ErrorBoundary>
  );
}
