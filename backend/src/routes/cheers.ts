import { Router } from 'express';
import type { ApiError, SendCheerRequest } from '../../../shared/types.js';
import { CheerError, getCheers, sendCheer } from '../cheers.js';

export const cheersRouter = Router();

// GET /api/cheers -> { received, cheeredToday }
cheersRouter.get('/cheers', (_req, res) => {
  try {
    res.json(getCheers());
  } catch (err) {
    console.error('Failed to load cheers:', err);
    res.status(500).json({ error: 'Could not load cheers.' } satisfies ApiError);
  }
});

// POST /api/cheers { toPet } -> { received, cheeredToday }
cheersRouter.post('/cheers', (req, res) => {
  const { toPet } = (req.body ?? {}) as Partial<SendCheerRequest>;
  if (typeof toPet !== 'string' || !toPet.trim()) {
    res.status(400).json({ error: 'Say which pet to cheer for.' } satisfies ApiError);
    return;
  }
  try {
    res.json(sendCheer(toPet));
  } catch (err) {
    if (err instanceof CheerError) {
      res.status(err.status).json({ error: err.message } satisfies ApiError);
      return;
    }
    console.error('Failed to save cheer:', err);
    res.status(500).json({ error: 'Could not send that cheer.' } satisfies ApiError);
  }
});
