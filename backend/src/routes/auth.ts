import { Router } from 'express';
import type { ApiError, AuthRequest, AuthUser } from '../../../shared/types.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { createSession, currentUser, destroySession } from '../auth/sessions.js';
import { db } from '../db.js';
import { rateLimit } from '../rateLimit.js';

export const authRouter = Router();

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;

// Nicknames show up on the class leaderboard, so keep them kid-safe and not
// personal. This list is a starting point, not real moderation.
const BLOCKED_WORDS = ['fuck', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'slut', 'whore', 'nazi', 'porn', 'sex'];

function nicknameProblem(username: string): string | null {
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return 'Nicknames are 3 to 20 letters, numbers or underscores.';
  }
  if (!/[A-Za-z]/.test(username)) return 'Nicknames need at least one letter.';
  if (/\d{5,}/.test(username)) return 'Too many numbers in a row. Please don’t use a phone number.';
  const lower = username.toLowerCase();
  if (BLOCKED_WORDS.some((w) => lower.includes(w))) return 'Please pick a friendlier nickname.';
  return null;
}

function validTimezone(tz: unknown): string {
  if (typeof tz !== 'string') return 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

// Slows down password guessing and mass sign-ups from one place.
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many tries. Take a break and try again in a few minutes.',
});

// POST /api/auth/signup { username, password, timezone } -> AuthUser
authRouter.post('/auth/signup', authLimit, async (req, res) => {
  const { username, password, timezone } = (req.body ?? {}) as Partial<AuthRequest>;
  const name = typeof username === 'string' ? username.trim() : '';
  const problem = nicknameProblem(name);
  if (problem) {
    res.status(400).json({ error: problem } satisfies ApiError);
    return;
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    res.status(400).json({ error: `Passwords need at least ${MIN_PASSWORD} characters.` } satisfies ApiError);
    return;
  }
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(name)) {
    res.status(409).json({ error: 'That nickname is taken. Try another one!' } satisfies ApiError);
    return;
  }

  const hash = await hashPassword(password);
  const result = db
    .prepare('INSERT INTO users (username, password_hash, timezone, created_at) VALUES (?, ?, ?, ?)')
    .run(name, hash, validTimezone(timezone), new Date().toISOString());
  createSession(res, Number(result.lastInsertRowid));
  res.status(201).json({ username: name } satisfies AuthUser);
});

// POST /api/auth/login { username, password, timezone } -> AuthUser
authRouter.post('/auth/login', authLimit, async (req, res) => {
  const { username, password, timezone } = (req.body ?? {}) as Partial<AuthRequest>;
  const row =
    typeof username === 'string'
      ? (db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username.trim()) as
          | { id: number; username: string; password_hash: string }
          | undefined)
      : undefined;
  const ok = row && typeof password === 'string' && (await verifyPassword(password, row.password_hash));
  if (!row || !ok) {
    res.status(401).json({ error: 'That nickname and password don’t match.' } satisfies ApiError);
    return;
  }
  db.prepare('UPDATE users SET timezone = ? WHERE id = ?').run(validTimezone(timezone), row.id);
  createSession(res, row.id);
  res.json({ username: row.username } satisfies AuthUser);
});

// POST /api/auth/logout
authRouter.post('/auth/logout', (req, res) => {
  destroySession(req, res);
  res.status(204).end();
});

// GET /api/auth/me -> AuthUser, or 401 when signed out
authRouter.get('/auth/me', (req, res) => {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not logged in.' } satisfies ApiError);
    return;
  }
  res.json({ username: user.username } satisfies AuthUser);
});
