import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  BarChart3,
  Timer,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Check,
  Zap,
  MessageSquare,
  Flame,
  Bot,
  Layers,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { paths } from '@/routes/paths';
import { useTheme, ACCENT_PALETTES } from '@/hooks/useTheme';
import { type ThemeAccent } from '@/store/theme.store';
import { ThemeCustomizer } from '@/components/common/ThemeCustomizer';

function NavBar() {
  const { activePalette } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to={paths.landing} className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: activePalette.gradient }}
          >
            <Timer className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            FocusForge
          </span>
        </Link>

        {/* Center: Live Accent Color Selector */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/70 p-1 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
          <span className="px-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Accent Theme:
          </span>
          <ThemeCustomizer />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={paths.login}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            to={paths.signup}
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            style={{
              background: activePalette.gradient,
              boxShadow: `0 4px 14px ${activePalette.glow}`,
            }}
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   INTERACTIVE LIVE WORKSPACE PREVIEW DEMO (Inspired by Paymo & ClickUp)
   ══════════════════════════════════════════════════════════ */
function InteractiveWorkspaceDemo() {
  const { activePalette, accent, setAccent } = useTheme();
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'ai'>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25:00
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Operating Systems Chapter 4', done: true, tag: 'High' },
    { id: 2, text: 'Solve 5 LeetCode Algorithm Problems', done: false, tag: 'Medium' },
    { id: 3, text: 'Draft Machine Learning Lab Report', done: false, tag: 'High' },
  ]);
  const [aiMessage, setAiMessage] = useState('How can I optimize your study schedule today?');

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative mx-auto mt-12 w-full max-w-4xl rounded-3xl border border-slate-200/90 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/90">
      {/* Outer ambient glow based on current accent */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-3xl opacity-30 blur-2xl transition-all duration-500"
        style={{ background: activePalette.gradient }}
      />

      {/* Demo Header Bar */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Interactive Workspace Preview
          </span>
        </div>

        {/* Live Color Accent Swatches Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Try Live Themes:
          </span>
          <div className="flex gap-1.5">
            {(Object.keys(ACCENT_PALETTES) as ThemeAccent[]).map((key) => {
              const p = ACCENT_PALETTES[key];
              const active = accent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccent(key)}
                  className={`h-5 w-5 rounded-full transition-all duration-200 ${
                    active ? 'scale-125 ring-2 ring-slate-400 dark:ring-white' : 'hover:scale-110'
                  }`}
                  style={{ background: p.gradient }}
                  title={p.label}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Module Tabs */}
      <div className="relative mt-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-1.5 dark:border-slate-800 dark:bg-slate-950">
        {[
          { id: 'timer', label: 'Pomodoro Focus', icon: Clock3 },
          { id: 'tasks', label: 'Kanban Tasks', icon: CheckCircle2 },
          { id: 'ai', label: 'AI Study Assistant', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="demo-tab-active"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-slate-800"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Demo Tab Content */}
      <div className="relative mt-5 min-h-[220px] rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-950/50">
        <AnimatePresence mode="wait">
          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center gap-4 text-center"
            >
              <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: activePalette.gradient }}>
                <Flame className="h-3.5 w-3.5" />
                Focus Mode Active
              </div>
              <p className="font-mono text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatTimer(seconds)}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
                  style={{ background: activePalette.gradient }}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? 'Pause Session' : 'Start Focus'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSeconds(1500); setIsRunning(false); }}
                  className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Today's High-Priority Tasks
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {tasks.filter((t) => t.done).length} / {tasks.length} Completed
                </span>
              </div>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-[var(--color-primary)] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-all ${
                        task.done
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      {task.done && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <span
                      className={`text-xs font-medium transition-all ${
                        task.done
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    {task.tag}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: activePalette.gradient }}>
                  <Bot className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">FocusForge AI Coach</p>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{aiMessage}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Summarize machine learning concepts',
                  'Generate a 30-minute exam review plan',
                  'Suggest break strategies for focus',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setAiMessage(`Here is your custom plan for "${prompt}": Stay focused with 25m sprints and active recall!`)}
                    className="rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    ✨ {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export function LandingPage() {
  const { activePalette } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        {/* Animated Background Mesh Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-25 blur-3xl transition-all duration-700"
          style={{ background: activePalette.gradient }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Notion & Paymo Inspired Study Suite
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-tight dark:text-white">
            Study smarter,{' '}
            <span
              className="bg-clip-text text-transparent transition-all duration-500"
              style={{ backgroundImage: activePalette.gradient }}
            >
              not longer.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            FocusForge merges task management, Pomodoro focus sprints, and AI coaching into one
            vibrant, customizable workspace — built for student success.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={paths.signup}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 sm:w-auto"
              style={{
                background: activePalette.gradient,
                boxShadow: `0 8px 25px ${activePalette.glow}`,
              }}
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={paths.login}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-8 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              Open Workspace Dashboard
            </Link>
          </div>

          {/* Interactive Live Workspace Preview */}
          <InteractiveWorkspaceDemo />
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-slate-200/80 bg-white py-24 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Everything You Need to Excel
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Designed for high-performing students who want clarity and momentum.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Layers,
                title: 'Structured Task Board',
                desc: 'Organize study goals by priority, status, and deadlines with Notion-inspired clarity.',
              },
              {
                icon: Timer,
                title: 'Pomodoro Focus Cycles',
                desc: 'Paymo-style focus sprints with custom work and break durations to build daily momentum.',
              },
              {
                icon: Bot,
                title: '24/7 AI Study Assistant',
                desc: 'Get instant study breakdowns, problem explanations, and personalized revision schedules.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50"
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: activePalette.gradient }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-slate-50 py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ background: activePalette.gradient }}
            >
              <Timer className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">FocusForge</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} FocusForge. Built for students worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
