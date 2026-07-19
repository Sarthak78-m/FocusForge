/**
 * quiz.service.ts
 *
 * API layer for /api/quiz
 *
 * Backend status: NOT YET IMPLEMENTED
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  QuizQuestion,
  QuizAttempt,
  QuizSummaryBySubject,
  SubmitQuizPayload,
  QuizDifficulty,
} from '@/types/quiz';

export type GetAttemptsParams = {
  subject?: string;
  page?: number;
  size?: number;
};

export const quizService = {
  /**
   * GET /api/quiz/questions?subject=X&difficulty=Y&limit=N
   * Fetch quiz questions for a given subject (used before submitting).
   */
  async getQuestions(subject: string, difficulty: QuizDifficulty, limit: number = 10) {
    const response = await http.get<ApiResponse<QuizQuestion[]>>('/quiz/questions', {
      params: { subject, difficulty, limit },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * POST /api/quiz/submit
   * Submit a completed quiz attempt and get scored results.
   */
  async submitAttempt(payload: SubmitQuizPayload) {
    const response = await http.post<ApiResponse<QuizAttempt>>('/quiz/submit', payload);
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/quiz/attempts
   * Paginated list of all past quiz attempts.
   */
  async getAttempts(params: GetAttemptsParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<QuizAttempt>>>(
      '/quiz/attempts',
      { params: { ...filters, page, size } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/quiz/attempts/:attemptId
   */
  async getAttempt(attemptId: number) {
    const response = await http.get<ApiResponse<QuizAttempt>>(
      `/quiz/attempts/${attemptId}`,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/quiz/summary
   * Per-subject aggregated stats: average score, trend, best score.
   */
  async getSummary() {
    const response = await http.get<ApiResponse<QuizSummaryBySubject[]>>('/quiz/summary');
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/quiz/summary/:subject
   * Summary for a single subject.
   */
  async getSubjectSummary(subject: string) {
    const response = await http.get<ApiResponse<QuizSummaryBySubject>>(
      `/quiz/summary/${encodeURIComponent(subject)}`,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/quiz/recent?limit=N
   * Most recent N quiz attempts.
   */
  async getRecentAttempts(limit: number = 5) {
    const response = await http.get<ApiResponse<QuizAttempt[]>>('/quiz/recent', {
      params: { limit },
    });
    return unwrapApiResponse(response.data);
  },
};
