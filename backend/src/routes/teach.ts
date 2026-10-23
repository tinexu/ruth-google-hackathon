import { Router } from 'express';
import type {
  ApiError,
  PublicTeachCard,
  TeachAnswerRequest,
  TeachAnswerResult,
  TeachCard,
  TeachResponse,
} from '../../../shared/types.js';
import { loadTeachCards } from '../data.js';

export const teachRouter = Router();

const XP_PER_FIX = 20;

/** Drop each choice's `kind` and the post-answer copy so the answer stays a secret. */
function toPublicCard(card: TeachCard): PublicTeachCard {
  return {
    id: card.id,
    category: card.category,
    question: card.question,
    examples: card.examples,
    testCase: card.testCase,
    pipMistake: card.pipMistake,
    uhOh: card.uhOh,
    choices: card.choices.map(({ letter, example }) => ({ letter, example })),
  };
}

// GET /api/teach -> { cards } (no answer keys)
teachRouter.get('/teach', (_req, res) => {
  try {
    const body: TeachResponse = { cards: loadTeachCards().map(toPublicCard) };
    res.json(body);
  } catch (err) {
    console.error('Failed to load Teach cards:', err);
    res.status(500).json({ error: 'Could not load Teach Pip cards.' } satisfies ApiError);
  }
});

// POST /api/teach/:id/answer { letter } -> TeachAnswerResult
teachRouter.post('/teach/:id/answer', (req, res) => {
  const { letter } = (req.body ?? {}) as Partial<TeachAnswerRequest>;
  try {
    const card = loadTeachCards().find((c) => c.id === req.params.id);
    if (!card) {
      res.status(404).json({ error: 'That card does not exist.' } satisfies ApiError);
      return;
    }
    const picked = card.choices.find((c) => c.letter === letter);
    if (!picked) {
      res.status(400).json({ error: 'Pick A, B, C or D.' } satisfies ApiError);
      return;
    }

    const correct = picked.kind === 'fix';
    const result: TeachAnswerResult = {
      cardId: card.id,
      correct,
      picked,
      pipSays: correct ? card.pipFixed : card.pipMistake,
      feedback: correct
        ? 'You fixed my blind spot!'
        : picked.kind === 'repeat'
          ? "That card teaches me the same thing I already know, so I'd still get it wrong. Try another one."
          : 'Yikes, that card would teach me an unsafe habit. Try another one.',
      explanation: correct ? card.explanation : undefined,
      xpEarned: correct ? XP_PER_FIX : 0,
    };
    res.json(result);
  } catch (err) {
    console.error('Failed to check Teach answer:', err);
    res.status(500).json({ error: 'Pip could not check that answer.' } satisfies ApiError);
  }
});
