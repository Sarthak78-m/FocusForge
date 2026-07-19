import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, BarChart3, Timer } from 'lucide-react';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur dark:border-stone-800/80 dark:bg-stone-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Timer className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-900 dark:text-white">MindSprint</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={paths.login}
            className="rounded-lg px-3.5 py-2 text-sm text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            to={paths.signup}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
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
    body: 'Your dashboard surfaces today\'s task summary and quick-access to your workspace at all times.',
  },
];

function FeatureCard({ icon: Icon, title, body }: (typeof features)[0]) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
        <Icon className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
      </div>
      <p className="text-sm font-semibold text-stone-900 dark:text-white">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{body}</p>
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
      <span className="text-2xl font-semibold text-stone-900 dark:text-white">{value}</span>
      <span className="mt-1 text-xs text-stone-500 dark:text-stone-400">{label}</span>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <NavBar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-36 sm:px-6 sm:pt-40">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 dark:border-indigo-900 dark:bg-indigo-950">
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              Your focused study workspace
            </span>
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-stone-950 dark:text-white sm:text-5xl">
            Study smarter,
            <br />
            not longer.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-stone-500 dark:text-stone-400">
            MindSprint keeps your tasks, focus timer, and daily progress in one clean
            workspace — so you can stop managing and start learning.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={paths.signup}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={paths.login}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-600"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800">
          {[
            { value: '25 min', label: 'Focus sessions' },
            { value: '3 modes', label: 'Work, short & long break' },
            { value: '∞', label: 'Tasks to track' },
          ].map((s) => (
            <div key={s.label} className="py-8 text-center">
              <p className="text-xl font-semibold text-stone-900 dark:text-white">{s.value}</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-white">
            Everything you need
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
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
      <section className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-white">
            Ready to focus?
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Create your account and start your first Pomodoro session today.
          </p>
          <Link
            to={paths.signup}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Get started — it's free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
              <Timer className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">MindSprint</span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-600">
            © {new Date().getFullYear()} MindSprint
          </p>
        </div>
      </footer>
    </div>
  );
}
