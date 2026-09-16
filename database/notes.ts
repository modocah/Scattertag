import { getDatabase } from './database';

export async function createNote(
  text: string,
  isPinned = false
): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO notes (text, created_at, updated_at, is_pinned, type)
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

export async function getListItems(noteId: number) {
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

export async function deleteNote(id: number) {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM notes WHERE id = ?`,
    id
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
    `DELETE FROM notes
     WHERE id = ?`,
    noteId
  );
}