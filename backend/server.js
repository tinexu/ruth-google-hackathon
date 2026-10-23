// Pip API server
// - POST /api/feed/questions -> asks Gemini for a fresh set of feed questions
// - In production (after `npm run build`) it also serves the React app from /dist.
//   In dev, Vite serves the React app and forwards /api here (see vite.config.ts).
//
// The Gemini API key stays on the server. Never put it in browser code.

import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { randomUUID, randomInt } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ quiet: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
// Override only for testing against a mock server.
const GEMINI_BASE_URL = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
const QUESTIONS_PER_SET = 4;
const GEMINI_TIMEOUT_MS = 45_000;

// The 13 topics from the prompt. `tag` is the short label on the yellow card,
// `why` is what the "Why am I seeing this?" panel says.
export const TOPICS = {
  1:  { name: 'Deepfakes', tag: 'DEEPFAKE DETECTIVE', why: 'Fake videos of real people are getting easier to make. This card trains your eyes and ears.' },
  2:  { name: 'Prompt Injection', tag: 'SNEAKY PROMPTS', why: 'Some text is written to trick an AI into breaking its rules. This card helps you spot it.' },
  3:  { name: 'Mental Health & AI (Sycophancy)', tag: 'PEOPLE-PLEASER BOT', why: 'AI sometimes just agrees with you, even when it shouldn’t. This card shows you what that looks like.' },
  4:  { name: 'Sharing & Privacy (PII)', tag: 'STAY PRIVATE', why: 'Everyone gets privacy cards, because keeping your info safe matters every day.' },
  5:  { name: 'Hallucinations', tag: 'CATCH THE BOT', why: 'AI can make up facts and still sound sure. This card helps you catch it.' },
  6:  { name: 'Voice Cloning', tag: 'IS IT REALLY THEM?', why: 'AI can copy voices now. This card teaches you how to check who is really calling.' },
  7:  { name: 'Scam Identification (AI Phishing)', tag: 'SCAM SPOTTER', why: 'Scam messages written by AI can look perfect. This card shows the clues that give them away.' },
  8:  { name: 'AI-Generated Images & News', tag: 'REAL OR AI?', why: 'Unbelievable pictures spread fast online. This card helps you check before you share.' },
  9:  { name: 'Misinformation vs. Disinformation', tag: 'TRUTH CHECK', why: 'Some false info is a mistake and some is on purpose. This card helps you tell the difference.' },
  10: { name: 'AI Slop Videos', tag: 'SLOP OR NOT?', why: 'Lots of junk videos are made by AI just to get clicks. This card helps you spot them.' },
  11: { name: 'Addictive AI Friendships', tag: 'AI FRIEND CHECK', why: 'Some AI chat buddies try to keep you hooked. This card shows the warning signs.' },
  12: { name: 'AI Doing Your Homework', tag: 'HOMEWORK HELPER?', why: 'AI can help you learn or do the thinking for you. This card shows the difference.' },
  13: { name: 'Therapy / Medical Advice from AI', tag: 'ASK A REAL PERSON', why: 'Some questions need a real doctor or trusted adult. This card helps you know when.' }
};
const TOPIC_IDS = Object.keys(TOPICS).map(Number);

// Structured-output schema for Gemini's generateContent (OpenAPI-style subset).
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      minItems: QUESTIONS_PER_SET,
      maxItems: QUESTIONS_PER_SET,
      items: {
        type: 'OBJECT',
        properties: {
          topicId: { type: 'INTEGER' },
          intro: { type: 'STRING' },
          artifactKind: { type: 'STRING', enum: ['chat', 'email', 'post', 'prompts', 'none'] },
          artifactLines: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { label: { type: 'STRING' }, text: { type: 'STRING' } },
              required: ['label', 'text']
            }
          },
          question: { type: 'STRING' },
          options: { type: 'ARRAY', minItems: 4, maxItems: 4, items: { type: 'STRING' } },
          correctIndex: { type: 'INTEGER' },
          explanation: { type: 'STRING' },
          pipRight: { type: 'STRING' },
          pipWrong: { type: 'STRING' }
        },
        required: ['topicId', 'intro', 'artifactKind', 'artifactLines', 'question', 'options', 'correctIndex', 'explanation', 'pipRight', 'pipWrong'],
        propertyOrdering: ['topicId', 'intro', 'artifactKind', 'artifactLines', 'question', 'options', 'correctIndex', 'explanation', 'pipRight', 'pipWrong']
      }
    }
  },
  required: ['questions']
};

const promptTemplate = await readFile(path.join(__dirname, 'prompts', 'feed-questions.md'), 'utf8');

