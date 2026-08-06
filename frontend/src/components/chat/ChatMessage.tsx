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
        <div className="flex h-7 w-7 flex-none items-center justify-center self-start rounded-full bg-primary-50 text-xs text-primary-600 shadow-sm dark:bg-primary-950 dark:text-primary-300">
          <span aria-hidden="true">🤖</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2.5 shadow-soft',
          isBot
            ? 'rounded-bl-sm border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] dark:bg-[var(--color-surface)]'
            : 'rounded-br-sm bg-primary-500 text-white',
        )}
      >
        {isBot ? (
          <MarkdownContent
            content={message.content}
            className={cn(
              '[&_strong]:text-[var(--color-text-primary)]',
              '[&_code]:bg-primary-50 [&_code]:text-primary-700 [&_code]:dark:bg-primary-950 [&_code]:dark:text-primary-300',
              '[&_blockquote]:border-primary-300 [&_blockquote]:dark:border-primary-700',
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
              ? 'text-text-secondary dark:text-[var(--color-text-secondary)]'
              : 'text-primary-100',
          )}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* User avatar */}
      {!isBot && (
        <div className="flex h-7 w-7 flex-none items-center justify-center self-start rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          {userInitials}
        </div>
      )}
    </motion.div>
  );
}
