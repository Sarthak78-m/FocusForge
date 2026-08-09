import {
  BarChart3,
  Bot,
  CheckSquare,
  Gem,
  LayoutDashboard,
  Target,
  Timer,
  User,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import type { NavigationItem } from '@/types/navigation';

/**
 * Primary nav — shown in the top bar (desktop pills + mobile bottom tabs).
 * Keep this list to 4 items so the bottom tab bar never overflows.
 */
export const appNavigation: NavigationItem[] = [
  { label: 'Dashboard', path: paths.dashboard, icon: LayoutDashboard },
  { label: 'Tasks',     path: paths.tasks,      icon: CheckSquare },
  { label: 'Pomodoro',  path: paths.pomodoro,   icon: Timer },
  { label: 'Profile',   path: paths.profile,    icon: User },
];

/**
 * Secondary nav — available for future overflow menus, settings panels, etc.
 */
export const secondaryNavigation: NavigationItem[] = [
  { label: 'Goals',     path: paths.goals,      icon: Target },
  { label: 'Analytics', path: paths.analytics,  icon: BarChart3 },
  { label: 'Rewards',   path: paths.rewards,    icon: Gem },
  { label: 'AI Coach',  path: paths.aiCoach,    icon: Bot },
];
