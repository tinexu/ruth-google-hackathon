# Pip — My Pip home page

Pip is an AI-literacy website for kids ages 8–12. Each kid has a robot pet
("Pip") that grows as they learn how AI works. This repo currently has the
**"My Pip" home page** built out; Feed, Battle, Community, and Me are nav
tabs that link to empty placeholder pages.

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
  data/demo.json    demo kid/pet/stats/skills data
  src/index.ts       app entry
  src/routes/home.ts GET /api/home
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

## Branching

This work is on `feature/my-pip-home-page`, kept separate from `main`
since a teammate is working in this repo too.
