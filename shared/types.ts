// Shared types for the Pip "My Pip" home page.
// Used by both the server (to type the demo data + API response)
// and the client (to type what it fetches from /api/home).

export interface Kid {
  name: string;
  streakDays: number;
  xp: number;
}

export type PetMood = 'curious' | 'happy' | 'worried' | 'sleepy';

export interface Pet {
  name: string;
  level: number;
  levelTitle: string;
  mood: PetMood;
  speech: string;
  /** Overall health report card grade, e.g. "B+" */
  grade: string;
}

export type StatColor = 'sun' | 'pip-blue' | 'coral' | 'mint';

export interface Stat {
  key: 'energy' | 'smarts' | 'fairness' | 'promptPower' | 'friendship';
  label: string;
  value: number; // 0-100
  color: StatColor;
  note: string;
}

export interface Weekly {
  cardsThisWeek: number;
  battlesWon: number;
  fakesCaught: number;
}

export type SkillStatus = 'mastered' | 'in-progress' | 'training' | 'locked';

export interface Skill {
  id: string;
  name: string;
  description: string;
  status: SkillStatus;
  icon: 'search' | 'bulb' | 'pencil' | 'shield' | 'scale' | 'eye';
  level: number;
  maxLevel: number;
  /** Shown instead of the level bar note for in-training / locked cards */
  note?: string;
}

export interface HomeData {
  kid: Kid;
  pet: Pet;
  stats: Stat[];
  weekly: Weekly;
  skills: Skill[];
  /** Total skills in the curriculum (more unlock later than the cards shown here). */
  totalSkills: number;
}
