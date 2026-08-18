import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Check,
  Trash2,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to={paths.landing} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white font-bold text-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">
            FocusForge
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to={paths.login}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
          >
            Log in
          </Link>
          <Link
            to={paths.signup}
            className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-xs"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   LIVE INTERACTIVE WORKSPACE DEMO
   ══════════════════════════════════════════════════════════ */
function InteractiveWorkspaceDemo() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'timer' | 'notes'>('tasks');

  // Tasks Demo State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Plan weekly study schedule', done: true, priority: 'P1' },
    { id: 2, text: 'Review chapter notes & practice problems', done: false, priority: 'P2' },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTaskInput.trim(), done: false, priority: 'P1' },
    ]);
    setNewTaskInput('');
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Timer Demo State
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25:00
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Note Demo State
  const [noteContent, setNoteContent] = useState(
    `# Study Notes Example\n\n- Write structured notes using markdown.\n- Link concepts together and organize by subjects.\n\n*Review weekly to maintain long-term memory.*`
  );

  return (
    <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-elevated overflow-hidden">
      {/* Demo Tab Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-container)] px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors',
              activeTab === 'tasks'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors',
              activeTab === 'timer'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
            )}
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Focus Timer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors',
              activeTab === 'notes'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Notes</span>
          </button>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] hidden sm:inline">
          Interactive Live Preview
        </span>
      </div>

      {/* Demo Body Content */}
      <div className="p-4 sm:p-6 min-h-[280px] flex flex-col justify-between">
        {/* Tab 1: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Type a task and press Enter..."
                className="flex-1 h-8 pl-3 pr-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-strong)]"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </form>

            <div className="space-y-1.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center justify-between p-2.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        'h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors',
                        task.done
                          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                          : 'border-[#999999] hover:border-[var(--color-text-primary)]'
                      )}
                    >
                      {task.done && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span
                      className={cn(
                        'text-xs font-medium text-[var(--color-text-primary)] truncate',
                        task.done && 'line-through text-[var(--color-text-tertiary)]'
                      )}
                    >
                      {task.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--color-text-tertiary)] hover:text-rose-500 transition-all p-1"
                    title="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Focus Timer */}
        {activeTab === 'timer' && (
          <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
            <div className="font-mono text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {formatTime(timerSeconds)}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isTimerRunning ? 'Focus session in progress' : '25-minute focus session'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning((r) => !r)}
                className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(1500);
                }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Markdown Notes */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)]">
                Markdown Editor
              </span>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full h-36 p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-border-strong)] resize-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)]">
                Formatted Preview
              </span>
              <div className="h-36 p-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] overflow-y-auto space-y-1.5">
                <p className="font-bold text-sm">Study Notes Example</p>
                <ul className="list-disc pl-4 space-y-0.5 text-xs text-[var(--color-text-secondary)]">
                  <li>Write structured notes using markdown.</li>
                  <li>Link concepts together and organize by subjects.</li>
                </ul>
                <p className="italic text-[11px] text-[var(--color-text-tertiary)]">Review weekly to maintain long-term memory.</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Playground Footer status */}
        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-2xs text-[var(--color-text-tertiary)]">
          <span>Try clicking the tabs, ticking tasks, or running the timer above.</span>
          <span>Offline sync ready</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INTERACTIVE FAQ ACCORDION
   ══════════════════════════════════════════════════════════ */
const FAQS = [
  {
    q: 'What is FocusForge?',
    a: 'FocusForge is a lightweight, distraction-free study workspace that brings your daily study tasks, Pomodoro sprint timer, and connected Markdown notes together in one clean interface.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. All your study notes and tasks automatically sync with local browser IndexedDB cache and sync with the Spring Boot backend whenever you are online.',
  },
  {
    q: 'Is there any complex setup needed?',
    a: 'None. Sign up with an email or jump straight in. Everything is ready immediately with no endless configurations or confusing menus.',
  },
  {
    q: 'Can I export my notes and tasks?',
    a: 'Yes. Your notes are stored in standard Markdown format so you can export, copy, and back them up anytime.',
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={faq.q}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-[var(--color-text-secondary)] transition-transform duration-200',
                  isOpen && 'transform rotate-180'
                )}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ══════════════════════════════════════════════════════════ */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <NavBar />

      <main className="pt-24 pb-20 px-4 sm:px-6">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl text-center space-y-5 pt-8 pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>✦</span>
            <span>Distraction-Free Study System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] max-w-2xl mx-auto leading-tight">
            Organize your study flow. Master your focus.
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
            A simple, fast workspace combining daily study tasks, Pomodoro sprint timers, and connected Markdown notes. Zero clutter, no filler.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={paths.signup}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>Get started for free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={paths.login}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              <span>Log in to workspace</span>
            </Link>
          </div>
        </section>

        {/* Live Interactive Workspace Demo Section */}
        <section className="mx-auto max-w-4xl py-6">
          <InteractiveWorkspaceDemo />
        </section>

        {/* Core Pillars / Features Section */}
        <section className="mx-auto max-w-4xl py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Designed for real daily study
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
              Everything you need to plan, focus, and review without getting lost in complicated settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-primary)]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Quick Task Capture</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Add and prioritize study tasks with P1–P3 flags, due dates, and subject tags in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-primary)]">
                <Timer className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Pomodoro Interval Timer</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Stay in flow with structured 25-minute focus intervals and clean break reminders.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-primary)]">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Markdown Notebook</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Write clean notes with full Markdown syntax, tags, and interactive knowledge graph linking.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-3xl py-12 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Clear answers to common questions about FocusForge.
            </p>
          </div>
          <FAQSection />
        </section>

        {/* Bottom CTA Banner */}
        <section className="mx-auto max-w-4xl pt-8 pb-12">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-container)] p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Ready to focus on your studies?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
              Create your account in seconds. Free forever for students.
            </p>
            <div className="pt-2">
              <Link
                to={paths.signup}
                className="inline-flex items-center gap-1.5 h-10 px-6 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Get started free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-4 text-center text-xs text-[var(--color-text-tertiary)]">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--color-primary)] text-white font-bold text-[10px]">
              ✓
            </div>
            <span className="font-semibold text-[var(--color-text-primary)]">FocusForge</span>
            <span>— Simple Study Workspace</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
            <Link to={paths.login} className="hover:text-[var(--color-text-primary)]">Log in</Link>
            <Link to={paths.signup} className="hover:text-[var(--color-text-primary)]">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
