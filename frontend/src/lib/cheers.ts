// Cheers, kept in this browser's localStorage. There are no accounts yet, so
// classmates aren't real users: the cheers you send are remembered on this
// device, and the inbox starts with a few cheers from demo classmates that show
// once on My Pip and are gone after you say thanks. Once accounts exist, this
// becomes a server-side inbox that deletes each cheer after it's seen.

import { useSyncExternalStore } from 'react';
import type { PetTier, StatColor } from '@shared/types';

export interface ReceivedCheer {
  id: string;
  fromOwner: string;
  fromPet: string;
  /** So the cheer shows who sent it, drawn the way they look on the leaderboard. */
  fromTier: PetTier;
  fromColor: StatColor;
  /** ISO timestamp. */
  at: string;
}

interface SentCheer {
  toPet: string;
  at: string;
}

interface CheersState {
  sent: SentCheer[];
  inbox: ReceivedCheer[];
}

const KEY = 'pip.cheers.v1';

// [owner, pet, tier, color, hours before your first visit]
const DEMO_CHEERS: [string, string, PetTier, StatColor, number][] = [
  ['Maya', 'Bolt', 'legend', 'mint', 2],
  ['Sam', 'Byte', 'sprout', 'pip-blue', 5],
  ['Leo', 'Sprocket', 'champ', 'coral', 26],
];

function seed(): CheersState {
  const now = Date.now();
  return {
    sent: [],
    inbox: DEMO_CHEERS.map(([fromOwner, fromPet, fromTier, fromColor, hours]) => ({
      id: `demo-${fromPet.toLowerCase()}`,
      fromOwner,
      fromPet,
      fromTier,
      fromColor,
      at: new Date(now - hours * 3_600_000).toISOString(),
    })),
  };
}

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

function read(): CheersState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const state = JSON.parse(raw) as CheersState;
      if (Array.isArray(state.sent) && Array.isArray(state.inbox)) return state;
    }
  } catch {
    // Unreadable or blocked storage: fall through to a fresh start.
  }
  const fresh = seed();
  write(fresh);
  return fresh;
}

function write(state: CheersState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): cheers still work until reload.
  }
}

// One cached snapshot so useSyncExternalStore sees a stable value between changes.
let snapshot: CheersState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): CheersState {
  snapshot ??= read();
  return snapshot;
}

function update(change: (state: CheersState) => CheersState): void {
  snapshot = change(getSnapshot());
  write(snapshot);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCheers() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  return {
    /** Pet names you've cheered today (one cheer per pet per day). */
    cheeredToday: state.sent.filter((c) => isToday(c.at)).map((c) => c.toPet),
    /** Cheers waiting for you, newest first. */
    inbox: [...state.inbox].sort((a, b) => b.at.localeCompare(a.at)),
  };
}

/** Records a cheer for a classmate's pet; only today's cheers are kept. */
export function sendCheer(toPet: string): void {
  update((state) => ({
    ...state,
    sent: [...state.sent.filter((c) => isToday(c.at) && c.toPet !== toPet), { toPet, at: new Date().toISOString() }],
  }));
}

/** Says thanks for a cheer, which removes it from the inbox for good. */
export function thankCheer(id: string): void {
  update((state) => ({ ...state, inbox: state.inbox.filter((c) => c.id !== id) }));
}
