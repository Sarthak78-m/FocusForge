import { motion } from 'framer-motion';
import type { QuickReply } from '@/types/chat';

type QuickRepliesProps = {
  replies: QuickReply[];
  onSelect: (prompt: string) => void;
};

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className="px-3 pb-2">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-secondary dark:text-[var(--color-text-secondary)]">
        Suggested
      </p>
      <div className="flex flex-wrap gap-1.5">
        {replies.map((reply, idx) => (
          <motion.button
            key={reply.id}
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
            onClick={() => onSelect(reply.prompt)}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:bg-[var(--color-surface)] dark:hover:border-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300"
          >
            {reply.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
