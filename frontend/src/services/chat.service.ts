/**
 * chatService.ts
 *
 * Aggregates context from all MindSprint modules into a single snapshot
 * that can be attached to AI coach requests.
 *
 * Architecture:
 * - buildContextSnapshot() calls each module service in parallel
 * - Each call is individually guarded — if a module is unavailable (404/500),
 *   that section of the snapshot is populated with an empty/null fallback
 *   so the rest of the context still loads correctly
 *
 * Backend status of individual modules:
 * - /api/tasks          → IMPLEMENTED  ✅
 * - /api/auth/me        → IMPLEMENTED  ✅
 * - /api/goals          → NOT YET IMPLEMENTED 🚧
 * - /api/pomodoro       → NOT YET IMPLEMENTED 🚧
 * - /api/analytics      → NOT YET IMPLEMENTED 🚧
 * - /api/study-planner  → NOT YET IMPLEMENTED 🚧
 * - /api/quiz           → NOT YET IMPLEMENTED 🚧
 * - /api/notes          → NOT YET IMPLEMENTED 🚧
 * - /api/documents      → NOT YET IMPLEMENTED 🚧
 * - /api/activity       → NOT YET IMPLEMENTED 🚧
 * - /api/deadlines      → NOT YET IMPLEMENTED 🚧
 *
 * When a backend module goes live, no changes are needed here —
 * the guard will stop returning the fallback and real data will flow through.
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { ChatContextSnapshot } from '@/types/activity';
import { taskService } from '@/services/task.service';
import { goalService } from '@/services/goal.service';
import { pomodoroService } from '@/services/pomodoro.service';
import { analyticsService } from '@/services/analytics.service';
import { deadlineService } from '@/services/studyPlanner.service';
import { quizService } from '@/services/quiz.service';
import { activityService } from '@/services/activity.service';
import { notesService, documentService } from '@/services/notes.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely execute an async call and return a fallback value if it fails.
 * Prevents a single unavailable module from aborting the entire context fetch.
 */
async function safe<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call();
  } catch {
    return fallback;
  }
}

// ─── Chat Message API ─────────────────────────────────────────────────────────

export type ChatMessagePayload = {
  conversationId: string;
  message: string;
  /** Full context snapshot attached to the request */
  context: ChatContextSnapshot;
};

export type ChatMessageResponse = {
  reply: string;
  conversationId: string;
  suggestedReplies?: string[];
};

// ─── chatService ──────────────────────────────────────────────────────────────

