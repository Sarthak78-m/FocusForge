import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Timer,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Check,
  Flame,
  Bot,
  Layers,
  Hash,
  Flag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { paths } from '@/routes/paths';

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-xl dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to={paths.landing} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-xs">
            <Timer className="h-5 w-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[var(--color-text-primary)]">
            FocusForge
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={paths.login}
            className="rounded-full px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] transition-all hover:bg-slate-100 hover:text-[var(--color-text-primary)] dark:hover:bg-slate-800"
          >
            Log in
          </Link>
          <Link
            to={paths.signup}
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] active:scale-95"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   INTERACTIVE STITCH WORKSPACE PREVIEW DEMO
   ══════════════════════════════════════════════════════════ */
function InteractiveWorkspaceDemo() {
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'ai'>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25:00
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Reading Chapter 4 — Organic Chemistry', done: true, tag: 'ExamPrep', priority: 'P1' },
    { id: 2, text: 'Solve 5 LeetCode Algorithm Problems', done: false, tag: 'WebsiteUpdate', priority: 'P2' },
    { id: 3, text: 'Draft Machine Learning Lab Report', done: false, tag: 'Fitness', priority: 'P1' },
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
    <div className="relative mx-auto mt-12 w-full max-w-4xl rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-900">
      {/* Demo Header Bar */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-bold text-[var(--color-text-tertiary)]">
            Interactive Workspace Preview
          </span>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-[11px] font-bold text-[var(--color-primary)] border border-[var(--color-border-strong)]">
          Focus Mode Active
        </span>
      </div>

      {/* Interactive Module Tabs */}
      <div className="relative mt-4 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-slate-50 p-1.5 dark:bg-slate-950">
        {[
          { id: 'timer', label: 'Pomodoro Focus', icon: Clock3 },
          { id: 'tasks', label: 'Todoist Tasks', icon: CheckCircle2 },
          { id: 'ai', label: 'AI Study Assistant', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Demo Tab Content */}
      <div className="relative mt-5 min-h-[220px] rounded-xl border border-[var(--color-border)] bg-slate-50/60 p-6 dark:bg-slate-950/60">
        <AnimatePresence mode="wait">
          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center gap-4 text-center"
            >
              <div className="flex items-center gap-2 rounded-full bg-[var(--color-surface-container)] px-3.5 py-1 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-border-strong)]">
                <Flame className="h-3.5 w-3.5 fill-[var(--color-primary)] text-[var(--color-primary)]" />
                Session 1 of 4
              </div>
              <p className="font-mono text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {formatTimer(seconds)}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105"
                >
                  {isRunning ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                  {isRunning ? 'Pause Session' : 'Start Focus'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSeconds(1500); setIsRunning(false); }}
                  className="rounded-full border border-[var(--color-border)] bg-white p-2.5 text-[var(--color-text-secondary)] shadow-xs transition-all hover:bg-slate-100 dark:bg-slate-900"
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
                <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
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
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-3.5 shadow-xs transition-all hover:border-[var(--color-primary)] dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        task.done
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-[var(--color-border-strong)] bg-white dark:bg-slate-900'
                      }`}
                    >
                      {task.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs font-semibold transition-all ${
                        task.done
                          ? 'line-through text-[var(--color-text-tertiary)]'
                          : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                      <Flag className="h-2.5 w-2.5 fill-rose-600" />
                      {task.priority}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-container)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                      <Hash className="h-2.5 w-2.5" />
                      {task.tag}
                    </span>
                  </div>
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
              <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-xs dark:bg-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">FocusForge AI Coach</p>
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{aiMessage}</p>
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
                    className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--color-text-secondary)] shadow-xs transition-all hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] dark:bg-slate-900"
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
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-text-primary)] antialiased">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 shadow-xs dark:bg-slate-900">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Stitch & Todoist Inspired Focus Suite
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-6xl sm:leading-tight">
            Study smarter,{' '}
            <span className="text-[var(--color-primary)]">
              not longer.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            FocusForge merges task management, Pomodoro focus sprints, and AI coaching into one
            vibrant, customizable workspace — built for student success.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={paths.signup}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105 sm:w-auto"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={paths.login}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-8 py-3.5 text-xs font-bold text-[var(--color-text-primary)] shadow-xs transition-all hover:bg-slate-100 sm:w-auto dark:bg-slate-900"
            >
              Open Workspace Dashboard
            </Link>
          </div>

          {/* Interactive Live Workspace Preview */}
          <InteractiveWorkspaceDemo />
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-[var(--color-border)] bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Everything You Need to Excel
            </h2>
            <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
              Designed for high-performing students who want cognitive clarity and momentum.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Layers,
                title: 'Structured Task Board',
                desc: 'Organize study goals with circular checkboxes, priority flags P1-P3, and project hashtags.',
              },
              {
                icon: Timer,
                title: 'Pomodoro Focus Cycles',
                desc: 'Stitch-style focus sprints with custom work and break durations to build daily momentum.',
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
                  className="rounded-2xl border border-[var(--color-border)] bg-slate-50/70 p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-slate-950/70"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)] py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
              <Timer className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[var(--color-text-primary)]">FocusForge</span>
          </div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} FocusForge Pro. Built for students worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
