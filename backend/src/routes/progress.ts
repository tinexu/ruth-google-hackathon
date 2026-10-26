import { Router } from 'express';
import type { ApiError, FeedAnswerReport, FeedAnswerResult } from '../../../shared/types.js';
import { userOf } from '../auth/sessions.js';
import { recordFeedAnswer } from '../progress/store.js';
import { byUser, rateLimit } from '../rateLimit.js';

export const progressRouter = Router();

const XP_PER_FEED_CARD = 20;

// Feed cards are checked in the browser (the answers ship with each set), so
// the server trusts the report but counts each card once and caps the pace.
const feedAnswerLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 150,
  key: byUser,
  message: 'Whoa, that’s a lot of cards! Take a short break.',
});

// POST /api/progress/feed { setId, questionIndex, correct } -> FeedAnswerResult
progressRouter.post('/progress/feed', feedAnswerLimit, (req, res) => {
  const { setId, questionIndex, correct } = (req.body ?? {}) as Partial<FeedAnswerReport>;
  if (
    typeof setId !== 'string' ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(setId) ||
    !Number.isInteger(questionIndex) ||
    (questionIndex as number) < 0 ||
    (questionIndex as number) > 50 ||
    typeof correct !== 'boolean'
  ) {
    res.status(400).json({ error: 'That answer report looks wrong.' } satisfies ApiError);
    return;
  }
  const xpEarned = recordFeedAnswer(userOf(res), `${setId}:${questionIndex}`, correct, XP_PER_FEED_CARD);
  res.json({ xpEarned } satisfies FeedAnswerResult);
});
