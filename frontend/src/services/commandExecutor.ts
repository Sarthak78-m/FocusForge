/**
 * commandExecutor.ts
 *
 * Executes the correct service call(s) for a recognised intent and
 * returns a typed CommandResult that contextBuilder can format.
 *
 * Design principles:
 * - Each intent handler is a small, focused async function
 * - Live API calls (tasks) are made where possible; unimplemented modules
 *   fall back to the contextSnapshot without throwing
 * - Navigation-only commands return immediately (no async needed)
 * - Task mutation commands (complete / delete) call real endpoints
 * - A ChatAction is returned alongside the result for UI-level side effects
 *   (e.g. navigate to /app/pomodoro)
 */

import type { RecognisedIntent } from '@/services/intentService';
import type { CommandResult, TaskItem, OverdueItem, GoalItem, DeadlineItem } from '@/services/contextBuilder';
import type { ChatContextSnapshot } from '@/types/activity';
import { taskService } from '@/services/task.service';
import { goalService } from '@/services/goal.service';
import { analyticsService } from '@/services/analytics.service';
import { pomodoroService } from '@/services/pomodoro.service';
import { deadlineService } from '@/services/studyPlanner.service';

// ─── Chat Action (UI side effect) ─────────────────────────────────────────────

export type ChatAction =
  | { type: 'NAVIGATE'; path: string; label: string }
  | { type: 'NONE' };

// ─── Full Execution Result ─────────────────────────────────────────────────────

export type ExecutionResult = {
  commandResult: CommandResult;
  action: ChatAction;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safe<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call();
  } catch {
    return fallback;
  }
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Fuzzy match: returns true if taskTitle appears to match candidate */
function taskTitleMatches(candidate: string, query: string): boolean {
  const c = candidate.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return false;
  // Exact contains match
  if (c.includes(q)) return true;
  // All query words present in candidate
  const words = q.split(/\s+/);
  return words.every((w) => c.includes(w));
}

// ─── Intent Handlers ──────────────────────────────────────────────────────────

async function handleTodayTasks(
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  const today = getTodayISO();

  // Try live API first, fall back to snapshot
  const liveData = await safe(
    () => taskService.getTasks({ size: 50, sort: 'dueDate,asc' }),
    null,
  );

  let tasks: TaskItem[];
  let overdue: OverdueItem[];

  if (liveData) {
    const all = liveData.content;
    tasks = all
      .filter((t) => t.status !== 'COMPLETED' && t.dueDate === today)
      .map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ?? null,
      }));
    overdue = all
      .filter((t) => t.status !== 'COMPLETED' && t.dueDate != null && t.dueDate < today)
      .map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate! }));
  } else {
    // Fallback to snapshot
    tasks = (snapshot?.pendingTasks ?? []).filter(
      (t) => t.dueDate === today,
    );
    overdue = snapshot?.overdueTasks ?? [];
  }

  return {
    commandResult: { intent: 'TODAY_TASKS', tasks, overdue },
    action: { type: 'NONE' },
  };
}

async function handleTomorrowTasks(
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  const tomorrow = getTomorrowISO();

  const liveData = await safe(
    () => taskService.getTasks({ dueBefore: tomorrow, size: 50 }),
    null,
  );

  let tasks: TaskItem[];

  if (liveData) {
    tasks = liveData.content
      .filter((t) => t.status !== 'COMPLETED' && t.dueDate === tomorrow)
      .map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ?? null,
      }));
  } else {
    tasks = (snapshot?.pendingTasks ?? []).filter((t) => t.dueDate === tomorrow);
  }

  return {
    commandResult: { intent: 'TOMORROW_TASKS', tasks },
    action: { type: 'NONE' },
  };
}

