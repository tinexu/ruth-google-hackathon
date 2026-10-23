// Rule-based grader used until Gemini is wired in. It checks prompts for
// keywords from the answer key in server/data/battles.json.

import type {
  BattleChallenge,
  BattleResult,
  ElementScore,
  LiteralRobotChallenge,
  Outcome,
  PictureTwinChallenge,
  RobotStepResult,
  TabooChallenge,
} from '../../../shared/types.js';
import { hasPhrase, matchesGroup, normalize, words } from './match.js';

const XP: Record<Outcome, number> = { win: 40, tie: 30, lose: 20 };

function outcomeOf(score: number, opponentScore: number): Outcome {
  if (score > opponentScore) return 'win';
  if (score < opponentScore) return 'lose';
  return 'tie';
}

// ---------- Picture Twin ----------

function scorePicture(challenge: PictureTwinChallenge, prompt: string): ElementScore[] {
  const text = normalize(prompt);
  return challenge.elements.map((el) => {
    const matchedGroups = el.groups.map((g) => matchesGroup(text, g));
    const hits = matchedGroups.filter(Boolean).length;
    const points = hits === el.groups.length ? 20 : hits > 0 ? 10 : 0;
    return { id: el.id, category: el.category, label: el.label, points, matchedGroups };
  });
}

function gradePictureTwin(
  challenge: PictureTwinChallenge,
  prompt: string,
  opponentName: string,
): BattleResult {
  const elements = scorePicture(challenge, prompt);
  const score = elements.reduce((sum, e) => sum + e.points, 0);
  const opponentScore = scorePicture(challenge, challenge.opponentPrompt).reduce(
    (sum, e) => sum + e.points,
    0,
  );
  const outcome = outcomeOf(score, opponentScore);

  const missed = challenge.elements.filter((_, i) => elements[i].points < 20);
  let coaching: string;
  if (missed.length === 0) {
    coaching = "Twins! You described every detail, so I didn't have to guess anything.";
  } else {
    const first = missed[0];
    coaching = `I can only draw what you tell me. You didn't fully describe the ${first.category.toLowerCase()}, so I guessed. Try adding "${first.tip}."`;
    if (missed.length > 1) coaching += ` I had to guess ${missed.length} things in total.`;
  }

  return {
    mode: 'picture-twin',
    challengeId: challenge.id,
    score,
    outcome,
    xpEarned: XP[outcome],
    coaching,
    opponent: { name: opponentName, prompt: challenge.opponentPrompt, score: opponentScore },
    targetPrompt: challenge.targetPrompt,
    elements,
  };
}

// ---------- Literal Robot ----------

function scoreRobot(challenge: LiteralRobotChallenge, prompt: string): RobotStepResult[] {
  const text = normalize(prompt);
  return challenge.steps.map((step) => ({
    id: step.id,
    label: step.label,
    done: step.groups.every((g) => matchesGroup(text, g)),
    disaster: step.disaster,
  }));
}

function gradeLiteralRobot(
  challenge: LiteralRobotChallenge,
  prompt: string,
  opponentName: string,
): BattleResult {
  const steps = scoreRobot(challenge, prompt);
  const score = steps.filter((s) => s.done).length * 20;
  const opponentScore =
    scoreRobot(challenge, challenge.opponentPrompt).filter((s) => s.done).length * 20;
  const outcome = outcomeOf(score, opponentScore);

  const missed = steps.filter((s) => !s.done);
  const coaching =
    missed.length === 0
      ? "Bolt made perfect ramen! You didn't skip a single step. Robots need every step spelled out."
      : `Bolt has zero common sense. It only follows your words. Add a step like "${missed[0].label.toLowerCase()}."`;

  return {
    mode: 'literal-robot',
    challengeId: challenge.id,
    score,
    outcome,
    xpEarned: XP[outcome],
    coaching,
    opponent: { name: opponentName, prompt: challenge.opponentPrompt, score: opponentScore },
    task: challenge.task,
    steps,
  };
}

// ---------- Secret Word Taboo ----------

interface TabooAttempt {
  score: number;
  success: boolean;
  usedBanned: string[];
  aiReply: string;
  wordCount: number;
}

function playTaboo(challenge: TabooChallenge, prompt: string): TabooAttempt {
  const tokens = words(prompt);
  const wordCount = tokens.length;
  const usedBanned = [
    ...new Set(
      tokens.filter((t) => challenge.bannedStems.some((stem) => t.toLowerCase().startsWith(stem))),
    ),
  ];
  if (usedBanned.length > 0) {
    return {
      score: 0,
      success: false,
      usedBanned,
      aiReply: 'BUZZ! Banned word spotted.',
      wordCount,
    };
  }

  const text = normalize(prompt);
  const strong = challenge.strongClues.some((c) => hasPhrase(text, c));
  const weakHits = challenge.weakClues.filter((c) => hasPhrase(text, c)).length;
  if (strong || weakHits >= 2) {
    const score = Math.max(40, 100 - 5 * Math.max(0, wordCount - 5));
    return { score, success: true, usedBanned, aiReply: `${challenge.secretWord}!`, wordCount };
  }

  const guess = challenge.wrongGuesses[wordCount % challenge.wrongGuesses.length];
  return { score: 10, success: false, usedBanned, aiReply: guess, wordCount };
}

function gradeTaboo(challenge: TabooChallenge, prompt: string, opponentName: string): BattleResult {
  const attempt = playTaboo(challenge, prompt);
  const opponentScore = playTaboo(challenge, challenge.opponentPrompt).score;
  const outcome = outcomeOf(attempt.score, opponentScore);

  let coaching: string;
  if (attempt.usedBanned.length > 0) {
    coaching = `Buzz! You typed "${attempt.usedBanned[0]}", and that's off limits. Try a famous example instead of the obvious clue.`;
  } else if (!attempt.success) {
    coaching =
      "I couldn't figure it out from those clues, so I guessed. Try naming a famous example, like a real place or a science fair project.";
  } else if (attempt.score === 100) {
    coaching = `Perfect! Only ${attempt.wordCount} words and I said it right away. A famous example is a super-short clue.`;
  } else {
    coaching = `You got me to say it in ${attempt.wordCount} words! Shorter prompts score higher. Can you cut a few words?`;
  }

  return {
    mode: 'secret-word-taboo',
    challengeId: challenge.id,
    score: attempt.score,
    outcome,
    xpEarned: XP[outcome],
    coaching,
    opponent: { name: opponentName, prompt: challenge.opponentPrompt, score: opponentScore },
    secretWord: challenge.secretWord,
    usedBanned: attempt.usedBanned,
    aiReply: attempt.aiReply,
    success: attempt.success,
    wordCount: attempt.wordCount,
    samplePrompt: challenge.samplePrompt,
  };
}

export function mockGrade(
  challenge: BattleChallenge,
  prompt: string,
  opponentName: string,
): BattleResult {
  switch (challenge.mode) {
    case 'picture-twin':
      return gradePictureTwin(challenge, prompt, opponentName);
    case 'literal-robot':
      return gradeLiteralRobot(challenge, prompt, opponentName);
    case 'secret-word-taboo':
      return gradeTaboo(challenge, prompt, opponentName);
  }
}
