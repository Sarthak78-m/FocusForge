/**
 * goalService.ts
 *
 * API layer for /api/goals with localStorage fallback when backend is offline.
 * Matches backend endpoints: GoalController.java
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Goal, CreateGoalPayload } from '@/types/goal';

// ── Local storage fallback ───────────────────────────────────────────────

function getStorageKey(): string {
  try {
    const user = localStorage.getItem('mindsprint_mock_user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed?.email) return `mindsprint_goals_${parsed.email.toLowerCase()}`;
    }
  } catch {}
  return 'mindsprint_goals_default';
}

function getStoredGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(goals));
  } catch {}
}

function isNetworkError(err: any): boolean {
  return !err.response || err.response.status === 404 || err.code === 'ERR_NETWORK';
}

// ── Service ──────────────────────────────────────────────────────────────

export const goalService = {
  /** GET /api/goals — paginated list of all goals */
  async getGoals(): Promise<Goal[]> {
    try {
      const res = await http.get<ApiResponse<PaginatedResponse<Goal>>>('/goals', {
        params: { page: 0, size: 100 },
      });
      const page = unwrapApiResponse(res.data);
      if (page.content && page.content.length > 0) {
        saveStoredGoals(page.content);
      }
      return page.content;
    } catch (err: any) {
      if (isNetworkError(err)) return getStoredGoals();
      throw err;
    }
  },

  /** GET /api/goals/active — only non-completed goals */
  async getActiveGoals(): Promise<Goal[]> {
    try {
      const res = await http.get<ApiResponse<Goal[]>>('/goals/active');
      return unwrapApiResponse(res.data);
    } catch (err: any) {
      if (isNetworkError(err)) return getStoredGoals().filter((g) => !g.completed);
      throw err;
    }
  },

  /** POST /api/goals — create a new goal */
  async createGoal(payload: CreateGoalPayload): Promise<Goal> {
    try {
      const res = await http.post<ApiResponse<Goal>>('/goals', payload);
      const created = unwrapApiResponse(res.data);
      saveStoredGoals([created, ...getStoredGoals()]);
      return created;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const local: Goal = {
          id: Date.now(),
          title: payload.title,
          category: payload.category,
          targetDate: payload.targetDate,
          currentUnits: 0,
          totalUnits: payload.totalUnits,
          unitName: payload.unitName,
          progressPercentage: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveStoredGoals([local, ...getStoredGoals()]);
        return local;
      }
      throw err;
    }
  },

  /** PATCH /api/goals/{id}/progress?units=N — increment progress */
  async incrementProgress(goalId: number, units: number = 1): Promise<Goal> {
    try {
      const res = await http.patch<ApiResponse<Goal>>(`/goals/${goalId}/progress`, null, {
        params: { units },
      });
      const updated = unwrapApiResponse(res.data);
      saveStoredGoals(getStoredGoals().map((g) => (g.id === goalId ? updated : g)));
      return updated;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const goals = getStoredGoals();
        const target = goals.find((g) => g.id === goalId);
        if (!target) throw new Error('Goal not found');
        const nextUnits = Math.min(target.totalUnits, target.currentUnits + Math.max(1, units));
        const updated: Goal = {
          ...target,
          currentUnits: nextUnits,
          progressPercentage: Math.min(100, Math.round((nextUnits / target.totalUnits) * 100)),
          completed: nextUnits >= target.totalUnits,
          updatedAt: new Date().toISOString(),
        };
        saveStoredGoals(goals.map((g) => (g.id === goalId ? updated : g)));
        return updated;
      }
      throw err;
    }
  },

  /** DELETE /api/goals/{id} */
  async deleteGoal(goalId: number): Promise<void> {
    try {
      await http.delete<ApiResponse<void>>(`/goals/${goalId}`);
    } catch {
      // Ignore network errors — local cleanup proceeds regardless
    } finally {
      saveStoredGoals(getStoredGoals().filter((g) => g.id !== goalId));
    }
  },
};
