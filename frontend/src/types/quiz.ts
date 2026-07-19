// ─── Quiz Types ───────────────────────────────────────────────────────────────
// Endpoint prefix: /api/quiz

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuizQuestion = {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string | null;
  subject: string;
  difficulty: QuizDifficulty;
};

export type QuizAttemptAnswer = {
  questionId: number;
  selectedOptionIndex: number;
  correct: boolean;
  timeTakenSeconds: number;
};

export type QuizAttempt = {
  id: number;
  subject: string;
  difficulty: QuizDifficulty;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;             // 0–100
  timeTakenSeconds: number;
  answers: QuizAttemptAnswer[];
  completedAt: string;
};

export type QuizSummaryBySubject = {
  subject: string;
  attemptsCount: number;
  averageScore: number;
  bestScore: number;
  lastAttemptAt: string;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
};

export type SubmitQuizPayload = {
  subject: string;
  difficulty: QuizDifficulty;
  answers: Omit<QuizAttemptAnswer, 'correct'>[];
};
