import { Router } from 'express';
import { loadHomeData } from '../data.js';

export const homeRouter = Router();

// GET /api/home -> { kid, pet, stats, weekly, skills }
homeRouter.get('/home', (_req, res) => {
  try {
    const data = loadHomeData();
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
