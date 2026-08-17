import { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
};

const SUGGESTED_PROMPTS = [
  "Create a 3-day exam review schedule for Organic Chemistry",
  "Explain Neural Networks and Backpropagation in simple terms",
  "Give me 5 active recall memory techniques for exam prep",
  "Help me structure my research essay introduction",
];

export function AICoachPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your FocusForge AI Study Coach. How can I help you accelerate your learning today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "That's a great study topic! Break it down into 25-minute Pomodoro sprints. Would you like me to generate a personalized task checklist or flashcard review set for this subject?";

      if (query.toLowerCase().includes('schedule') || query.toLowerCase().includes('plan')) {
        responseText = "Here is your suggested 3-Day Focus Sprint Schedule:\n\n• **Day 1**: Core concepts breakdown & formula sheets (2 hours)\n• **Day 2**: Active recall practice questions & weak area drills (2.5 hours)\n• **Day 3**: Full mock exam simulation under timed conditions (2 hours)\n\nWould you like me to automatically add these tasks to your FocusForge Task Studio?";
      } else if (query.toLowerCase().includes('explain') || query.toLowerCase().includes('simple')) {
        responseText = "Here is a simple analogy:\n\nThink of a **Neural Network** like a team of decision-makers. Each layer passes hints to the next. **Backpropagation** is the feedback loop — when the final answer is wrong, the team works backward to refine everyone's voting weight until accuracy improves!";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 font-sans h-[calc(100vh-120px)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-none pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              FocusForge AI Coach
            </h1>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Personalized 24/7 Academic Study Assistant
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-border-strong)]">
          <Sparkles className="h-3.5 w-3.5" />
          GPT-4o Study Engine
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 flex-none">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="rounded-full border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] shadow-xs transition-all hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] dark:bg-slate-900"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xs dark:bg-slate-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3 max-w-2xl', msg.sender === 'user' ? 'ml-auto flex-row-reverse' : '')}
          >
            <div
              className={cn(
                'flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold text-white shadow-xs',
                msg.sender === 'user' ? 'bg-slate-800' : 'bg-[var(--color-primary)]',
              )}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={cn(
                'rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-xs',
                msg.sender === 'user'
                  ? 'bg-[var(--color-primary)] text-white rounded-tr-none'
                  : 'bg-slate-50 text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-none dark:bg-slate-800',
              )}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className="mt-1.5 block text-[10px] opacity-70 text-right">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-slate-50 border border-[var(--color-border)] p-3 text-xs font-semibold text-[var(--color-text-secondary)] animate-pulse dark:bg-slate-800">
              AI Coach is thinking…
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 flex-none"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI Study Coach anything (e.g. Explain quantum mechanics, schedule my week)..."
          className="h-11 flex-1 rounded-full border border-[var(--color-border)] bg-white px-5 text-xs font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] shadow-xs focus:border-[var(--color-primary)] focus:outline-none dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex h-11 px-6 flex-none items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
