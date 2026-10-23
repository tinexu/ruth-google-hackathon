import { Router } from 'express';
import type {
  ApiError,
  BattleChallenge,
  BattlesResponse,
  PublicChallenge,
  SubmitRequest,
} from '../../../shared/types.js';
import { loadBattles } from '../data.js';
import { gradeSubmission } from '../grading/index.js';

export const battlesRouter = Router();

const MAX_PROMPT_LENGTH = 1000;

/** Strip answer keys and the opponent's prompt before sending a challenge to the browser. */
function toPublicChallenge(c: BattleChallenge): PublicChallenge {
  const base = { id: c.id, round: c.round, title: c.title, blurb: c.blurb, pipIntro: c.pipIntro };
  switch (c.mode) {
    case 'picture-twin':
      return {
        ...base,
        mode: c.mode,
        categories: c.elements.map((e) => ({ id: e.id, category: e.category })),
      };
    case 'literal-robot':
      return { ...base, mode: c.mode, task: c.task, stepCount: c.steps.length };
    case 'secret-word-taboo':
      return {
        ...base,
        mode: c.mode,
        secretWord: c.secretWord,
        bannedWords: c.bannedWords,
        bannedStems: c.bannedStems,
      };
  }
}

// GET /api/battles -> { opponent, challenges } (no answer keys)
battlesRouter.get('/battles', (_req, res) => {
  try {
    const data = loadBattles();
    const body: BattlesResponse = {
      opponent: data.opponent,
      challenges: [...data.challenges].sort((a, b) => a.round - b.round).map(toPublicChallenge),
    };
    res.json(body);
  } catch (err) {
    console.error('Failed to load battles:', err);
    res.status(500).json({ error: 'Could not load Prompt Battles.' } satisfies ApiError);
  }
});

// POST /api/battles/:id/submit { prompt } -> BattleResult
battlesRouter.post('/battles/:id/submit', async (req, res) => {
  const { prompt } = (req.body ?? {}) as Partial<SubmitRequest>;
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > MAX_PROMPT_LENGTH) {
    res
      .status(400)
      .json({ error: 'Write a prompt first (up to 1000 characters).' } satisfies ApiError);
    return;
  }
  try {
    const data = loadBattles();
    const challenge = data.challenges.find((c) => c.id === req.params.id);
    if (!challenge) {
      res.status(404).json({ error: 'That battle does not exist.' } satisfies ApiError);
      return;
    }
    res.json(await gradeSubmission(challenge, prompt, data.opponent.name));
  } catch (err) {
    console.error('Failed to grade battle prompt:', err);
    res.status(500).json({ error: 'Pip could not grade that prompt.' } satisfies ApiError);
  }
});
