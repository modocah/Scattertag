import * as SQLite from 'expo-sqlite';

export async function getDatabase() {
  const db = await SQLite.openDatabaseAsync('scattertag.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'note'
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      position INTEGER NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS hashtags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS note_hashtags (
      note_id INTEGER NOT NULL,
      hashtag_id INTEGER NOT NULL,
      PRIMARY KEY (note_id, hashtag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
    )
  `);

  return db;
}