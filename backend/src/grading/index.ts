import type { BattleChallenge, BattleResult } from '../../../shared/types.js';
import { mockGrade } from './mockGrader.js';

/**
 * Single entry point the routes call to grade a battle prompt.
 * TODO(gemini): when server/src/ai/gemini.ts is implemented, branch on
 * isGeminiConfigured() here and fall back to mockGrade if the call fails.
 */
export async function gradeSubmission(
  challenge: BattleChallenge,
  prompt: string,
  opponentName: string,
): Promise<BattleResult> {
  return mockGrade(challenge, prompt, opponentName);
}
