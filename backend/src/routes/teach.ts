import { Router } from 'express';
import type {
  ApiError,
  PublicTeachCard,
  TeachAnswerRequest,
  TeachAnswerResult,
  TeachCard,
  TeachExample,
  TeachResponse,
  TeachTrainRequest,
  TeachTrainResult,
} from '../../../shared/types.js';
import { userOf } from '../auth/sessions.js';
import { loadTeachCards } from '../data.js';
import { recordTeachFix, touchActiveDay } from '../progress/store.js';
import { hasPhrase, normalize } from '../grading/match.js';

export const teachRouter = Router();

const XP_PER_FIX = 20;
const MAX_EXAMPLE_LENGTH = 40;

/** The kid's example that already teaches Pip the fix, if any. */
function findCoveringExample(card: TeachCard, examples: TeachExample[]): TeachExample | null {
  return (
    examples.find(
      (ex) =>
        ex.verdict === card.fixVerdict &&
        card.fixKeywords.some((k) => hasPhrase(normalize(ex.label), k)),
    ) ?? null
  );
}

/** Drop each choice's `kind` and the post-answer copy so the answer stays a secret. */
function toPublicCard(card: TeachCard): PublicTeachCard {
  return {
    id: card.id,
    category: card.category,
    question: card.question,
    examples: card.examples,
    trainPrompt: card.trainPrompt,
    trainHelp: card.trainHelp,
    labels: card.labels,
    media: card.media,
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

// POST /api/teach/:id/train { examples } -> TeachTrainResult
// Pip "learns" the kid's typed examples, then takes its test case.
teachRouter.post('/teach/:id/train', (req, res) => {
  const { examples } = (req.body ?? {}) as Partial<TeachTrainRequest>;
  try {
    const card = loadTeachCards().find((c) => c.id === req.params.id);
    if (!card) {
      res.status(404).json({ error: 'That card does not exist.' } satisfies ApiError);
      return;
    }
    const valid =
      Array.isArray(examples) &&
      examples.length === card.examples.length &&
      examples.every(
        (ex) =>
          typeof ex?.label === 'string' &&
          ex.label.trim().length > 0 &&
          ex.label.length <= MAX_EXAMPLE_LENGTH &&
          card.labels.includes(ex.verdict),
      );
    if (!valid) {
      res
        .status(400)
        .json({ error: `Give Pip ${card.examples.length} labeled examples.` } satisfies ApiError);
      return;
    }

    const coveredBy = findCoveringExample(card, examples);
    const result: TeachTrainResult = {
      cardId: card.id,
      coveredBy,
      pipSays: coveredBy ? card.pipFixed : card.pipMistake,
      explanation: coveredBy ? card.explanation : undefined,
      xpEarned: coveredBy ? recordTeachFix(userOf(res), card.id, XP_PER_FIX) : 0,
    };
    if (!coveredBy) touchActiveDay(userOf(res));
    res.json(result);
  } catch (err) {
    console.error('Failed to train Pip:', err);
    res.status(500).json({ error: 'Pip could not learn those examples.' } satisfies ApiError);
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
      xpEarned: correct ? recordTeachFix(userOf(res), card.id, XP_PER_FIX) : 0,
    };
    res.json(result);
  } catch (err) {
    console.error('Failed to check Teach answer:', err);
    res.status(500).json({ error: 'Pip could not check that answer.' } satisfies ApiError);
  }
});