// Pick `count` distinct topics at random, preferring ones not in `avoid`
// (the topics from the student's previous set) so sets don't repeat.
export function pickTopics(count, avoid = []) {
  const avoidSet = new Set(avoid.filter((id) => TOPICS[id]));
  const fresh = shuffle(TOPIC_IDS.filter((id) => !avoidSet.has(id)));
  const stale = shuffle(TOPIC_IDS.filter((id) => avoidSet.has(id)));
  return [...fresh, ...stale].slice(0, count);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPrompt(topicIds) {
  const list = topicIds.map((id, i) => `${i + 1}. Topic ${id}: ${TOPICS[id].name}`).join('\n');
  return promptTemplate.replaceAll('{{COUNT}}', String(topicIds.length)).replaceAll('{{PICKED_TOPICS}}', list);
}

const clip = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Check Gemini's JSON and turn it into what the page expects.
// Throws if anything important is missing. Shuffles answer choices so the
// correct answer isn't always in the same spot.
export function normalizeQuestions(raw, topicIds) {
  const list = raw && Array.isArray(raw.questions) ? raw.questions : null;
  if (!list || list.length < topicIds.length) throw new Error('Gemini returned too few questions');

  return topicIds.map((expectedTopic, i) => {
    const q = list[i] || {};
    const options = Array.isArray(q.options) ? q.options.map((o) => clip(o, 160)).filter(Boolean) : [];
    const correctIndex = Number(q.correctIndex);
    if (options.length !== 4) throw new Error(`Question ${i + 1} does not have 4 options`);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) throw new Error(`Question ${i + 1} has a bad correctIndex`);
    const question = clip(q.question, 240);
    const intro = clip(q.intro, 260);
    if (!question || !intro) throw new Error(`Question ${i + 1} is missing text`);

    const topicId = TOPICS[Number(q.topicId)] ? Number(q.topicId) : expectedTopic;
    const order = shuffle([0, 1, 2, 3]);
    const kind = ['chat', 'email', 'post', 'prompts'].includes(q.artifactKind) ? q.artifactKind : 'none';
    const artifactLines = kind === 'none' || !Array.isArray(q.artifactLines)
      ? []
      : q.artifactLines.slice(0, 4)
          .map((line) => ({ label: clip(line && line.label, 24), text: clip(line && line.text, 220) }))
          .filter((line) => line.text);

    return {
      id: randomUUID(),
      topicId,
      topic: TOPICS[topicId].name,
      tag: TOPICS[topicId].tag,
      why: TOPICS[topicId].why,
      intro,
      artifactKind: artifactLines.length ? kind : 'none',
      artifactLines,
      question,
      options: order.map((k) => options[k]),
      correctIndex: order.indexOf(correctIndex),
      explanation: clip(q.explanation, 360) || 'Nice thinking! Always double-check what AI tells you.',
      pipRight: clip(q.pipRight, 120) || 'You got it!',
      pipWrong: clip(q.pipWrong, 120) || 'Not quite, but now you know!'
    };
  });
}

async function askGemini(topicIds) {
  const url = `${GEMINI_BASE_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(topicIds) }] }],
    generationConfig: {
      temperature: 1.0,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS)
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const candidate = data && data.candidates && data.candidates[0];
  const text = candidate && candidate.content && Array.isArray(candidate.content.parts)
    ? candidate.content.parts.map((p) => p.text || '').join('')
    : '';
  if (!text) {
    const reason = (candidate && candidate.finishReason) || (data.promptFeedback && data.promptFeedback.blockReason) || 'empty response';
    throw new Error(`Gemini returned no text (${reason})`);
  }
  return JSON.parse(text);
}

const app = express();
app.use(express.json({ limit: '4kb' }));

app.post('/api/feed/questions', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not set on the server.' });
  }
  const avoid = Array.isArray(req.body && req.body.avoidTopics) ? req.body.avoidTopics.map(Number) : [];
  const topicIds = pickTopics(QUESTIONS_PER_SET, avoid);

  // One retry: models occasionally return JSON that fails our checks.
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await askGemini(topicIds);
      const questions = normalizeQuestions(raw, topicIds);
      return res.json({ setId: randomUUID(), createdAt: new Date().toISOString(), model: GEMINI_MODEL, questions });
    } catch (err) {
      lastError = err;
      console.warn(`[feed] attempt ${attempt} failed:`, err.message);
    }
  }
  res.status(502).json({ error: 'Pip could not make new questions right now.', detail: lastError && lastError.message });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the built React app (npm run build) and let React Router handle page URLs.
const distDir = path.join(__dirname, 'dist');
const hasBuild = existsSync(path.join(distDir, 'index.html'));
if (hasBuild) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(hasBuild
    ? `Pip is running at http://localhost:${PORT}/feed`
    : `Pip API is running on http://localhost:${PORT} (open the Vite dev server for the app)`);
  if (!GEMINI_API_KEY) console.log('No GEMINI_API_KEY set: the feed will use its built-in practice cards.');
});