export const chatService = {
  /**
   * buildContextSnapshot()
   *
   * Fetches data from all available modules in parallel.
   * Returns a typed ChatContextSnapshot that can be sent with
   * each AI coach request.
   *
   * This is the integration point — any new backend module
   * should be wired in here.
   */
  async buildContextSnapshot(): Promise<ChatContextSnapshot> {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // ── Fetch from all modules concurrently ───────────────────────────────────
    const [
      allTasksResult,
      activeGoalsResult,
      pomodoroStatsResult,
      analyticsSummaryResult,
      upcomingDeadlinesResult,
      quizSummaryResult,
      recentActivityResult,
      recentNotesResult,
      recentDocumentsResult,
    ] = await Promise.all([
      // Tasks — IMPLEMENTED: fetch all pending tasks
      safe(
        () =>
          taskService.getTasks({
            size: 50,
            sort: 'dueDate,asc',
          }),
        null,
      ),

      // Goals — NOT YET IMPLEMENTED
      safe(() => goalService.getActiveGoals(), []),

      // Pomodoro stats — NOT YET IMPLEMENTED
      safe(() => pomodoroService.getStats(), null),

      // Analytics summary — NOT YET IMPLEMENTED
      safe(() => analyticsService.getSummary('30d'), null),

      // Upcoming deadlines — NOT YET IMPLEMENTED
      safe(() => deadlineService.getUpcoming(), []),

      // Quiz summary — NOT YET IMPLEMENTED
      safe(() => quizService.getSummary(), []),

      // Recent activity — NOT YET IMPLEMENTED
      safe(() => activityService.getRecentActivity(10), []),

      // Recent notes — NOT YET IMPLEMENTED
      safe(() => notesService.getRecentNotes(5), []),

      // Recent documents — NOT YET IMPLEMENTED
      safe(() => documentService.getRecentDocuments(5), []),
    ]);

    // ── Transform task data ────────────────────────────────────────────────────
    const allTasks = allTasksResult?.content ?? [];
    const pendingTasks = allTasks
      .filter((t) => t.status !== 'COMPLETED')
      .map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ?? null,
      }));

    const overdueTasks = allTasks
      .filter(
        (t) =>
          t.status !== 'COMPLETED' &&
          t.dueDate != null &&
          t.dueDate < today,
      )
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate!,
      }));

    // ── Transform goals ────────────────────────────────────────────────────────
    const activeGoals = (activeGoalsResult ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      progressPercent: g.progressPercent,
      targetDate: g.targetDate,
    }));

    // ── Transform pomodoro stats ───────────────────────────────────────────────
    const pomodoroStats = pomodoroStatsResult
      ? {
          todaySessions: pomodoroStatsResult.todaySessions,
          todayWorkMinutes: pomodoroStatsResult.todayWorkMinutes,
          currentStreak: pomodoroStatsResult.currentStreak,
          weeklyWorkMinutes: pomodoroStatsResult.totalWorkMinutes,
        }
      : null;

    // ── Transform analytics ────────────────────────────────────────────────────
    const analytics = analyticsSummaryResult
      ? {
          weeklyCompletedTasks: analyticsSummaryResult.weeklyCompletedTasks,
          taskCompletionRate: analyticsSummaryResult.taskCompletionRate,
          weakSubjects: analyticsSummaryResult.weakSubjects,
          strongSubjects: analyticsSummaryResult.strongSubjects,
          mostStudiedSubject: analyticsSummaryResult.mostStudiedSubject,
        }
      : null;

    // ── Transform deadlines ────────────────────────────────────────────────────
    const upcomingDeadlines = (upcomingDeadlinesResult ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      dueDate: d.dueDate,
      urgent: d.urgent,
      type: d.type,
    }));

    // ── Transform quiz history ─────────────────────────────────────────────────
    const quizHistory = (quizSummaryResult ?? []).map((q) => ({
      subject: q.subject,
      averageScore: q.averageScore,
      trend: q.trend,
    }));

    // ── Transform recent activity ──────────────────────────────────────────────
    const recentActivity = (recentActivityResult ?? []).map((a) => ({
      type: a.type,
      summary: a.summary,
      occurredAt: a.occurredAt,
    }));

    // ── Transform notes ────────────────────────────────────────────────────────
    const recentNotes = (recentNotesResult ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      subject: n.subject ?? null,
      updatedAt: n.updatedAt,
    }));

    // ── Transform documents ────────────────────────────────────────────────────
    const recentDocuments = (recentDocumentsResult ?? []).map((d) => ({
      id: d.id,
      originalName: d.originalName,
      subject: d.subject ?? null,
      uploadedAt: d.uploadedAt,
    }));

    return {
      fetchedAt: now,
      pendingTasks,
      overdueTasks,
      activeGoals,
      pomodoroStats,
      analytics,
      upcomingDeadlines,
      quizHistory,
      recentActivity,
      recentNotes,
      recentDocuments,
    };
  },

  /**
   * sendMessage()
   *
   * POST /api/chat/message
   *
   * Sends a user message along with the full context snapshot to the AI backend.
   *
   * Backend status: NOT YET IMPLEMENTED
   * The endpoint shape is defined here so the backend team has a clear contract.
   * Once /api/chat is live, the ChatProvider should call this instead of
   * the local getBotResponse() function.
   *
   * Expected request body: ChatMessagePayload
   * Expected response:     ChatMessageResponse
   */
  async sendMessage(payload: ChatMessagePayload): Promise<ChatMessageResponse> {
    const response = await http.post<ApiResponse<ChatMessageResponse>>(
      '/chat/message',
      payload,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * getConversationHistory()
   *
   * GET /api/chat/conversations/:conversationId/messages
   *
   * Backend status: NOT YET IMPLEMENTED
   * Used to restore a previous conversation from the server.
   */
  async getConversationHistory(conversationId: string) {
    const response = await http.get<
      ApiResponse<{ role: 'user' | 'bot'; content: string; timestamp: string }[]>
    >(`/chat/conversations/${conversationId}/messages`);
    return unwrapApiResponse(response.data);
  },

  /**
   * listConversations()
   *
   * GET /api/chat/conversations
   *
   * Backend status: NOT YET IMPLEMENTED
   */
  async listConversations() {
    const response = await http.get<
      ApiResponse<
        {
          id: string;
          title: string;
          preview: string;
          updatedAt: string;
        }[]
      >
    >('/chat/conversations');
    return unwrapApiResponse(response.data);
  },
};
