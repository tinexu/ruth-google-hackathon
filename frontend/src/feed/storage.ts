// Saved progress, kept in the browser's localStorage.
// Fine for a demo; with real accounts this moves to a database so progress,
// the friends' scorecard and the teacher/parent report work across devices.

import { useSyncExternalStore } from 'react';
import type { FeedSet, SetResult } from './types';

const KEYS = {
  currentSet: 'pip.feed.currentSet.v1',
  history: 'pip.feed.history.v1',
  stats: 'pip.stats.v1'
} as const;

const MAX_HISTORY = 50;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the page still works, it just won't remember.
  }
}

// ---------- Current set ----------

export function loadCurrentSet(): FeedSet | null {
  const set = read<FeedSet | null>(KEYS.currentSet, null);
  if (!set || !Array.isArray(set.questions) || !Array.isArray(set.answers)) return null;
  if (set.questions.length === 0 || set.answers.length !== set.questions.length) return null;
  return set;
}

export function saveCurrentSet(set: FeedSet): void {
  write(KEYS.currentSet, set);
}

export function isSetComplete(set: FeedSet): boolean {
  return set.answers.every((a) => a !== null);
}

export function firstUnanswered(set: FeedSet): number {
  const i = set.answers.findIndex((a) => a === null);
  return i === -1 ? set.questions.length : i;
}

// ---------- History (for the teacher / parent report) ----------

export function loadHistory(): SetResult[] {
  return read<SetResult[]>(KEYS.history, []);
}

export function archiveSet(set: FeedSet): void {
  const result: SetResult = {
    setId: set.id,
    source: set.source,
    finishedAt: new Date().toISOString(),
    results: set.questions.map((q, i) => {
      const a = set.answers[i];
      return {
        topicId: q.topicId,
        topic: q.topic,
        question: q.question,
        yourAnswer: a ? q.options[a.picked] : '',
        correctAnswer: q.options[q.correctIndex],
        correct: Boolean(a && a.correct)
      };
    })
  };
  write(KEYS.history, [result, ...loadHistory()].slice(0, MAX_HISTORY));
}

// ---------- XP and streak (shown in the top bar on every page) ----------

export interface Stats {
  xp: number;
  streakDays: number;
  /** Local date (YYYY-MM-DD) of the last answered card */
  lastPlayed: string | null;
}

const listeners = new Set<() => void>();
let statsCache: Stats = read<Stats>(KEYS.stats, { xp: 0, streakDays: 0, lastPlayed: null });

function localDate(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
}

/** Call when a card is answered. Adds XP and keeps the streak going. */
export function recordAnswer(xpEarned: number): void {
  const today = localDate();
  let streakDays = statsCache.streakDays;
  if (statsCache.lastPlayed !== today) {
    streakDays = statsCache.lastPlayed === yesterday() ? streakDays + 1 : 1;
  }
  statsCache = { xp: statsCache.xp + xpEarned, streakDays, lastPlayed: today };
  write(KEYS.stats, statsCache);
  listeners.forEach((fn) => fn());
}

function getStats(): Stats {
  return statsCache;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Streak only counts if the kid played today or yesterday. */
export function activeStreak(stats: Stats): number {
  return stats.lastPlayed === localDate() || stats.lastPlayed === yesterday() ? stats.streakDays : 0;
}

export function useStats(): Stats {
  return useSyncExternalStore(subscribe, getStats, getStats);
}
