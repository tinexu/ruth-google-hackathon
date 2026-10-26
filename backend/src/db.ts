import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * One SQLite file holds every account and everything kids do. Path comes from
 * DATABASE_PATH, defaulting to backend/var/pip.sqlite (git-ignored). Resolved
 * from process.cwd() like the frontend build path in index.ts, since cwd is
 * backend/ in both dev and prod.
 */
const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'var', 'pip.sqlite');
mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    timezone      TEXT    NOT NULL DEFAULT 'UTC',
    created_at    TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT    NOT NULL
  );

  -- One row per thing a kid has done that can earn XP. item_key keeps each
  -- feed card, battle round and teach card from counting twice.
  CREATE TABLE IF NOT EXISTS activity (
    id         INTEGER PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT    NOT NULL CHECK (kind IN ('feed', 'battle', 'teach')),
    item_key   TEXT    NOT NULL,
    correct    INTEGER NOT NULL DEFAULT 0,
    score      INTEGER NOT NULL DEFAULT 0,
    outcome    TEXT,
    xp         INTEGER NOT NULL DEFAULT 0,
    local_day  TEXT    NOT NULL,
    created_at TEXT    NOT NULL,
    UNIQUE (user_id, kind, item_key)
  );
  CREATE INDEX IF NOT EXISTS activity_user_day ON activity (user_id, local_day);

  -- Every day (in the kid's own time zone) they did something: drives streaks.
  CREATE TABLE IF NOT EXISTS active_days (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day     TEXT    NOT NULL,
    PRIMARY KEY (user_id, day)
  );
`);
