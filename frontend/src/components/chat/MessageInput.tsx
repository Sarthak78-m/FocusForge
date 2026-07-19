import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Paperclip } from 'lucide-react';
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
  placeholder = 'Ask your study coach...',
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
    <div className="border-t border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl border bg-stone-50 px-3 py-2 transition-colors',
          'border-stone-200 focus-within:border-indigo-400 dark:border-stone-700 dark:bg-stone-900',
          'dark:focus-within:border-indigo-600',
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
            'flex-1 resize-none bg-transparent text-sm leading-relaxed text-stone-900 outline-none',
            'placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-600',
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
            'flex h-7 w-7 flex-none items-center justify-center rounded-lg transition-all',
            canSend
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-stone-200 text-stone-400 dark:bg-stone-700 dark:text-stone-600',
          )}
        >
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-stone-400 dark:text-stone-600">
        Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
