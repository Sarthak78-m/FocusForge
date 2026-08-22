import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService, GetNotesParams } from '../services/notes.service';
import type { Note, CreateNotePayload, UpdateNotePayload } from '../types/notes';

export const queryKeys = {
  notes: ['notes'] as const,
  note: (id: number) => ['notes', id] as const,
  recentNotes: ['notes', 'recent'] as const,
};

export function useNotes(params?: GetNotesParams) {
  return useQuery<Note[]>({
    queryKey: [...queryKeys.notes, params],
    queryFn: () => notesService.getNotes(params).then(res => res.content),
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: queryKeys.note(id),
    queryFn: () => notesService.getNote(id),
    enabled: !!id,
  });
}

export function useRecentNotes(limit = 5) {
  return useQuery({
    queryKey: queryKeys.recentNotes,
    queryFn: () => notesService.getRecentNotes(limit),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => notesService.createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentNotes });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNotePayload }) => 
      notesService.updateNote(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentNotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.note(variables.id) });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesService.deleteNote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentNotes });
      queryClient.removeQueries({ queryKey: queryKeys.note(id) });
    },
  });
}

export function useToggleFavoriteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { http, unwrapApiResponse } = await import('@/api/http');
      const response = await http.patch('/notes/' + id + '/favorite');
      return unwrapApiResponse(response.data);
    },
    onSuccess: (data: any, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentNotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.note(id) });
    },
  });
}
