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
const VerifyEmailPage = lazy(() =>
  import('@/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
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

// Newly implemented pages
const GoalsPage = lazy(() =>
  import('@/pages/GoalsPage').then((m) => ({ default: m.GoalsPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const RewardsPage = lazy(() =>
  import('@/pages/RewardsPage').then((m) => ({ default: m.RewardsPage })),
);
const AICoachPage = lazy(() =>
  import('@/pages/AICoachPage').then((m) => ({ default: m.AICoachPage })),
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
      { path: paths.verifyEmail, element: <VerifyEmailPage /> },
      { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
      { path: paths.resetPassword, element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: paths.dashboard, element: <DashboardPage /> },
      { path: paths.tasks, element: <TasksPage /> },
      { path: paths.pomodoro, element: <PomodoroPage /> },
      { path: paths.profile, element: <ProfilePage /> },
      { path: paths.goals, element: <GoalsPage /> },
      { path: paths.rewards, element: <RewardsPage /> },
      { path: paths.analytics, element: <AnalyticsPage /> },
      { path: paths.aiCoach, element: <AICoachPage /> },
      { path: '/app/*', element: <Navigate to={paths.dashboard} replace /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
