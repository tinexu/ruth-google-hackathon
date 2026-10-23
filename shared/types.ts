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
  /** Total XP needed to reach the next level (drives the Teach page progress bar). */
  nextLevelXp?: number;
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

// ---------- Teach Pip ----------

export type TeachChoiceLetter = 'A' | 'B' | 'C' | 'D';

/** One example card Pip was trained on, e.g. "Password" -> "keep private". */
export interface TeachExample {
  label: string;
  verdict: string;
}

/** A picture or video the card's test case is about. `scene` picks the illustration to render. */
export interface TeachMedia {
  kind: 'video' | 'image';
  scene: 'deepfake-singer';
  /** Describes the media for screen readers. */
  alt: string;
}

export interface TeachChoice {
  letter: TeachChoiceLetter;
  example: TeachExample;
  /** fix = fills the blind spot; repeat = same blind spot again; unsafe = teaches a bad habit. */
  kind: 'fix' | 'repeat' | 'unsafe';
}

/** Full card as stored in backend/data/teach.json, including the answer key. */
export interface TeachCard {
  id: string;
  category: string;
  question: string;
  /** The classic blind-spot examples; their count is how many the kid types while training. */
  examples: TeachExample[];
  /** What Pip asks for in the training step. */
  trainPrompt: string;
  /** Label for the training text box. */
  trainHelp: string;
  /** The two verdicts the kid can give each example, e.g. ["real", "fake"]. */
  labels: [string, string];
  /** Required whenever the question is about a picture or video. */
  media?: TeachMedia;
  /** What Pip sees or hears that trips it up. */
  testCase: string;
  pipMistake: string;
  uhOh: string;
  choices: TeachChoice[];
  /** Pip's reaction to the same test case once the blind spot is fixed. */
  pipFixed: string;
  explanation: string;
  /**
   * If one of the kid's own training examples has this verdict and mentions one of these
   * keywords, the kid already covered the blind spot and Pip passes its test.
   */
  fixVerdict: string;
  fixKeywords: string[];
}

/** What the browser sees before answering: no `kind`, so no answer key. */
export interface PublicTeachCard extends Omit<
  TeachCard,
  'choices' | 'pipFixed' | 'explanation' | 'fixVerdict' | 'fixKeywords'
> {
  choices: { letter: TeachChoiceLetter; example: TeachExample }[];
}

export interface TeachResponse {
  cards: PublicTeachCard[];
}

export interface TeachTrainRequest {
  examples: TeachExample[];
}

export interface TeachTrainResult {
  cardId: string;
  /** The kid's example that already covers the blind spot, if any (then Pip passes). */
  coveredBy: TeachExample | null;
  pipSays: string;
  /** Only sent when the kid's examples already covered the blind spot. */
  explanation?: string;
  xpEarned: number;
}

export interface TeachAnswerRequest {
  letter: TeachChoiceLetter;
}

export interface TeachAnswerResult {
  cardId: string;
  correct: boolean;
  picked: TeachChoice;
  /** Pip's line after this pick (fixed quote if correct). */
  pipSays: string;
  feedback: string;
  /** Only sent once the card is answered correctly. */
  explanation?: string;
  xpEarned: number;
}
