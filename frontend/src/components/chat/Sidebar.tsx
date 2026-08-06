import { Search, Plus, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatContext } from '@/components/chat/ChatProvider';
import { cn } from '@/utils/cn';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function Sidebar() {
  const {
    isSidebarOpen,
    filteredConversations,
    activeConversationId,
    setActiveConversation,
    startNewConversation,
    searchQuery,
    setSearchQuery,
  } = useChatContext();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          key="chat-sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 220, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex flex-none flex-col overflow-hidden border-r border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]"
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2.5">
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
              Conversations
            </p>
            <button
              type="button"
              onClick={startNewConversation}
              aria-label="New conversation"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-text-secondary transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-2 py-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 dark:bg-[var(--color-surface)]">
              <Search className="h-3 w-3 flex-none text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-[var(--color-text-primary)] outline-none placeholder:text-text-secondary"
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <MessageSquare className="h-5 w-5 text-text-secondary opacity-60" />
                <p className="mt-2 text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
                  No conversations
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    'group w-full px-2 py-1.5 text-left transition-all duration-200',
                    activeConversationId === conv.id
                      ? 'bg-primary-50 dark:bg-primary-950'
                      : 'hover:bg-primary-50/50 dark:hover:bg-primary-950/50',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {/* Unread dot */}
                    <div className="mt-1.5 flex h-1.5 w-1.5 flex-none items-center justify-center">
                      {conv.unread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-sm" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p
                          className={cn(
                            'truncate text-xs font-medium',
                            activeConversationId === conv.id
                              ? 'text-primary-700 dark:text-primary-300 font-semibold'
                              : 'text-[var(--color-text-primary)]',
                          )}
                        >
                          {conv.title}
                        </p>
                        <span className="flex-none text-[9px] text-text-secondary dark:text-[var(--color-text-secondary)]">
                          {formatRelativeTime(conv.timestamp)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-text-secondary dark:text-[var(--color-text-secondary)]">
                        {conv.preview}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
