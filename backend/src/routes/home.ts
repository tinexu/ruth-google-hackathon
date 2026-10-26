import { Router } from 'express';
import { userOf } from '../auth/sessions.js';
import { buildHomeData } from '../progress/rules.js';

export const homeRouter = Router();

// GET /api/home -> { kid, pet, stats, weekly, skills }, all calculated from the signed-in kid's activity
homeRouter.get('/home', (_req, res) => {
  try {
    const data = buildHomeData(userOf(res));
    res.json(data);
  } catch (err) {
    console.error('Failed to load home data:', err);
    res.status(500).json({ error: 'Could not load Pip data.' });
  }
});

// Reserved for Gemini-powered routes (requires GEMINI_API_KEY in .env),
// e.g. generating a new feed challenge. Prompt Battle judging lives in
// src/grading/ (see src/ai/gemini.ts).
// homeRouter.post('/generate-challenge', async (req, res) => { ... })
