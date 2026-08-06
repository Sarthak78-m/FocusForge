import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, BarChart3, Timer } from 'lucide-react';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md dark:bg-[var(--color-surface)]/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 shadow-sm">
            <Timer className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={paths.login}
            className="rounded-xl px-3.5 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)]"
          >
            Log in
          </Link>
          <Link
            to={paths.signup}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-md active:scale-95"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

const features = [
  {
    icon: CheckCircle2,
    title: 'Task management',
    body: 'Create, prioritize, and filter tasks by status, priority, and deadline. Complete them one by one with a single click.',
  },
  {
    icon: Clock3,
    title: 'Pomodoro timer',
    body: 'Work in focused 25-minute sprints with 5-minute breaks. Long breaks every 4 sessions to keep you sharp.',
  },
  {
    icon: BarChart3,
    title: 'Progress tracking',
    body: "Your dashboard surfaces today's task summary and quick-access to your workspace at all times.",
  },
];

function FeatureCard({ icon: Icon, title, body }: (typeof features)[0]) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated dark:bg-[var(--color-surface)] dark:border-[var(--color-border)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-950 dark:text-primary-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary dark:text-[var(--color-text-secondary)]">{body}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <NavBar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-36 sm:px-6 sm:pt-40">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 dark:border-primary-900 dark:bg-primary-950">
            <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
              Your focused study workspace
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Study smarter,
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              not longer.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-secondary dark:text-[var(--color-text-secondary)]">
            MindSprint keeps your tasks, focus timer, and daily progress in one clean
            workspace — so you can stop managing and start learning.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={paths.signup}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-md"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={paths.login}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:bg-primary-50 dark:bg-[var(--color-surface)] dark:hover:bg-primary-950"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[var(--color-border)]">
          {[
            { value: '25 min', label: 'Focus sessions' },
            { value: '3 modes', label: 'Work, short & long break' },
            { value: '∞', label: 'Tasks to track' },
          ].map((s) => (
            <div key={s.label} className="py-8 text-center">
              <p className="text-xl font-semibold text-[var(--color-text-primary)]">{s.value}</p>
              <p className="mt-1 text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Everything you need
          </h2>
          <p className="mt-2 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
            Built for students who want to get things done
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Ready to focus?
          </h2>
          <p className="mt-2 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
            Create your account and start your first Pomodoro session today.
          </p>
          <Link
            to={paths.signup}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-md"
          >
            Get started — it's free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500">
              <Timer className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-primary)]">MindSprint</span>
          </div>
          <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} MindSprint
          </p>
        </div>
      </footer>
    </div>
  );
}
