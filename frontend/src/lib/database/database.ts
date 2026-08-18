import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'novanote-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
          const store = db.createObjectStore('notes', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('favorite', 'favorite');
          store.createIndex('folder', 'folder');
        }
        if (!db.objectStoreNames.contains('activity')) {
          db.createObjectStore('activity', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}
