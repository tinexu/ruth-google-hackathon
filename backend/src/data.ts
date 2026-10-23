import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { HomeData } from '../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoPath = path.join(__dirname, '..', 'data', 'demo.json');

/**
 * Loads the demo home-page data from disk on every call so edits to
 * demo.json show up without restarting the server. Once real progress
 * tracking exists, this is the function to swap out for a DB read.
 */
export function loadHomeData(): HomeData {
  const raw = readFileSync(demoPath, 'utf-8');
  return JSON.parse(raw) as HomeData;
}
