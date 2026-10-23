// Local device preferences (sound, notifications), kept in localStorage.
// Same read/write/subscribe pattern as feed/storage.ts's stats store.

import { useSyncExternalStore } from 'react';

const KEY = 'pip.settings.v1';

export interface Preferences {
  soundEffects: boolean;
  notifications: boolean;
}

const DEFAULTS: Preferences = { soundEffects: true, notifications: true };

function read(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function write(prefs: Preferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or blocked (private mode): the page still works, it just won't remember.
  }
}

const listeners = new Set<() => void>();
let cache = read();

function getSnapshot(): Preferences {
  return cache;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
  cache = { ...cache, [key]: value };
  write(cache);
  listeners.forEach((fn) => fn());
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
