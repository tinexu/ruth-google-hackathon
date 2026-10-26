# Pip

Pip is an AI-literacy website for kids ages 8–12. Each kid has a robot pet
("Pip") that grows as they learn how AI works. This repo has the
**"My Pip" home page**, the **Feed** (`/feed`), **Train** (`/train`, where
kids teach Pip with their own examples and fix its blind spots) and
**Prompt Battles** (`/battle`) built out; Community and Settings are nav
tabs that link to placeholder pages.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind (`/frontend`)
- **Backend**: Node + Express + TypeScript (`/backend`)
- **Shared types**: `/shared/types.ts`, used by both sides
- **Demo data**: `backend/data/demo.json` — read by the server and served at
  `GET /api/home`

## Project layout

```
frontend/           React app (Vite)
backend/            Express API
  data/progression.json  stat labels, skills, levels, growth tiers
  src/index.ts       app entry
  src/db.ts          SQLite database (accounts + activity)
  src/auth/          passwords + session cookies
  src/progress/      records activity; turns it into level, stats, leaderboard
  src/routes/auth.ts POST /api/auth/signup|login|logout, GET /api/auth/me
  src/routes/home.ts GET /api/home (the signed-in kid's data)
  data/battles.json  the 3 Prompt Battle challenges + answer keys
  src/routes/battles.ts  GET /api/battles, POST /api/battles/:id/submit
  src/grading/       rule-based mock grader (keyword checklists)
  src/ai/gemini.ts   where Gemini plugs in to judge battles
shared/types.ts      shared TS types for the API shape
```

## Running it

From the repo root:

```bash
npm run install:all   # installs backend + frontend deps (first time only)
npm run dev            # starts the backend (port 4000) and frontend (port 5173) together
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api/*`
requests to the Express server, so you only need the one URL.

If the server isn't running, the page shows a friendly "Pip couldn't wake
up" message instead of crashing.

### Running them separately

```bash
npm run dev --prefix backend   # http://localhost:4000
npm run dev --prefix frontend   # http://localhost:5173
```

### Environment variables

Copy `backend/.env.example` to `backend/.env`. `GEMINI_API_KEY` isn't used
yet — it's reserved for upcoming Gemini-powered routes (e.g. generating new
feed challenges or judging Prompt Battles). See the commented-out spot in
`backend/src/routes/home.ts`.

## Design

Colors, type, and component language come from the Pip design kit: ink
`#1B2140`, ground `#F3F5FF`, sun `#FFC93C`, Pip blue `#5B86FF`, coral
`#FF7A59`, mint `#2FBF71`, with Baloo 2 for headings/numbers and Atkinson
Hyperlegible for body text. Tokens live in `frontend/src/index.css` as
Tailwind v4 `@theme` variables, so e.g. `bg-sun`, `text-ink`, and
`border-border` are available as Tailwind utilities everywhere.

Reusable building blocks live in `frontend/src/components/`: `TopNav`,
`Pill`, `Button`, `Card`, `SpeechBubble`, `PipMascot`, `StatBar`,
`SkillCard`. The home page (`frontend/src/pages/HomePage.tsx`) is driven
entirely by the `/api/home` response — the "needs care" stat and the
"X of Y skills unlocked" count are both computed from the data
(`frontend/src/lib/derive.ts`), not hardcoded.

## Accounts and progress

Anyone can make an account with a **nickname and password** (no email, so
there's no password reset yet). Sign-up and log-in live at `/api/auth/*`;
every other `/api` route needs a signed-in kid (an httpOnly `pip_session`
cookie, passwords hashed with scrypt).

- **Database:** one SQLite file (`backend/var/pip.sqlite` by default, git-ignored;
  set `DATABASE_PATH` to move it). Tables: `users`, `sessions`, `activity` (one row
  per feed card, battle round or Train card, so XP never counts twice) and
  `active_days` (for streaks).
- **Nothing about a kid is hard-coded.** `backend/src/progress/rules.ts` turns
  their activity into level, streak, stats, skills, Pip's mood and the leaderboard.
  Labels, skill rules, level thresholds and growth tiers live in
  `backend/data/progression.json`.
- **XP:** 20 per correct Feed card, 20 the first time a Train card is fixed, and
  40 / 30 / 20 for winning, tying or losing a Battle round the first time. The
  server awards it. Feed answers are checked in the browser (answers ship with
  each set), so the server trusts them but counts each card once and rate-limits.
- **Limits:** sign-up/log-in attempts per IP, Gemini question sets per kid (20/hour).
- **CORS** is off unless `CORS_ORIGIN` names the one site allowed to call the API.

## Prompt Battles

`/battle` is three 30-second rounds against a simulated classmate (Maya):
**Picture Twin** (describe a hidden pixel-art picture), **Literal Robot**
(step-by-step instructions for a robot with no common sense), and **Secret
Word Taboo** (make Pip say a word without the banned clues). The answer keys
stay on the server; the browser only gets what `toPublicChallenge` in
`backend/src/routes/battles.ts` lets through. Maya's scores come from the
same grader run on her prompts. Grading is keyword-based for now; swap it
for Gemini in `backend/src/grading/index.ts`.

## Branching

This work is on `feature/my-pip-home-page`, kept separate from `main`
since a teammate is working in this repo too.
