import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { requireUser } from './auth/sessions.js';
import { authRouter } from './routes/auth.js';
import { homeRouter } from './routes/home.js';
import { feedRouter } from './routes/feed.js';
import { battlesRouter } from './routes/battles.js';
import { teachRouter } from './routes/teach.js';
import { communityRouter } from './routes/community.js';
import { progressRouter } from './routes/progress.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// The app and API share one origin (Vite proxies /api in dev; Express serves
// the build in prod), so cross-origin requests are off unless CORS_ORIGIN names
// a specific site. Cookies make an open CORS policy unsafe.
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
}
app.use(express.json({ limit: '4kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Sign-up and log-in are open; everything else needs a signed-in kid.
app.use('/api', authRouter);
app.use('/api', requireUser);

app.use('/api', homeRouter);
app.use('/api', feedRouter);
app.use('/api', battlesRouter);
app.use('/api', teachRouter);
app.use('/api', communityRouter);
app.use('/api', progressRouter);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// In production (after `npm run build`), serve the built React app and let
// React Router handle page URLs. In dev, Vite serves the app and proxies
// /api here (see frontend/vite.config.ts).
// Resolved from process.cwd() (= backend/, per the "dev"/"start" scripts)
// rather than __dirname, since __dirname's depth relative to the repo root
// differs between `tsx watch src/index.ts` (dev) and the compiled
// dist/backend/src/index.js (prod), while cwd stays backend/ in both.
const distDir = path.join(process.cwd(), '..', 'frontend', 'dist');
const hasBuild = existsSync(path.join(distDir, 'index.html'));
if (hasBuild) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(hasBuild
    ? `Pip is running at http://localhost:${PORT}`
    : `Pip API is running on http://localhost:${PORT} (open the Vite dev server for the app)`);
  if (!process.env.GEMINI_API_KEY) console.log('No GEMINI_API_KEY set: the feed will use its built-in practice cards.');
});
