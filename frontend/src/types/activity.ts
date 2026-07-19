// ─── Activity / Recent Events Types ──────────────────────────────────────────
// Endpoint prefix: /api/activity

export type ActivityEventType =
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'TASK_UPDATED'
  | 'GOAL_CREATED'
  | 'GOAL_COMPLETED'
  | 'GOAL_PROGRESS_UPDATED'
  | 'POMODORO_SESSION_COMPLETED'
  | 'QUIZ_COMPLETED'
  | 'NOTE_CREATED'
  | 'DOCUMENT_UPLOADED'
  | 'STUDY_BLOCK_COMPLETED';

export type ActivityEvent = {
  id: number;
  type: ActivityEventType;
  summary: string;          // human-readable e.g. "Completed task 'Review Chapter 5'"
  entityId: number;
  entityType: 'TASK' | 'GOAL' | 'POMODORO_SESSION' | 'QUIZ' | 'NOTE' | 'DOCUMENT' | 'STUDY_BLOCK';
  occurredAt: string;
};

// ─── Chat Context Snapshot Types ──────────────────────────────────────────────
// Used to assemble the context bundle sent with each AI request

export type ChatContextSnapshot = {
  fetchedAt: string;

  // From /api/tasks
  pendingTasks: {
    id: number;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
  }[];
  overdueTasks: {
    id: number;
    title: string;
    dueDate: string;
  }[];

  // From /api/goals (future)
  activeGoals: {
    id: number;
    title: string;
    progressPercent: number;
    targetDate: string;
  }[];

  // From /api/pomodoro/sessions/stats (future)
  pomodoroStats: {
    todaySessions: number;
    todayWorkMinutes: number;
    currentStreak: number;
    weeklyWorkMinutes: number;
  } | null;

  // From /api/analytics/summary (future)
  analytics: {
    weeklyCompletedTasks: number;
    taskCompletionRate: number;
    weakSubjects: string[];
    strongSubjects: string[];
    mostStudiedSubject: string | null;
  } | null;

  // From /api/study-planner/deadlines (future)
  upcomingDeadlines: {
    id: number;
    title: string;
    dueDate: string;
    urgent: boolean;
    type: string;
  }[];

  // From /api/quiz/summary (future)
  quizHistory: {
    subject: string;
    averageScore: number;
    trend: string;
  }[];

  // From /api/activity (future)
  recentActivity: {
    type: string;
    summary: string;
    occurredAt: string;
  }[];

  // From /api/notes (future)
  recentNotes: {
    id: number;
    title: string;
    subject: string | null;
    updatedAt: string;
  }[];

  // From /api/documents (future)
  recentDocuments: {
    id: number;
    originalName: string;
    subject: string | null;
    uploadedAt: string;
  }[];
};
