import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useChatContext } from '@/components/chat/ChatProvider';
import { cn } from '@/utils/cn';

export function FloatingButton() {
  const { isOpen, toggleChat, conversations } = useChatContext();

  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <motion.button
      type="button"
      onClick={toggleChat}
      title="Ask MindSprint Coach (Ctrl+K)"
      aria-label={isOpen ? 'Close AI coach' : 'Open AI coach'}
      aria-expanded={isOpen}
      initial={false}
      animate={{ scale: isOpen ? 0.92 : 1 }}
      whileHover={{ scale: isOpen ? 0.95 : 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'fixed bottom-4 right-4 z-50 sm:right-6',
        'flex h-14 w-14 items-center justify-center',
        'rounded-full shadow-lg transition-colors',
        isOpen
          ? 'bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700'
          : 'bg-indigo-600 text-white hover:bg-indigo-700',
      )}
    >
      {/* Pulse ring — only when closed */}
      {!isOpen && (
        <span
          className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <motion.div
        key={isOpen ? 'close' : 'open'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </motion.div>

      {/* Unread badge */}
      {!isOpen && unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
          aria-label={`${unreadCount} unread conversations`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </motion.button>
  );
}
