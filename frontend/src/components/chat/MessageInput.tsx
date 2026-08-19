import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useChatContext } from '@/components/chat/ChatProvider';
import { cn } from '@/utils/cn';

type MessageInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Ask your productivity coach...',
}: MessageInputProps) {
  const { isOffline, isOpen } = useChatContext();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when chat window opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const activePlaceholder = isOffline 
    ? 'You are offline. Reconnect to message AI...' 
    : placeholder;

  const inputDisabled = disabled || isOffline;

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || inputDisabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, inputDisabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const canSend = value.trim().length > 0 && !inputDisabled;

  return (
    <div className="border-t border-[var(--color-border)] bg-white p-3 dark:bg-[var(--color-surface)]">
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl border bg-white px-3 py-2 transition-all duration-200 shadow-soft',
          'border-[var(--color-border)] focus-within:border-secondary-400 dark:bg-[var(--color-surface)]',
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={activePlaceholder}
          disabled={inputDisabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--color-text-primary)] outline-none',
            'placeholder:text-text-secondary dark:placeholder:text-[var(--color-text-secondary)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'max-h-[120px]',
          )}
          aria-label="Chat message input"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'flex h-7 w-7 flex-none items-center justify-center rounded-xl transition-all duration-200',
            canSend
              ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md'
              : 'bg-primary-50 text-text-secondary opacity-50 dark:bg-primary-950',
          )}
        >
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-text-secondary dark:text-[var(--color-text-secondary)]">
        Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