async function handlePendingGoals(
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  // Try live API; fall back to contextSnapshot
  const activeGoals = await safe(() => goalService.getActiveGoals(), null);

  const goals: GoalItem[] = activeGoals
    ? activeGoals.map((g) => ({
        id: g.id,
        title: g.title,
        progressPercent: g.progressPercentage,
        targetDate: g.targetDate,
      }))
    : (snapshot?.activeGoals ?? []).map((g) => ({
        id: g.id,
        title: g.title,
        progressPercent: g.progressPercent,
        targetDate: g.targetDate,
      }));

  return {
    commandResult: { intent: 'PENDING_GOALS', goals },
    action: { type: 'NONE' },
  };
}

async function handleCompletedGoals(): Promise<ExecutionResult> {
  const result = await safe(
    () => goalService.getGoals(),
    null,
  );

  const goals: GoalItem[] = result
    ? result.filter((g) => g.completed).map((g) => ({
        id: g.id,
        title: g.title,
        progressPercent: g.progressPercentage,
        targetDate: g.targetDate,
      }))
    : [];

  return {
    commandResult: { intent: 'COMPLETED_GOALS', goals },
    action: { type: 'NONE' },
  };
}

async function handleAnalytics(
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  const summary = await safe(() => analyticsService.getSummary(), null);

  const analyticsData = summary
    ? {
        weeklyCompletedTasks: summary.completedTasks,
        taskCompletionRate: summary.productivityScore / 100,
        weakSubjects: [] as string[],
        strongSubjects: [] as string[],
        mostStudiedSubject: null as string | null,
      }
    : snapshot?.analytics ?? null;

  return {
    commandResult: { intent: 'SHOW_ANALYTICS', analytics: analyticsData },
    action: { type: 'NAVIGATE', path: '/app/analytics', label: 'Analytics' },
  };
}

function handleStartPomodoro(): ExecutionResult {
  return {
    commandResult: { intent: 'START_POMODORO', action: 'navigate' },
    action: { type: 'NAVIGATE', path: '/app/pomodoro', label: 'Pomodoro' },
  };
}

function handleStopPomodoro(): ExecutionResult {
  return {
    commandResult: { intent: 'STOP_POMODORO', action: 'navigate' },
    action: { type: 'NAVIGATE', path: '/app/pomodoro', label: 'Pomodoro' },
  };
}

function handleResumeTimer(): ExecutionResult {
  return {
    commandResult: { intent: 'RESUME_TIMER', action: 'navigate' },
    action: { type: 'NAVIGATE', path: '/app/pomodoro', label: 'Pomodoro' },
  };
}

async function handleCompleteTask(
  entityTitle: string | undefined,
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  if (!entityTitle || entityTitle.trim() === '') {
    return {
      commandResult: { intent: 'COMPLETE_TASK', success: false, taskTitle: '', error: 'NO_ENTITY' },
      action: { type: 'NONE' },
    };
  }

  // Find the task in snapshot or live data
  let matchedTask: { id: number; title: string } | undefined;

  // Try snapshot first (fast)
  const snapshotMatch = snapshot?.pendingTasks.find((t) =>
    taskTitleMatches(t.title, entityTitle),
  );

  if (snapshotMatch) {
    matchedTask = snapshotMatch;
  } else {
    // Try live API
    const liveData = await safe(
      () => taskService.getTasks({ size: 50 }),
      null,
    );
    if (liveData) {
      const found = liveData.content.find(
        (t) => t.status !== 'COMPLETED' && taskTitleMatches(t.title, entityTitle),
      );
      if (found) matchedTask = found;
    }
  }

  if (!matchedTask) {
    return {
      commandResult: {
        intent: 'COMPLETE_TASK',
        success: false,
        taskTitle: entityTitle,
        error: 'NOT_FOUND',
      },
      action: { type: 'NONE' },
    };
  }

  const completed = await safe(() => taskService.completeTask(matchedTask!.id), null);

  return {
    commandResult: {
      intent: 'COMPLETE_TASK',
      success: completed !== null,
      taskTitle: matchedTask.title,
      error: completed === null ? 'API_ERROR' : undefined,
    },
    action: { type: 'NONE' },
  };
}

