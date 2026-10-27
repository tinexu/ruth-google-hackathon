import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { app } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

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
