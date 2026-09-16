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



  return db;
}