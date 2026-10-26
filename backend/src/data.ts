import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { BattlesFile, Skill, Stat, TeachCard } from '../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const progressionPath = path.join(__dirname, '..', 'data', 'progression.json');
const battlesPath = path.join(__dirname, '..', 'data', 'battles.json');
const teachPath = path.join(__dirname, '..', 'data', 'teach.json');

export interface Progression {
  petName: string;
  /** Total XP needed for each level, starting with level 1 (0 XP). */
  levelXp: number[];
  /** XP per level once the table runs out. */
  levelXpAfterTable: number;
  stats: Omit<Stat, 'value'>[];
  skills: (Pick<Skill, 'id' | 'name' | 'description' | 'icon'> & {
    unlockLevel: number;
    metric: 'feedCorrect' | 'teachFixed' | 'battleGood' | 'safetyFixed';
    /** Activity needed for skill level 1, 2, 3. */
    thresholds: number[];
    hint: string;
  })[];
  totalSkills: number;
  /** Train cards that count toward the Safety shield skill. */
  safetyCardIds: string[];
  tiers: {
    tier: string;
    name: string;
    levelRange: string;
    description: string;
    startLevel: number;
    petTitle: string;
    upgradeDescription?: string;
  }[];
}

/**
 * Loads the game-rules content (stat labels, skills, levels, growth tiers).
 * Read on every call so edits show up without restarting the server. Kids'
 * actual numbers come from the database via src/progress/rules.ts.
 */
export function loadProgression(): Progression {
  const raw = readFileSync(progressionPath, 'utf-8');
  return JSON.parse(raw) as Progression;
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
