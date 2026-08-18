import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '@/layouts/ProtectedLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { paths } from '@/routes/paths';

// Public Auth pages
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

// Protected Core Study Pages
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
const GoalsPage = lazy(() =>
  import('@/pages/GoalsPage').then((m) => ({ default: m.GoalsPage })),
);
const RewardsPage = lazy(() =>
  import('@/pages/RewardsPage').then((m) => ({ default: m.RewardsPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const AICoachPage = lazy(() =>
  import('@/pages/AICoachPage').then((m) => ({ default: m.AICoachPage })),
);

// Note Taking & Knowledge Pages
const NotesPage = lazy(() =>
  import('@/pages/NotesPage').then((m) => ({ default: m.NotesPage })),
);
const NoteEditorPage = lazy(() =>
  import('@/pages/NoteEditorPage').then((m) => ({ default: m.NoteEditorPage })),
);
const FavoritesPage = lazy(() =>
  import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
);
const RecentPage = lazy(() =>
  import('@/pages/RecentPage').then((m) => ({ default: m.RecentPage })),
);
const FoldersPage = lazy(() =>
  import('@/pages/FoldersPage').then((m) => ({ default: m.FoldersPage })),
);
const TagsPage = lazy(() =>
  import('@/pages/TagsPage').then((m) => ({ default: m.TagsPage })),
);
const GraphPage = lazy(() =>
  import('@/pages/GraphPage').then((m) => ({ default: m.GraphPage })),
);
const BacklinksPage = lazy(() =>
  import('@/pages/BacklinksPage').then((m) => ({ default: m.BacklinksPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingPage').then((m) => ({ default: m.SettingsPage })),
);
const HelpPage = lazy(() =>
  import('@/pages/HelpPage').then((m) => ({ default: m.HelpPage })),
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
      // Core Study Pages
      { path: paths.dashboard, element: <DashboardPage /> },
      { path: paths.tasks, element: <TasksPage /> },
      { path: paths.pomodoro, element: <PomodoroPage /> },
      { path: paths.profile, element: <ProfilePage /> },
      { path: paths.goals, element: <GoalsPage /> },
      { path: paths.rewards, element: <RewardsPage /> },
      { path: paths.analytics, element: <AnalyticsPage /> },
      { path: paths.aiCoach, element: <AICoachPage /> },

      // Note Taking & Knowledge Pages
      { path: paths.notes, element: <NotesPage /> },
      { path: paths.noteEditor, element: <NoteEditorPage /> },
      { path: paths.favorites, element: <FavoritesPage /> },
      { path: paths.recent, element: <RecentPage /> },
      { path: paths.folders, element: <FoldersPage /> },
      { path: paths.tags, element: <TagsPage /> },
      { path: paths.graph, element: <GraphPage /> },
      { path: paths.backlinks, element: <BacklinksPage /> },
      { path: paths.settings, element: <SettingsPage /> },
      { path: paths.help, element: <HelpPage /> },

      // Root path aliases
      { path: '/notes', element: <NotesPage /> },
      { path: '/notes/:id', element: <NoteEditorPage /> },
      { path: '/graph', element: <GraphPage /> },
      { path: '/folders', element: <FoldersPage /> },
      { path: '/tags', element: <TagsPage /> },
      { path: '/favorites', element: <FavoritesPage /> },
      { path: '/recent', element: <RecentPage /> },

      { path: '/app/*', element: <Navigate to={paths.dashboard} replace /> },

    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);


