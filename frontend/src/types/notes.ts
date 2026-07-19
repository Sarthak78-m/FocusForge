// ─── Note Types ───────────────────────────────────────────────────────────────
// Endpoint prefix: /api/notes

export type Note = {
  id: number;
  title: string;
  content: string;        // plain text or markdown
  subject?: string | null;
  tags: string[];
  linkedTaskId?: number | null;
  linkedGoalId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateNotePayload = {
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  linkedTaskId?: number;
  linkedGoalId?: number;
};

export type UpdateNotePayload = Partial<CreateNotePayload>;

// ─── PDF / Document Types ─────────────────────────────────────────────────────
// Endpoint prefix: /api/documents

export type DocumentStatus = 'PROCESSING' | 'READY' | 'ERROR';

export type Document = {
  id: number;
  filename: string;
  originalName: string;
  subject?: string | null;
  pageCount: number;
  fileSizeBytes: number;
  status: DocumentStatus;
  summary?: string | null;   // AI-generated summary when ready
  uploadedAt: string;
};

export type DocumentUploadResponse = {
  document: Document;
  uploadUrl?: string;       // presigned URL if S3 or similar
};
