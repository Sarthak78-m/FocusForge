import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Clock3 } from 'lucide-react';
import { StatCard, buttonClassName } from '@/components/common';
import heroImage from '@/assets/study-dashboard-hero.png';
import { paths } from '@/routes/paths';

export function LandingPage() {
  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-blue-300">
            AI Study Coach
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
            Plan focused study days with one calm dashboard.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Track tasks, goals, focus time, streaks, and study analytics from a single workspace built for momentum.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={paths.signup} className={buttonClassName({ size: 'lg' })}>
              Start studying
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to={paths.login} className={buttonClassName({ variant: 'secondary', size: 'lg' })}>
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <img
              src={heroImage}
              alt="Laptop dashboard and study notes on a focused study desk"
              className="aspect-video w-full object-cover"
            />
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              <StatCard label="Tasks" value="12" icon={CheckCircle2} trend="8 completed" />
              <StatCard label="Focus" value="4.5h" icon={Clock3} trend="Today" />
              <StatCard label="Trend" value="+18%" icon={BarChart3} trend="This week" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
