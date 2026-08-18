import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Topbar } from '@/layouts/Topbar';
import { TodoistSidebar } from '@/layouts/TodoistSidebar';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { ChatNavigationListener } from '@/components/chat/ChatNavigationListener';
import { FloatingButton } from '@/components/chat/FloatingButton';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { GlobalCreateTaskModal } from '@/components/tasks/GlobalCreateTaskModal';
import { ErrorBoundary } from '@/components/common';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return (
    <ErrorBoundary componentName="AppShell">
      <ChatProvider>
        <ChatNavigationListener />

        {/* Full-page wrapper */}
        <div className="h-screen w-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] overflow-hidden">
          {/* Top Navigation Bar */}
          <Topbar />

          {/* Body: Sidebar + Main Content */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <TodoistSidebar />

            <main
              ref={mainRef}
              className="flex-1 min-w-0 overflow-y-auto px-6 py-6"
              style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 3rem))' }}
            >
              <div className="mx-auto max-w-5xl">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                    transition={{
                      duration: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>

        {/* Global Task Creation Modal */}
        <GlobalCreateTaskModal />

        {/* Floating AI Coach */}
        <ErrorBoundary componentName="ChatWidget">
          <FloatingButton />
          <ChatWindow />
        </ErrorBoundary>
      </ChatProvider>
    </ErrorBoundary>
  );
}
