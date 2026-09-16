import { getDatabase } from './database';

export async function createNote(
  text: string,
  isPinned = false
): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO notes
      (text, created_at, updated_at, is_pinned, type)
     VALUES (?, ?, ?, ?, 'note')`,
    text,
    now,
    now,
    isPinned ? 1 : 0
  );

  return result.lastInsertRowId;
}

export async function createList(
  items: {
    text: string;
    completed: boolean;
  }[]
): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO notes
      (text, created_at, updated_at, is_pinned, type)
     VALUES (?, ?, ?, 0, 'list')`,
    'Checklist',
    now,
    now
  );

  const noteId = result.lastInsertRowId;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    await db.runAsync(
      `INSERT INTO list_items
        (note_id, text, position, is_completed)
       VALUES (?, ?, ?, ?)`,
      noteId,
      item.text,
      i,
      item.completed ? 1 : 0
    );
  }

  return noteId;
}

export async function getNotes() {
  const db = await getDatabase();

  return db.getAllAsync<{
    id: number;
    text: string;
    created_at: string;
    updated_at: string;
    is_pinned: number;
    type: string;
  }>(
    `SELECT *
     FROM notes
     ORDER BY is_pinned DESC, created_at DESC`
  );
}

export async function getListItems(
  noteId: number
) {
  const db = await getDatabase();

  return db.getAllAsync<{
    id: number;
    note_id: number;
    text: string;
    position: number;
    is_completed: number;
  }>(
    `SELECT *
     FROM list_items
     WHERE note_id = ?
     ORDER BY position ASC`,
    noteId
  );
}

export async function deleteNote(
  id: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM notes WHERE id = ?`,
    id
  );
}

export async function deleteNoteAndItems(
  noteId: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM list_items
     WHERE note_id = ?`,
    noteId
  );

  await db.runAsync(
    `DELETE FROM note_hashtags
     WHERE note_id = ?`,
    noteId
  );

  await db.runAsync(
    `DELETE FROM notes
     WHERE id = ?`,
    noteId
  );
}

export async function toggleListItem(
  itemId: number,
  completed: boolean
) {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE list_items
     SET is_completed = ?
     WHERE id = ?`,
    completed ? 1 : 0,
    itemId
  );
}

export async function updateListItem(
  itemId: number,
  text: string
) {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE list_items
     SET text = ?
     WHERE id = ?`,
    text,
    itemId
  );
}

export async function addListItem(
  noteId: number,
  text: string,
  position: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO list_items
      (note_id, text, position, is_completed)
     VALUES (?, ?, ?, 0)`,
    noteId,
    text,
    position
  );
}

export async function deleteListItem(
  itemId: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM list_items
     WHERE id = ?`,
    itemId
  );
}

export async function updateNotePin(
  noteId: number,
  isPinned: boolean
) {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE notes
     SET is_pinned = ?,
         updated_at = ?
     WHERE id = ?`,
    isPinned ? 1 : 0,
    new Date().toISOString(),
    noteId
  );
}

export async function updateNoteText(
  noteId: number,
  text: string
) {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE notes
     SET text = ?,
         updated_at = ?
     WHERE id = ?`,
    text,
    new Date().toISOString(),
    noteId
  );
}

export async function addHashtagsToNote(
  noteId: number,
  hashtags: string[]
) {
  const db = await getDatabase();

  for (const hashtag of hashtags) {
    const name = hashtag
      .trim()
      .replace(/^#/, '')
      .toLowerCase();

    if (!name) {
      continue;
    }

    const existingTag =
      await db.getFirstAsync<{
        id: string;
      }>(
        `SELECT id
         FROM hashtags
         WHERE name = ?`,
        name
      );

    let hashtagId: string;

    if (existingTag) {
      hashtagId = existingTag.id;
    } else {
      hashtagId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}`;

      await db.runAsync(
        `INSERT INTO hashtags
          (id, user_id, name)
         VALUES (?, ?, ?)`,
        hashtagId,
        'local',
        name
      );
    }

    await db.runAsync(
      `INSERT OR IGNORE INTO note_hashtags
        (note_id, hashtag_id)
       VALUES (?, ?)`,
      noteId,
      hashtagId
    );
  }
}

export async function getNoteHashtags(
  noteId: number
) {
  const db = await getDatabase();

  return db.getAllAsync<{
    id: string;
    name: string;
  }>(
    `SELECT hashtags.id, hashtags.name
     FROM hashtags
     INNER JOIN note_hashtags
       ON hashtags.id = note_hashtags.hashtag_id
     WHERE note_hashtags.note_id = ?
     ORDER BY hashtags.name ASC`,
    noteId
  );
}

export async function getHashtags() {
  const db = await getDatabase();

  return db.getAllAsync<{
    id: string;
    name: string;
    note_count: number;
  }>(
    `SELECT
       hashtags.id,
       hashtags.name,
       COUNT(note_hashtags.note_id) AS note_count
     FROM hashtags
     LEFT JOIN note_hashtags
       ON hashtags.id = note_hashtags.hashtag_id
     GROUP BY hashtags.id
     ORDER BY hashtags.name ASC`
  );
}

export async function getNotesByHashtag(
  hashtag: string
) {
  const db = await getDatabase();

  const name = hashtag
    .trim()
    .replace(/^#/, '')
    .toLowerCase();

  return db.getAllAsync<{
    id: number;
    text: string;
    created_at: string;
    updated_at: string;
    is_pinned: number;
    type: string;
  }>(
    `SELECT notes.*
     FROM notes
     INNER JOIN note_hashtags
       ON notes.id = note_hashtags.note_id
     INNER JOIN hashtags
       ON hashtags.id = note_hashtags.hashtag_id
     WHERE hashtags.name = ?
     ORDER BY notes.is_pinned DESC,
              notes.created_at DESC`,
    name
  );
}

/*
 * TEMPORARY DEVELOPMENT RESET
 *
 * This removes all development notes,
 * checklist items, and note/hashtag links.
 *
 * Hashtag definitions themselves are also
 * removed so we start completely clean.
 */
export async function resetDevelopmentDatabase() {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM note_hashtags`
  );

  await db.runAsync(
    `DELETE FROM list_items`
  );

  await db.runAsync(
    `DELETE FROM notes`
  );

  await db.runAsync(
    `DELETE FROM hashtags`
  );

  console.log(
    'Development database reset complete'
  );
}

export async function debugHashtagSchema() {
  const db = await getDatabase();

  const hashtagColumns =
    await db.getAllAsync(
      `PRAGMA table_info(hashtags)`
    );

  const linkColumns =
    await db.getAllAsync(
      `PRAGMA table_info(note_hashtags)`
    );

  const hashtags =
    await db.getAllAsync(
      `SELECT * FROM hashtags`
    );

  const links =
    await db.getAllAsync(
      `SELECT * FROM note_hashtags`
    );

  console.log(
    'HASHTAGS COLUMNS:',
    hashtagColumns
  );

  console.log(
    'LINK COLUMNS:',
    linkColumns
  );

  console.log(
    'HASHTAGS DATA:',
    hashtags
  );

  console.log(
    'LINK DATA:',
    links
  );
}