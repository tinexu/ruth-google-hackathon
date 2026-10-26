import { createHash, randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { db } from '../db.js';

export const SESSION_COOKIE = 'pip_session';
const SESSION_DAYS = 30;

export interface SessionUser {
  id: number;
  username: string;
  timezone: string;
}

// Only a hash of the token is stored, so a leaked database can't log anyone in.
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export function createSession(res: Response, userId: number): void {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    hashToken(token),
    userId,
    expires.toISOString(),
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });
}

export function destroySession(req: Request, res: Response): void {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

export function currentUser(req: Request): SessionUser | null {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.username, u.timezone, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?`,
    )
    .get(hashToken(token)) as (SessionUser & { expires_at: string }) | undefined;
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return { id: row.id, username: row.username, timezone: row.timezone };
}

/** Rejects the request with 401 unless a kid is signed in; the user lands in res.locals.user. */
export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Please log in first.' });
    return;
  }
  res.locals.user = user;
  next();
}

export function userOf(res: Response): SessionUser {
  return res.locals.user as SessionUser;
}
