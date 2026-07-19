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
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-600">
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
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
          >
            {reply.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
