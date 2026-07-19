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
        'flex items-center gap-2 border-b border-stone-200 bg-white px-3 py-2.5 dark:border-stone-800 dark:bg-stone-950',
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
          'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
          isSidebarOpen
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
            : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900',
        )}
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Brand */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-indigo-600">
          <Timer className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
            MindSprint Coach
          </p>
          <p className="text-[10px] leading-none text-stone-400 dark:text-stone-600">
            {isTyping ? (
              <span className="text-indigo-500 dark:text-indigo-400">Typing…</span>
            ) : isLoadingContext ? (
              <span className="text-amber-500 dark:text-amber-400">Loading context…</span>
            ) : contextSnapshot ? (
              <span className="text-emerald-500">
                ● Context ready · {contextSnapshot.pendingTasks.length} tasks loaded
              </span>
            ) : (
              <span className="text-stone-400">● Online</span>
            )}
          </p>
        </div>
      </div>

      {/* Conversation title (truncated) */}
      <p className="hidden max-w-[130px] truncate text-xs text-stone-400 dark:text-stone-600 sm:block">
        {activeConversation.title}
      </p>

      {/* Refresh context */}
      <button
        type="button"
        onClick={refreshContext}
        disabled={isLoadingContext}
        aria-label="Refresh context"
        title="Refresh study context"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-stone-600 dark:hover:bg-stone-900 dark:hover:text-stone-300"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', isLoadingContext && 'animate-spin')} />
      </button>

      {/* Clear chat */}
      <button
        type="button"
        onClick={clearActiveConversation}
        aria-label="Clear conversation"
        title="Clear conversation"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-600 dark:hover:bg-stone-900 dark:hover:text-stone-300"
      >
        <Eraser className="h-3.5 w-3.5" />
      </button>

      {/* Close */}
      <button
        type="button"
        onClick={closeChat}
        aria-label="Close chat"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-600 dark:hover:bg-stone-900 dark:hover:text-stone-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
