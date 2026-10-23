// Shared types for the Pip app: the "My Pip" home page and Prompt Battles.
// Used by both the server (to type the demo data + API responses)
// and the client (to type what it fetches from /api/*).

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

// ---------- Prompt Battles ----------

export type BattleMode = 'picture-twin' | 'literal-robot' | 'secret-word-taboo';

/** A group of synonyms. A group matches when any one of its words appears in the prompt. */
export type KeywordGroup = string[];

export interface PictureElement {
  id: 'subject' | 'action' | 'setting' | 'background' | 'style';
  category: string;
  label: string;
  /** Every group must match for full points; some groups match = half points. */
  groups: KeywordGroup[];
  tip: string;
}

export interface RobotStep {
  id: string;
  label: string;
  groups: KeywordGroup[];
  disaster: string;
}

interface ChallengeBase {
  id: string;
  mode: BattleMode;
  round: number;
  title: string;
  blurb: string;
  pipIntro: string;
  opponentPrompt: string;
}

export interface PictureTwinChallenge extends ChallengeBase {
  mode: 'picture-twin';
  targetPrompt: string;
  elements: PictureElement[];
}

export interface LiteralRobotChallenge extends ChallengeBase {
  mode: 'literal-robot';
  task: string;
  steps: RobotStep[];
}

export interface TabooChallenge extends ChallengeBase {
  mode: 'secret-word-taboo';
  secretWord: string;
  bannedWords: string[];
  /** Word stems that count as using a banned word (e.g. "erupt" catches "eruption"). */
  bannedStems: string[];
  samplePrompt: string;
  /** Any one of these alone makes the AI guess right. */
  strongClues: string[];
  /** Two or more of these together make the AI guess right. */
  weakClues: string[];
  wrongGuesses: string[];
}

/** Full challenge as stored in server/data/battles.json, including the answer key. */
export type BattleChallenge = PictureTwinChallenge | LiteralRobotChallenge | TabooChallenge;

export interface Opponent {
  name: string;
  initial: string;
}

export interface BattlesFile {
  opponent: Opponent;
  challenges: BattleChallenge[];
}

// What the client is allowed to see before playing (no answer keys).

interface PublicBase {
  id: string;
  mode: BattleMode;
  round: number;
  title: string;
  blurb: string;
  pipIntro: string;
}

export interface PublicPictureTwin extends PublicBase {
  mode: 'picture-twin';
  categories: { id: PictureElement['id']; category: string }[];
}

export interface PublicLiteralRobot extends PublicBase {
  mode: 'literal-robot';
  task: string;
  stepCount: number;
}

export interface PublicTaboo extends PublicBase {
  mode: 'secret-word-taboo';
  secretWord: string;
  bannedWords: string[];
  bannedStems: string[];
}

export type PublicChallenge = PublicPictureTwin | PublicLiteralRobot | PublicTaboo;

export interface BattlesResponse {
  opponent: Opponent;
  challenges: PublicChallenge[];
}

// ---------- POST /api/battles/:id/submit ----------

export interface SubmitRequest {
  prompt: string;
}

export type Outcome = 'win' | 'lose' | 'tie';

interface ResultBase {
  challengeId: string;
  score: number;
  outcome: Outcome;
  xpEarned: number;
  coaching: string;
  opponent: { name: string; prompt: string; score: number };
}

export interface ElementScore {
  id: PictureElement['id'];
  category: string;
  label: string;
  points: number;
  matchedGroups: boolean[];
}

export interface PictureTwinResult extends ResultBase {
  mode: 'picture-twin';
  targetPrompt: string;
  elements: ElementScore[];
}

export interface RobotStepResult {
  id: string;
  label: string;
  done: boolean;
  disaster: string;
}

export interface LiteralRobotResult extends ResultBase {
  mode: 'literal-robot';
  task: string;
  steps: RobotStepResult[];
}

export interface TabooResult extends ResultBase {
  mode: 'secret-word-taboo';
  secretWord: string;
  usedBanned: string[];
  aiReply: string;
  success: boolean;
  wordCount: number;
  samplePrompt: string;
}

export type BattleResult = PictureTwinResult | LiteralRobotResult | TabooResult;

export interface ApiError {
  error: string;
}
