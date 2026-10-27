import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { homeRouter } from './routes/home.js';
import { feedRouter } from './routes/feed.js';
import { battlesRouter } from './routes/battles.js';
import { teachRouter } from './routes/teach.js';
import { communityRouter } from './routes/community.js';
import { cheersRouter } from './routes/cheers.js';

// The Express app with every /api route. index.ts runs it as a server locally;
// Vercel runs it as the backend service (see vercel.json).
export const app = express();

app.use(cors());
app.use(express.json({ limit: '4kb' }));

app.use('/api', homeRouter);
app.use('/api', feedRouter);
app.use('/api', battlesRouter);
app.use('/api', teachRouter);
app.use('/api', communityRouter);
app.use('/api', cheersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
