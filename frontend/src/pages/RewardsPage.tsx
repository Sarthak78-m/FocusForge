import { useState } from 'react';
import { Gem, Flame, Award, Shield, Sparkles, CheckCircle2, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  xp: number;
};

const BADGES: Badge[] = [
  {
    id: '1',
    title: 'First Sprint Champion',
    description: 'Complete your first 25-minute Pomodoro focus session',
    icon: '⚡',
    unlocked: true,
    xp: 50,
  },
  {
    id: '2',
    title: '7-Day Streak Warrior',
    description: 'Maintain a 7-day active daily study streak',
    icon: '🔥',
    unlocked: true,
    xp: 200,
  },
  {
    id: '3',
    title: 'Night Owl Focus',
    description: 'Complete 3 focus sessions past 10 PM',
    icon: '🦉',
    unlocked: true,
    xp: 150,
  },
  {
    id: '4',
    title: 'Pomodoro Titan',
    description: 'Accumulate 50 total Pomodoro focus sprints',
    icon: '🏆',
    unlocked: false,
    xp: 500,
  },
  {
    id: '5',
    title: 'Task Crusher',
    description: 'Complete 25 study tasks in a single week',
    icon: '🎯',
    unlocked: false,
    xp: 300,
  },
  {
    id: '6',
    title: 'Deep Work Master',
    description: 'Log 4 hours of uninterrupted study in one day',
    icon: '🧠',
    unlocked: false,
    xp: 400,
  },
];

export function RewardsPage() {
  const { activePalette } = useTheme();
  const [xp, setXp] = useState(1450);
  const currentLevel = Math.floor(xp / 500) + 1;
  const nextLevelXp = currentLevel * 500;
  const levelProgress = Math.round(((xp % 500) / 500) * 100);

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Study Rewards & Streaks
            </h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Gem className="mr-1 inline h-3.5 w-3.5" />
              Focus Keeper Badges
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Earn XP, unlock milestone badges, and level up your study consistency
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
          7-Day Active Streak 🔥
        </div>
      </div>

      {/* Level Banner Card */}
      <div
        className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
        style={{ background: activePalette.gradient }}
      >
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md">
              👑
            </div>
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                Level {currentLevel} Scholar
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                {xp} Total MindSprint XP
              </h2>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-xs font-bold text-white/90">
              <span>Progress to Level {currentLevel + 1}</span>
              <span>{xp % 500} / 500 XP</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Badges Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Milestone Badges ({BADGES.filter((b) => b.unlocked).length} / {BADGES.length} Unlocked)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-5 shadow-sm transition-all ${
                badge.unlocked
                  ? 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-slate-800/60 dark:bg-slate-950/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{badge.icon}</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  +{badge.xp} XP
                </span>
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                {badge.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{badge.description}</p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500">
                  {badge.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </span>
                {badge.unlocked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
