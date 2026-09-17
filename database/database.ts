import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;
let initializing: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase() {
  if (database) {
    return database;
  }

  if (initializing) {
    return initializing;
  }

  initializing = (async () => {
    const db = await SQLite.openDatabaseAsync(
      'scattertag.db'
    );

   await db.runAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'note',
      import_id TEXT
    )
  `);

    await db.runAsync(`
      ALTER TABLE notes
      ADD COLUMN import_id TEXT
    `).catch(() => {
      // Column already exists.
    });

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
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL UNIQUE
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS note_hashtags (
        note_id INTEGER NOT NULL,
        hashtag_id TEXT NOT NULL,
        PRIMARY KEY (note_id, hashtag_id),
        FOREIGN KEY (note_id)
          REFERENCES notes(id)
          ON DELETE CASCADE,
        FOREIGN KEY (hashtag_id)
          REFERENCES hashtags(id)
          ON DELETE CASCADE
      )
    `);

    database = db;
    initializing = null;

    return db;
  })();

  try {
    return await initializing;
  } catch (error) {
    initializing = null;
    database = null;
    throw error;
  }
}