async function handleDeleteTask(
  entityTitle: string | undefined,
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  if (!entityTitle || entityTitle.trim() === '') {
    return {
      commandResult: { intent: 'DELETE_TASK', success: false, taskTitle: '', error: 'NO_ENTITY' },
      action: { type: 'NONE' },
    };
  }

  let matchedTask: { id: number; title: string } | undefined;

  const snapshotMatch = snapshot?.pendingTasks.find((t) =>
    taskTitleMatches(t.title, entityTitle),
  );
  if (snapshotMatch) {
    matchedTask = snapshotMatch;
  } else {
    const liveData = await safe(() => taskService.getTasks({ size: 50 }), null);
    if (liveData) {
      const found = liveData.content.find((t) => taskTitleMatches(t.title, entityTitle));
      if (found) matchedTask = found;
    }
  }

  if (!matchedTask) {
    return {
      commandResult: {
        intent: 'DELETE_TASK',
        success: false,
        taskTitle: entityTitle,
        error: 'NOT_FOUND',
      },
      action: { type: 'NONE' },
    };
  }

  const deleted = await safe(
    async () => { await taskService.deleteTask(matchedTask!.id); return true; },
    false,
  );

  return {
    commandResult: {
      intent: 'DELETE_TASK',
      success: deleted,
      taskTitle: matchedTask.title,
      error: deleted ? undefined : 'API_ERROR',
    },
    action: { type: 'NONE' },
  };
}

function handleMoveTask(entityTitle: string | undefined): ExecutionResult {
  return {
    commandResult: {
      intent: 'MOVE_TASK',
      taskTitle: entityTitle ?? '',
      action: 'navigate',
    },
    action: { type: 'NAVIGATE', path: '/app/tasks', label: 'Tasks' },
  };
}

function handleGenerateQuiz(subject: string | undefined): ExecutionResult {
  return {
    commandResult: { intent: 'GENERATE_QUIZ', subject, action: 'navigate' },
    action: { type: 'NAVIGATE', path: '/app/quiz', label: 'Quiz' },
  };
}

function handleOpenNotes(): ExecutionResult {
  return {
    commandResult: { intent: 'OPEN_NOTES', action: 'navigate' },
    action: { type: 'NAVIGATE', path: '/app/notes', label: 'Notes' },
  };
}

function handleWeakSubjects(snapshot: ChatContextSnapshot | null): ExecutionResult {
  const subjects = snapshot?.analytics?.weakSubjects ?? [];
  return {
    commandResult: { intent: 'WEAK_SUBJECTS', subjects },
    action: { type: 'NONE' },
  };
}

function handleStrongSubjects(snapshot: ChatContextSnapshot | null): ExecutionResult {
  const subjects = snapshot?.analytics?.strongSubjects ?? [];
  return {
    commandResult: { intent: 'STRONG_SUBJECTS', subjects },
    action: { type: 'NONE' },
  };
}

async function handleStudyStreak(snapshot: ChatContextSnapshot | null): Promise<ExecutionResult> {
  const streak = snapshot?.pomodoroStats?.currentStreak ?? null;
  const todayMinutes = snapshot?.pomodoroStats?.todayWorkMinutes ?? null;
  const weeklyMinutes = snapshot?.pomodoroStats?.weeklyWorkMinutes ?? null;

  return {
    commandResult: { intent: 'STUDY_STREAK', streak, todayMinutes, weeklyMinutes },
    action: { type: 'NONE' },
  };
}

