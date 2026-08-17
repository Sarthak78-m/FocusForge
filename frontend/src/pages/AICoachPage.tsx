import { useState } from 'react';
import { Bot, Send, Sparkles, User, BookOpen, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth.store';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
};

const SUGGESTED_PROMPTS = [
  "Create a 3-day exam review schedule for Calculus II",
  "Explain Neural Networks and Backpropagation in simple terms",
  "Give me 5 memory tricks for learning organic chemistry mechanisms",
  "Help me structure my essay introduction on Artificial Intelligence ethics",
];

export function AICoachPage() {
  const { activePalette } = useTheme();
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
    <div className="space-y-6 font-sans h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-none">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: activePalette.gradient }}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Study Assistant & Tutor
            </h1>
            <p className="text-xs text-slate-500">24/7 Gemini-Powered Personal Tutor</p>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="flex-1 rounded-3xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-white'
                }`}
                style={{ background: msg.sender === 'ai' ? activePalette.gradient : undefined }}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-lg rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="mt-1 block text-[10px] opacity-60 text-right">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
              <span>AI Study Coach is thinking…</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts Bar */}
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto flex items-center gap-2">
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="flex-none rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask your AI Study Coach anything (e.g. explain derivatives, make a study plan)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md transition-transform hover:scale-105"
            style={{ background: activePalette.gradient }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
