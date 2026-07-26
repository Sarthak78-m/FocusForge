import { motion } from 'framer-motion';
import type { Message } from '@/types/chat';
import { MarkdownContent } from '@/utils/markdown';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/auth.store';

type ChatMessageProps = {
  message: Message;
  isFirst?: boolean;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function ChatMessage({ message, isFirst = false }: ChatMessageProps) {
  const isBot = message.role === 'bot';
  const user = useAuthStore((s) => s.user);
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex items-end gap-2',
        isBot ? 'justify-start' : 'justify-end',
      )}
    >
      {/* Bot avatar */}
      {isBot && (
        <div className="flex h-7 w-7 flex-none items-center justify-center self-start rounded-full bg-indigo-100 text-xs dark:bg-indigo-950">
          <span aria-hidden="true">🤖</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2.5',
          isBot
            ? 'rounded-bl-sm border border-stone-200 bg-white text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'
            : 'rounded-br-sm bg-indigo-600 text-white',
        )}
      >
        {isBot ? (
          <MarkdownContent
            content={message.content}
            className={cn(
              '[&_strong]:text-stone-900 [&_strong]:dark:text-white',
              '[&_code]:bg-stone-100 [&_code]:dark:bg-stone-800',
              '[&_blockquote]:border-indigo-300 [&_blockquote]:dark:border-indigo-700',
            )}
          />
        ) : (
          <p className="text-sm leading-relaxed text-white">{message.content}</p>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            'mt-1 text-right text-[10px] leading-none',
            isBot
              ? 'text-stone-400 dark:text-stone-500'
              : 'text-indigo-200',
          )}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* User avatar */}
      {!isBot && (
        <div className="flex h-7 w-7 flex-none items-center justify-center self-start rounded-full bg-stone-200 text-xs font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
          {userInitials}
        </div>
      )}
    </motion.div>
  );
}