async function handleUpcomingExam(
  snapshot: ChatContextSnapshot | null,
  subjectFilter?: string,
): Promise<ExecutionResult> {
  const liveDeadlines = await safe(() => deadlineService.getUpcoming(), null);

  let deadlines: DeadlineItem[];

  if (liveDeadlines) {
    deadlines = liveDeadlines
      .filter((d) =>
        !subjectFilter ||
        (d.title.toLowerCase().includes(subjectFilter.toLowerCase()) ||
          (d.subject ?? '').toLowerCase().includes(subjectFilter.toLowerCase())),
      )
      .map((d) => ({
        id: d.id,
        title: d.title,
        dueDate: d.dueDate,
        urgent: d.urgent,
        type: d.type,
      }));
  } else {
    deadlines = (snapshot?.upcomingDeadlines ?? []).filter(
      (d) =>
        !subjectFilter ||
        d.title.toLowerCase().includes(subjectFilter.toLowerCase()),
    );
  }

  return {
    commandResult: { intent: 'UPCOMING_EXAM', deadlines },
    action: { type: 'NONE' },
  };
}

function handleRecommendedStudyOrder(
  snapshot: ChatContextSnapshot | null,
): ExecutionResult {
  const hasTasks = snapshot && snapshot.pendingTasks.length > 0;
  return {
    commandResult: {
      intent: 'RECOMMENDED_STUDY_ORDER',
      snapshot,
      success: !!hasTasks,
      reason: !snapshot ? 'NO_CONTEXT' : !hasTasks ? 'NO_PENDING_TASKS' : undefined,
    },
    action: { type: 'NONE' },
  };
}

function handleEstimateCompletion(
  snapshot: ChatContextSnapshot | null,
): ExecutionResult {
  const hasTasks = snapshot && snapshot.pendingTasks.length > 0;
  return {
    commandResult: {
      intent: 'ESTIMATE_COMPLETION',
      snapshot,
      success: !!hasTasks,
      reason: !snapshot ? 'NO_CONTEXT' : !hasTasks ? 'NO_PENDING_TASKS' : undefined,
    },
    action: { type: 'NONE' },
  };
}

function handleUnknown(input: string): ExecutionResult {
  return {
    commandResult: { intent: 'UNKNOWN', input },
    action: { type: 'NONE' },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Execute the correct service call(s) for a recognised intent.
 *
 * @param intent   The RecognisedIntent from intentService.recognize()
 * @param snapshot The current ChatContextSnapshot (may be null if not yet loaded)
 * @returns        A fully populated ExecutionResult
 */
export async function execute(
  intent: RecognisedIntent,
  snapshot: ChatContextSnapshot | null,
): Promise<ExecutionResult> {
  const { entities } = intent;

  switch (intent.type) {
    case 'TODAY_TASKS':     return handleTodayTasks(snapshot);
    case 'TOMORROW_TASKS':  return handleTomorrowTasks(snapshot);
    case 'PENDING_GOALS':   return handlePendingGoals(snapshot);
    case 'COMPLETED_GOALS': return handleCompletedGoals();
    case 'SHOW_ANALYTICS':  return handleAnalytics(snapshot);
    case 'START_POMODORO':  return handleStartPomodoro();
    case 'STOP_POMODORO':   return handleStopPomodoro();
    case 'RESUME_TIMER':    return handleResumeTimer();
    case 'COMPLETE_TASK':   return handleCompleteTask(entities.taskTitle, snapshot);
    case 'DELETE_TASK':     return handleDeleteTask(entities.taskTitle, snapshot);
    case 'MOVE_TASK':       return handleMoveTask(entities.taskTitle);
    case 'GENERATE_QUIZ':   return handleGenerateQuiz(entities.subject);
    case 'OPEN_NOTES':      return handleOpenNotes();
    case 'WEAK_SUBJECTS':   return handleWeakSubjects(snapshot);
    case 'STRONG_SUBJECTS': return handleStrongSubjects(snapshot);
    case 'STUDY_STREAK':    return handleStudyStreak(snapshot);
    case 'UPCOMING_EXAM':   return handleUpcomingExam(snapshot, entities.subject);
    case 'RECOMMENDED_STUDY_ORDER': return handleRecommendedStudyOrder(snapshot);
    case 'ESTIMATE_COMPLETION':     return handleEstimateCompletion(snapshot);
    case 'UNKNOWN':
    default:                return handleUnknown(intent.rawInput);
  }
}
