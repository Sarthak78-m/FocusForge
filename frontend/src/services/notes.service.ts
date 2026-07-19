/**
 * notes.service.ts
 *
 * API layer for /api/notes and /api/documents (PDF uploads)
 *
 * Backend status: NOT YET IMPLEMENTED
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Note, CreateNotePayload, UpdateNotePayload } from '@/types/notes';
import type { Document, DocumentUploadResponse } from '@/types/notes';

// ─── Notes ────────────────────────────────────────────────────────────────────

export type GetNotesParams = {
  subject?: string;
  tags?: string[];
  search?: string;
  page?: number;
  size?: number;
};

export const notesService = {
  /**
   * GET /api/notes
   */
  async getNotes(params: GetNotesParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<Note>>>('/notes', {
      params: { ...filters, page, size },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/notes/:noteId
   */
  async getNote(noteId: number) {
    const response = await http.get<ApiResponse<Note>>(`/notes/${noteId}`);
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/notes/recent?limit=N
   */
  async getRecentNotes(limit: number = 5) {
    const response = await http.get<ApiResponse<Note[]>>('/notes/recent', {
      params: { limit },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * POST /api/notes
   */
  async createNote(payload: CreateNotePayload) {
    const response = await http.post<ApiResponse<Note>>('/notes', payload);
    return unwrapApiResponse(response.data);
  },

  /**
   * PUT /api/notes/:noteId
   */
  async updateNote(noteId: number, payload: UpdateNotePayload) {
    const response = await http.put<ApiResponse<Note>>(`/notes/${noteId}`, payload);
    return unwrapApiResponse(response.data);
  },

  /**
   * DELETE /api/notes/:noteId
   */
  async deleteNote(noteId: number) {
    await http.delete<ApiResponse<void>>(`/notes/${noteId}`);
  },
};

// ─── Documents (PDFs) ─────────────────────────────────────────────────────────

export type GetDocumentsParams = {
  subject?: string;
  status?: string;
  page?: number;
  size?: number;
};

export const documentService = {
  /**
   * GET /api/documents
   */
  async getDocuments(params: GetDocumentsParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<Document>>>(
      '/documents',
      { params: { ...filters, page, size } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/documents/recent?limit=N
   */
  async getRecentDocuments(limit: number = 5) {
    const response = await http.get<ApiResponse<Document[]>>('/documents/recent', {
      params: { limit },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * POST /api/documents/upload
   * Multipart form-data file upload.
   * Returns the created Document record (and optional presigned URL).
   */
  async uploadDocument(file: File, subject?: string) {
    const form = new FormData();
    form.append('file', file);
    if (subject) form.append('subject', subject);

    const response = await http.post<ApiResponse<DocumentUploadResponse>>(
      '/documents/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/documents/:documentId
   */
  async getDocument(documentId: number) {
    const response = await http.get<ApiResponse<Document>>(`/documents/${documentId}`);
    return unwrapApiResponse(response.data);
  },

  /**
   * DELETE /api/documents/:documentId
   */
  async deleteDocument(documentId: number) {
    await http.delete<ApiResponse<void>>(`/documents/${documentId}`);
  },
};
