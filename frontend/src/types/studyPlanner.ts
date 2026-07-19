// ─── Study Planner Types ──────────────────────────────────────────────────────
// Endpoint prefix: /api/study-planner

export type StudyBlockStatus = 'PLANNED' | 'COMPLETED' | 'SKIPPED';

export type StudyBlock = {
  id: number;
  subject: string;
  topicNotes?: string | null;
  scheduledDate: string;      // ISO date YYYY-MM-DD
  startTime: string;          // HH:mm
  endTime: string;            // HH:mm
  durationMinutes: number;
  status: StudyBlockStatus;
  linkedGoalId?: number | null;
  linkedTaskId?: number | null;
  createdAt: string;
};

export type StudyPlan = {
  id: number;
  weekStartDate: string;      // Monday ISO date
  blocks: StudyBlock[];
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
};

export type CreateStudyBlockPayload = {
  subject: string;
  topicNotes?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  linkedGoalId?: number;
  linkedTaskId?: number;
};

export type UpdateStudyBlockPayload = Partial<CreateStudyBlockPayload> & {
  status?: StudyBlockStatus;
};

// ─── Deadline ─────────────────────────────────────────────────────────────────

export type Deadline = {
  id: number;
  title: string;
  dueDate: string;            // ISO date YYYY-MM-DD
  dueTime?: string | null;    // HH:mm optional
  type: 'EXAM' | 'ASSIGNMENT' | 'PROJECT' | 'OTHER';
  subject?: string | null;
  urgent: boolean;            // due within 48 hours
  linkedTaskId?: number | null;
  linkedGoalId?: number | null;
};
