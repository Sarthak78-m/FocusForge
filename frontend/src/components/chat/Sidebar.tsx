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
          className="flex flex-none flex-col overflow-hidden border-r border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-3 py-2.5 dark:border-stone-800">
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Conversations
            </p>
            <button
              type="button"
              onClick={startNewConversation}
              aria-label="New conversation"
              className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-2 py-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2 py-1.5 dark:border-stone-700 dark:bg-stone-800">
              <Search className="h-3 w-3 flex-none text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-300"
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <MessageSquare className="h-5 w-5 text-stone-300 dark:text-stone-600" />
                <p className="mt-2 text-xs text-stone-400 dark:text-stone-600">
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
                    'group w-full px-2 py-1.5 text-left transition-colors',
                    activeConversationId === conv.id
                      ? 'bg-indigo-50 dark:bg-indigo-950'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {/* Unread dot */}
                    <div className="mt-1.5 flex h-1.5 w-1.5 flex-none items-center justify-center">
                      {conv.unread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p
                          className={cn(
                            'truncate text-xs font-medium',
                            activeConversationId === conv.id
                              ? 'text-indigo-700 dark:text-indigo-300'
                              : 'text-stone-800 dark:text-stone-200',
                          )}
                        >
                          {conv.title}
                        </p>
                        <span className="flex-none text-[9px] text-stone-400 dark:text-stone-600">
                          {formatRelativeTime(conv.timestamp)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-stone-400 dark:text-stone-600">
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
