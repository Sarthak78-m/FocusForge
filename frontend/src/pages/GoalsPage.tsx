import { useState } from 'react';
import { Target, Plus, CheckCircle2, Trophy, Calendar, Sparkles, Flag, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

type Goal = {
  id: string;
  title: string;
  category: 'Exam Prep' | 'Skill Mastery' | 'Daily Habit' | 'Project Milestone';
  targetDate: string;
  progress: number;
  totalUnits: number;
  currentUnits: number;
  unitName: string;
  status: 'active' | 'completed';
};

const INITIAL_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Master Machine Learning Algorithms',
    category: 'Skill Mastery',
    targetDate: '2026-09-30',
    progress: 65,
    totalUnits: 40,
    currentUnits: 26,
    unitName: 'Study Hours',
    status: 'active',
  },
  {
    id: '2',
    title: 'Ace Midterm Computer Architecture Exam',
    category: 'Exam Prep',
    targetDate: '2026-08-25',
    progress: 80,
    totalUnits: 15,
    currentUnits: 12,
    unitName: 'Modules',
    status: 'active',
  },
  {
    id: '3',
    title: '30-Day Consecutive Pomodoro Sprint Challenge',
    category: 'Daily Habit',
    targetDate: '2026-08-31',
    progress: 45,
    totalUnits: 30,
    currentUnits: 14,
    unitName: 'Days',
    status: 'active',
  },
];

export function GoalsPage() {
  const { activePalette } = useTheme();
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Goal['category']>('Exam Prep');
  const [newTargetUnits, setNewTargetUnits] = useState('20');
  const [newUnitName, setNewUnitName] = useState('Hours');

  const filteredGoals = goals.filter((g) => filterCategory === 'All' || g.category === filterCategory);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      progress: 0,
      totalUnits: parseInt(newTargetUnits, 10) || 10,
      currentUnits: 0,
      unitName: newUnitName,
      status: 'active',
    };

    setGoals([newGoal, ...goals]);
    setNewTitle('');
    setIsModalOpen(false);
  };

  const incrementProgress = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nextUnits = Math.min(g.totalUnits, g.currentUnits + 1);
        const nextProgress = Math.round((nextUnits / g.totalUnits) * 100);
        return {
          ...g,
          currentUnits: nextUnits,
          progress: nextProgress,
          status: nextProgress >= 100 ? 'completed' : 'active',
        };
      })
    );
  };

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Study Goals & Milestones
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Trophy className="mr-1 inline h-3.5 w-3.5" />
              Goal Tracker
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Set ambitious targets, track milestone progress, and achieve academic success
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
          style={{ background: activePalette.gradient }}
        >
          <Plus className="h-4 w-4" />
          Create New Goal
        </button>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Exam Prep', 'Skill Mastery', 'Daily Habit', 'Project Milestone'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterCategory === cat
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {goal.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Due {goal.targetDate}</span>
                </div>
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                {goal.title}
              </h2>

              {/* Progress Ring / Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">
                    {goal.currentUnits} / {goal.totalUnits} {goal.unitName}
                  </span>
                  <span className="text-[var(--color-primary)]">{goal.progress}%</span>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${goal.progress}%`,
                      background: activePalette.gradient,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">
                {goal.progress >= 100 ? '🎉 Goal Achieved!' : 'In Progress'}
              </span>

              <button
                type="button"
                onClick={() => incrementProgress(goal.id)}
                disabled={goal.progress >= 100}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Log Progress
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Goal
            </h2>
            <p className="mt-1 text-xs text-slate-500">Define your target and track your achievements</p>

            <form onSubmit={handleCreateGoal} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Calculus & Derivatives"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Goal['category'])}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Exam Prep">Exam Prep</option>
                  <option value="Skill Mastery">Skill Mastery</option>
                  <option value="Daily Habit">Daily Habit</option>
                  <option value="Project Milestone">Project Milestone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    value={newTargetUnits}
                    onChange={(e) => setNewTargetUnits(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 text-xs font-bold text-white shadow-md"
                  style={{ background: activePalette.gradient }}
                >
                  Create Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
