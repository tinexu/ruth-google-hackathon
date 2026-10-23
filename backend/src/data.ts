import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { BattlesFile, HomeData, TeachCard } from '../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoPath = path.join(__dirname, '..', 'data', 'demo.json');
const battlesPath = path.join(__dirname, '..', 'data', 'battles.json');
const teachPath = path.join(__dirname, '..', 'data', 'teach.json');

/**
 * Loads the demo home-page data from disk on every call so edits to
 * demo.json show up without restarting the server. Once real progress
 * tracking exists, this is the function to swap out for a DB read.
 */
export function loadHomeData(): HomeData {
  const raw = readFileSync(demoPath, 'utf-8');
  return JSON.parse(raw) as HomeData;
}

/**
 * Loads the Prompt Battle challenges, including their answer keys.
 * Never send this straight to the browser; see toPublicChallenge in routes/battles.ts.
 */
export function loadBattles(): BattlesFile {
  const raw = readFileSync(battlesPath, 'utf-8');
  return JSON.parse(raw) as BattlesFile;
}

/** Loads the Teach Pip cards, including which choice fixes each blind spot. */
export function loadTeachCards(): TeachCard[] {
  const raw = readFileSync(teachPath, 'utf-8');
  return (JSON.parse(raw) as { cards: TeachCard[] }).cards;
}
