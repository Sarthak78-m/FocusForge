export type { Note } from './notes';

export type ActivityType = 'create' | 'edit' | 'link' | 'tag' | 'favorite';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: number;
  noteId?: string;
}

export type Theme = 'dark' | 'light';

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
}

export interface AppStats {
  totalNotes: number;
  totalWords: number;
  totalLinks: number;
  totalTags: number;
}
