import { Router } from 'express';
import type { ApiError } from '../../../shared/types.js';
import { userOf } from '../auth/sessions.js';
import { buildCommunityData } from '../progress/rules.js';

export const communityRouter = Router();

// GET /api/community -> { className, leaderboard, growthStages, currentTier, nextUpgrade }
communityRouter.get('/community', (_req, res) => {
  try {
    res.json(buildCommunityData(userOf(res)));
  } catch (err) {
    console.error('Failed to load community data:', err);
    res.status(500).json({ error: 'Could not load the class leaderboard.' } satisfies ApiError);
  }
});
