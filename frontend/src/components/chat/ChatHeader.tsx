import { Eraser, Minus, PanelLeft, RefreshCw, Timer, X } from 'lucide-react';
import { useChatContext } from '@/components/chat/ChatProvider';
import { cn } from '@/utils/cn';

type ChatHeaderProps = {
  className?: string;
};

export function ChatHeader({ className }: ChatHeaderProps) {
  const {
    closeChat,
    toggleSidebar,
    isSidebarOpen,
    clearActiveConversation,
    activeConversation,
    isTyping,
    contextSnapshot,
    isLoadingContext,
    refreshContext,
  } = useChatContext();

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b border-[var(--color-border)] bg-white px-3 py-2.5 dark:bg-[var(--color-surface)]',
        className,
      )}
    >
      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open conversations'}
        aria-pressed={isSidebarOpen}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200',
          isSidebarOpen
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-semibold'
            : 'text-text-secondary hover:bg-primary-50/60 hover:text-[var(--color-text-primary)] dark:hover:bg-primary-950/60',
        )}
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Brand */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-primary-500 shadow-sm">
          <Timer className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            FocusForge Coach
          </p>
          <p className="text-[10px] leading-none text-text-secondary dark:text-[var(--color-text-secondary)]">
            {isTyping ? (
              <span className="text-primary-500 font-medium">Typing…</span>
            ) : isLoadingContext ? (
              <span className="text-warning-500 font-medium">Loading context…</span>
            ) : contextSnapshot ? (
              <span className="text-success-600 font-medium">
                ● Context ready · {contextSnapshot.pendingTasks.length} tasks loaded
              </span>
            ) : (
              <span className="text-text-secondary">● Online</span>
            )}
          </p>
        </div>
      </div>

      {/* Conversation title (truncated) */}
      <p className="hidden max-w-[130px] truncate text-xs text-text-secondary dark:text-[var(--color-text-secondary)] sm:block">
        {activeConversation.title}
      </p>

      {/* Refresh context */}
      <button
        type="button"
        onClick={refreshContext}
        disabled={isLoadingContext}
        aria-label="Refresh context"
        title="Refresh study context"
        className="flex h-7 w-7 items-center justify-center rounded-xl text-text-secondary transition-all duration-200 hover:bg-primary-50 hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-primary-950"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', isLoadingContext && 'animate-spin')} />
      </button>

      {/* Clear chat */}
      <button
        type="button"
        onClick={clearActiveConversation}
        aria-label="Clear conversation"
        title="Clear conversation"
        className="flex h-7 w-7 items-center justify-center rounded-xl text-text-secondary transition-all duration-200 hover:bg-primary-50 hover:text-[var(--color-text-primary)] dark:hover:bg-primary-950"
      >
        <Eraser className="h-3.5 w-3.5" />
      </button>

      {/* Close */}
      <button
        type="button"
        onClick={closeChat}
        aria-label="Close chat"
        className="flex h-7 w-7 items-center justify-center rounded-xl text-text-secondary transition-all duration-200 hover:bg-primary-50 hover:text-[var(--color-text-primary)] dark:hover:bg-primary-950"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
