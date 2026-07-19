import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatContext } from '@/components/chat/ChatProvider';

const CHAT_WINDOW_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.96,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

export function ChatWindow() {
  const { isOpen, messages, isTyping, sendMessage, quickReplies } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  // Auto-scroll to bottom on new messages or typing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // Hide quick replies once user sends their first message in this conversation
  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === 'user');
    setShowQuickReplies(userMessages.length === 0);
  }, [messages]);

  const handleQuickReply = (prompt: string) => {
    setShowQuickReplies(false);
    sendMessage(prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-window"
          variants={CHAT_WINDOW_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            // Position
            'fixed z-50',
            // Desktop: bottom-right, fixed dimensions
            'bottom-20 right-4 sm:right-6',
            // Mobile: full screen
            'inset-0 sm:inset-auto',
            // Size
            'sm:h-[600px] sm:w-[720px] sm:max-h-[85vh]',
            // Layout
            'flex overflow-hidden',
            // Border & shadow
            'rounded-none border border-stone-200 shadow-2xl sm:rounded-2xl',
            'dark:border-stone-800',
            // Background
            'bg-white dark:bg-stone-950',
          ].join(' ')}
          role="dialog"
          aria-label="MindSprint AI Coach"
          aria-modal="true"
        >
          {/* Sidebar */}
          <Sidebar />

          {/* Main panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <ChatHeader />

            {/* Message feed */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overscroll-contain bg-stone-50 px-3 py-4 dark:bg-stone-950"
            >
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isFirst={idx === 0}
                  />
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom anchor for scroll */}
                <div aria-hidden="true" />
              </div>
            </div>

            {/* Quick replies */}
            <AnimatePresence>
              {showQuickReplies && !isTyping && (
                <motion.div
                  key="quick-replies"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-stone-200 bg-white pt-2 dark:border-stone-800 dark:bg-stone-950"
                >
                  <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <MessageInput onSend={sendMessage} disabled={isTyping} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
