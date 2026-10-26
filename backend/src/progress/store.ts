import type { SessionUser } from '../auth/sessions.js';
import { db } from '../db.js';

/** YYYY-MM-DD in the kid's own time zone. */
export function localDay(timezone: string, date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function markActive(user: SessionUser, day: string): void {
  db.prepare('INSERT OR IGNORE INTO active_days (user_id, day) VALUES (?, ?)').run(user.id, day);
}

/**
 * Records one feed card. Returns the XP actually earned: 0 if this card was
 * already counted, so refreshing or resubmitting can't farm XP.
 */
export function recordFeedAnswer(user: SessionUser, itemKey: string, correct: boolean, xp: number): number {
  const day = localDay(user.timezone);
  markActive(user, day);
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO activity (user_id, kind, item_key, correct, xp, local_day, created_at)
       VALUES (?, 'feed', ?, ?, ?, ?, ?)`,
    )
    .run(user.id, itemKey, correct ? 1 : 0, correct ? xp : 0, day, new Date().toISOString());
  return result.changes > 0 && correct ? xp : 0;
}

/**
 * Records a battle round. XP only on the first play of each round; the best
 * score and outcome are kept so stats and skills reflect the kid's best try.
 */
export function recordBattle(
  user: SessionUser,
  challengeId: string,
  score: number,
  outcome: string,
  xp: number,
): number {
  const day = localDay(user.timezone);
  markActive(user, day);
  const now = new Date().toISOString();
  const inserted = db
    .prepare(
      `INSERT OR IGNORE INTO activity (user_id, kind, item_key, score, outcome, xp, local_day, created_at)
       VALUES (?, 'battle', ?, ?, ?, ?, ?, ?)`,
    )
    .run(user.id, challengeId, score, outcome, xp, day, now);
  if (inserted.changes > 0) return xp;
  db.prepare(
    `UPDATE activity SET score = ?, outcome = ?, local_day = ?
      WHERE user_id = ? AND kind = 'battle' AND item_key = ? AND score < ?`,
  ).run(score, outcome, day, user.id, challengeId, score);
  return 0;
}

/** Records a fixed Train card. XP only the first time each card is fixed. */
export function recordTeachFix(user: SessionUser, cardId: string, xp: number): number {
  const day = localDay(user.timezone);
  markActive(user, day);
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO activity (user_id, kind, item_key, correct, xp, local_day, created_at)
       VALUES (?, 'teach', ?, 1, ?, ?, ?)`,
    )
    .run(user.id, cardId, xp, day, new Date().toISOString());
  return result.changes > 0 ? xp : 0;
}

/** Notes a day of activity that earned nothing (e.g. a Train card that wasn't fixed yet). */
export function touchActiveDay(user: SessionUser): void {
  markActive(user, localDay(user.timezone));
}

export interface ActivitySummary {
  xp: number;
  /** Activity on `today` (the day passed to summarize). */
  today: { xp: number; feed: number; battle: number; teach: number };
  feedCorrect: number;
  feedCorrectThisWeek: number;
  feedAnsweredThisWeek: number;
  teachFixedIds: string[];
  battleBestScores: Map<string, number>;
  battleWinsThisWeek: number;
  activeDays: string[];
}

export function summarize(userId: number, weekStart: string, today = ''): ActivitySummary {
  const rows = db
    .prepare('SELECT kind, item_key, correct, score, outcome, xp, local_day FROM activity WHERE user_id = ?')
    .all(userId) as {
    kind: 'feed' | 'battle' | 'teach';
    item_key: string;
    correct: number;
    score: number;
    outcome: string | null;
    xp: number;
    local_day: string;
  }[];
  const days = db
    .prepare('SELECT day FROM active_days WHERE user_id = ? ORDER BY day DESC')
    .all(userId) as { day: string }[];

  const s: ActivitySummary = {
    xp: 0,
    today: { xp: 0, feed: 0, battle: 0, teach: 0 },
    feedCorrect: 0,
    feedCorrectThisWeek: 0,
    feedAnsweredThisWeek: 0,
    teachFixedIds: [],
    battleBestScores: new Map(),
    battleWinsThisWeek: 0,
    activeDays: days.map((d) => d.day),
  };
  for (const r of rows) {
    s.xp += r.xp;
    if (r.local_day === today) {
      s.today.xp += r.xp;
      s.today[r.kind] += 1;
    }
    const thisWeek = r.local_day >= weekStart;
    if (r.kind === 'feed') {
      if (r.correct) s.feedCorrect += 1;
      if (thisWeek) {
        s.feedAnsweredThisWeek += 1;
        if (r.correct) s.feedCorrectThisWeek += 1;
      }
    } else if (r.kind === 'teach') {
      s.teachFixedIds.push(r.item_key);
    } else {
      s.battleBestScores.set(r.item_key, r.score);
      if (thisWeek && r.outcome === 'win') s.battleWinsThisWeek += 1;
    }
  }
  return s;
}

/** Everyone's total XP, for the leaderboard. */
export function allPlayers(): { id: number; username: string; createdAt: string; xp: number }[] {
  return db
    .prepare(
      `SELECT u.id, u.username, u.created_at AS createdAt, COALESCE(SUM(a.xp), 0) AS xp
         FROM users u LEFT JOIN activity a ON a.user_id = u.id
        GROUP BY u.id
        ORDER BY xp DESC, u.created_at ASC`,
    )
    .all() as { id: number; username: string; createdAt: string; xp: number }[];
}
