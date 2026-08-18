import { getDB } from './database';
import type { Note, Activity } from '../../types';

export const notesRepo = {
  async getAll(): Promise<Note[]> {
    const db = await getDB();
    return db.getAll('notes');
  },
  async getById(id: string): Promise<Note | undefined> {
    const db = await getDB();
    return db.get('notes', id);
  },
  async put(note: Note): Promise<void> {
    const db = await getDB();
    await db.put('notes', note);
  },
  async bulkPut(notes: Note[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('notes', 'readwrite');
    await Promise.all(notes.map((n) => tx.store.put(n)));
    await tx.done;
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('notes', id);
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('notes');
  },
};

export const activityRepo = {
  async getAll(): Promise<Activity[]> {
    const db = await getDB();
    return (await db.getAll('activity')) as Activity[];
  },
  async add(activity: Activity): Promise<void> {
    const db = await getDB();
    await db.put('activity', activity);
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('activity');
  },
};

export const metaRepo = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const db = await getDB();
    const rec = await db.get('meta', key);
    return rec?.value as T | undefined;
  },
  async set(key: string, value: unknown): Promise<void> {
    const db = await getDB();
    await db.put('meta', { key, value });
  },
};
