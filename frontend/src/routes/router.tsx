import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { BarChart3, Bot, Gem, Target } from 'lucide-react';
import { ProtectedLayout } from '@/layouts/ProtectedLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { ModuleShellPage } from '@/pages/ModuleShellPage';
import { paths } from '@/routes/paths';

// Public pages
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
);

// Protected pages — fully implemented
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TasksPage = lazy(() =>
  import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })),
);
const PomodoroPage = lazy(() =>
  import('@/pages/PomodoroPage').then((m) => ({ default: m.PomodoroPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);

// 404
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: paths.landing, element: <LandingPage /> },
      { path: paths.login, element: <LoginPage /> },
      { path: paths.signup, element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: paths.dashboard, element: <DashboardPage /> },
      { path: paths.tasks, element: <TasksPage /> },
      { path: paths.pomodoro, element: <PomodoroPage /> },
      { path: paths.profile, element: <ProfilePage /> },

      // Coming soon — no backend yet
      {
        path: paths.goals,
        element: (
          <ModuleShellPage
            title="Goals"
            description="Goal tracking is coming soon."
            icon={Target}
          />
        ),
      },
      {
        path: paths.rewards,
        element: (
          <ModuleShellPage
            title="Rewards"
            description="Rewards & streaks are coming soon."
            icon={Gem}
          />
        ),
      },
      {
        path: paths.analytics,
        element: (
          <ModuleShellPage
            title="Analytics"
            description="Study analytics are coming soon."
            icon={BarChart3}
          />
        ),
      },
      {
        path: paths.aiCoach,
        element: (
          <ModuleShellPage
            title="AI Coach"
            description="AI coaching is coming soon."
            icon={Bot}
          />
        ),
      },
      { path: '/app/*', element: <Navigate to={paths.dashboard} replace /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
