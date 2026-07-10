import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { BarChart3, Bot, Clock3, ClipboardList, Gem, Target, UserCircle } from 'lucide-react';
import { ProtectedLayout } from '@/layouts/ProtectedLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { ModuleShellPage } from '@/pages/ModuleShellPage';
import { paths } from '@/routes/paths';

const LandingPage = lazy(() => import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/pages/SignupPage').then((module) => ({ default: module.SignupPage })));
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

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
      {
        path: paths.tasks,
        element: <ModuleShellPage title="Tasks" description="Your study task workspace." icon={ClipboardList} />,
      },
      {
        path: paths.goals,
        element: <ModuleShellPage title="Goals" description="Your goal progress workspace." icon={Target} />,
      },
      {
        path: paths.pomodoro,
        element: <ModuleShellPage title="Pomodoro" description="Your focus timer workspace." icon={Clock3} />,
      },
      {
        path: paths.rewards,
        element: <ModuleShellPage title="Rewards" description="Your progress and reward workspace." icon={Gem} />,
      },
      {
        path: paths.analytics,
        element: <ModuleShellPage title="Analytics" description="Your study analytics workspace." icon={BarChart3} />,
      },
      {
        path: paths.aiCoach,
        element: <ModuleShellPage title="AI Coach" description="Your coaching workspace." icon={Bot} />,
      },
      {
        path: paths.profile,
        element: <ModuleShellPage title="Profile" description="Your account workspace." icon={UserCircle} />,
      },
      { path: '/app/*', element: <Navigate to={paths.dashboard} replace /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
