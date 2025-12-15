import Database from "better-sqlite3";

export const db = new Database("tasks.db");

// Create tasks table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    dueDate TEXT,
    priority TEXT DEFAULT 'medium',
    completed INTEGER DEFAULT 0,
    createdAt TEXT
  )
`).run();

