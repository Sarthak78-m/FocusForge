import {
  BarChart3,
  Bot,
  Clock3,
  ClipboardList,
  Gem,
  LayoutDashboard,
  Target,
  UserCircle,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import type { NavigationItem } from '@/types/navigation';

export const appNavigation: NavigationItem[] = [
  { label: 'Dashboard', path: paths.dashboard, icon: LayoutDashboard },
  { label: 'Tasks', path: paths.tasks, icon: ClipboardList },
  { label: 'Goals', path: paths.goals, icon: Target },
  { label: 'Pomodoro', path: paths.pomodoro, icon: Clock3 },
  { label: 'Analytics', path: paths.analytics, icon: BarChart3 },
  { label: 'Rewards', path: paths.rewards, icon: Gem },
  { label: 'AI Coach', path: paths.aiCoach, icon: Bot },
  { label: 'Profile', path: paths.profile, icon: UserCircle },
];
