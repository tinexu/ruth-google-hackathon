// Shapes shared by the feed. FeedQuestion matches what server.js returns
// from POST /api/feed/questions.

export type ArtifactKind = 'chat' | 'email' | 'post' | 'prompts' | 'none';

export interface ArtifactLine {
  label: string;
  text: string;
}

export interface FeedQuestion {
  id: string;
  topicId: number;
  /** Full topic name, e.g. "Hallucinations" */
  topic: string;
  /** Short label for the yellow card's tag, e.g. "CATCH THE BOT" */
  tag: string;
  /** Text for the "Why am I seeing this?" panel */
  why: string;
  /** What Pip says to set up the challenge */
  intro: string;
  artifactKind: ArtifactKind;
  artifactLines: ArtifactLine[];
  question: string;
  /** Always exactly 4 */
  options: string[];
  /** 0-based index into options */
  correctIndex: number;
  explanation: string;
  pipRight: string;
  pipWrong: string;
}

export interface FeedAnswer {
  picked: number;
  correct: boolean;
  answeredAt: string;
}

export interface FeedSet {
  id: string;
  /** "backup" = built-in practice cards used when Gemini can't be reached */
  source: 'gemini' | 'backup';
  createdAt: string;
  questions: FeedQuestion[];
  /** Same length as questions; null until answered */
  answers: (FeedAnswer | null)[];
  /** True once the finished set has been written to history */
  archived?: boolean;
}

/** One finished set, kept for the teacher / parent report (missed questions). */
export interface SetResult {
  setId: string;
  source: FeedSet['source'];
  finishedAt: string;
  results: {
    topicId: number;
    topic: string;
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    correct: boolean;
  }[];
}

export const XP_PER_CORRECT = 20;
export const QUESTIONS_PER_SET = 4;
