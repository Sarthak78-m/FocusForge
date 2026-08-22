import { create } from 'zustand';
import type { Note, Activity, AppStats } from '../types';
import { notesRepo, activityRepo } from '../lib/database/notesRepository';
import { generateId, countWords, countLinks } from '../lib/utils';
import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';

interface NoteState {
  notes: Note[];
  activity: Activity[];
  activeNoteId: string | null;
  initialized: boolean;
  loading: boolean;
  isBackendSynced: boolean;

  initialize: () => Promise<void>;
  createNote: () => Promise<string>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setActiveNote: (id: string | null) => void;
  getStats: () => AppStats;
  getRecent: (limit?: number) => Note[];
  getFavorites: () => Note[];
}

export const useNoteStore = create<NoteState>()((set, get) => ({
  notes: [],
  activity: [],
  activeNoteId: null,
  initialized: false,
  loading: false,
  isBackendSynced: false,

  initialize: async () => {
    if (get().initialized || get().loading) return;
    set({ loading: true });

    // 1. Try fetching from Spring Boot Backend
    try {
      const response = await http.get<ApiResponse<Note[]>>('/notes');
      const serverNotes = unwrapApiResponse(response.data);
      if (Array.isArray(serverNotes) && serverNotes.length > 0) {
        await notesRepo.bulkPut(serverNotes);
        set({
          notes: [...serverNotes].sort((a, b) => b.updatedAt - a.updatedAt),
          initialized: true,
          loading: false,
          isBackendSynced: true,
        });
        return;
      }
    } catch {
      // Backend offline or unauthenticated — continue to local IndexedDB
    }

    // 2. Load from Local IndexedDB
    const notes = await notesRepo.getAll();
    const activity = (await activityRepo.getAll()) as Activity[];

    set({
      notes: [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
      activity: [...activity].sort((a, b) => b.timestamp - a.timestamp),
      initialized: true,
      loading: false,
      isBackendSynced: false,
    });
  },


  createNote: async () => {
    const now = Date.now();
    const id = generateId();
    const note: Note = {
      id,
      title: 'Untitled',
      content: '',
      preview: '',
      folder: 'Inbox',
      tags: [],
      favorite: false,
      createdAt: now,
      updatedAt: now,
      wordCount: 0,
    };

    // Save locally
    await notesRepo.put(note);

    const activity: Activity = {
      id: generateId(),
      type: 'create',
      description: `You created "Untitled"`,
      timestamp: now,
      noteId: id,
    };
    await activityRepo.add(activity);

    set((s) => ({
      notes: [note, ...s.notes],
      activity: [activity, ...s.activity].slice(0, 50),
    }));

    // Async sync to Backend
    http.post<ApiResponse<Note>>('/notes', note).catch((err) => {
      console.error('Failed to sync note creation to backend:', err);
    });

    return id;
  },

  updateNote: async (id, patch) => {
    const existing = get().notes.find((n) => n.id === id);
    if (!existing) return;
    const updated: Note = {
      ...existing,
      ...patch,
      updatedAt: Date.now(),
    };
    if (patch.content !== undefined) {
      updated.wordCount = countWords(updated.content);
      updated.preview = updated.content.replace(/\n+/g, ' ').slice(0, 140).trim();
    }

    // Save locally
    await notesRepo.put(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }));

    // Async sync to Backend
    http.put<ApiResponse<Note>>(`/notes/${id}`, updated).catch((err) => {
      console.error('Failed to sync note update to backend:', err);
    });
  },

  deleteNote: async (id) => {
    await notesRepo.delete(id);
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
    }));

    // Async sync to Backend
    http.delete(`/notes/${id}`).catch((err) => {
      console.error('Failed to sync note deletion to backend:', err);
    });
  },

  toggleFavorite: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const updated: Note = { ...note, favorite: !note.favorite, updatedAt: Date.now() };
    await notesRepo.put(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
    }));

    // Async sync to Backend
    http.patch(`/notes/${id}/favorite`).catch((err) => {
      console.error('Failed to sync note favorite toggle to backend:', err);
    });
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  getStats: () => {
    const notes = get().notes;
    const totalWords = notes.reduce((acc, n) => acc + n.wordCount, 0);
    const totalLinks = notes.reduce((acc, n) => acc + countLinks(n.content), 0);
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return {
      totalNotes: notes.length,
      totalWords,
      totalLinks,
      totalTags: tagSet.size,
    };
  },

  getRecent: (limit = 6) => {
    return [...get().notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  },

  getFavorites: () => {
    return get().notes.filter((n) => n.favorite).sort((a, b) => b.updatedAt - a.updatedAt);
  },
}));

