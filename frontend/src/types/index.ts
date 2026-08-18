export interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  folder: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
}

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
