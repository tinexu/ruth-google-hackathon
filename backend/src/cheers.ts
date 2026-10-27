import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Cheer, CheersResponse, LeaderboardEntry } from '../../shared/types.js';
import { loadCommunityData } from './data.js';

// Cheers live in a small JSON file next to the server (cwd is backend/, see index.ts).
// Fine for the demo's single class; with real accounts this becomes a DB table.
const cheersPath = path.join(process.cwd(), 'var', 'cheers.json');
const MAX_RECEIVED = 20;

export class CheerError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** The classmates aren't real users yet, so a fresh store starts with a few cheers they "sent". */
function seedCheers(board: LeaderboardEntry[], you: LeaderboardEntry): Cheer[] {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
  const seeds: [string, number][] = [
    ['Maya', 2],
    ['Sam', 5],
    ['Leo', 26],
  ];
  return seeds.flatMap(([owner, h]) => {
    const from = board.find((e) => e.ownerName === owner);
    return from ? [toCheer(from, you, hoursAgo(h))] : [];
  });
}

function toCheer(from: LeaderboardEntry, to: LeaderboardEntry, at = new Date().toISOString()): Cheer {
  return {
    id: randomUUID(),
    fromOwner: from.ownerName,
    fromPet: from.petName,
    fromTier: from.tier,
    fromColor: from.color,
    toOwner: to.ownerName,
    toPet: to.petName,
    at,
  };
}

function loadBoard() {
  const board = loadCommunityData().leaderboard;
  const you = board.find((e) => e.isYou);
  if (!you) throw new Error('community.json has no isYou entry');
  return { board, you };
}

function readCheers(board: LeaderboardEntry[], you: LeaderboardEntry): Cheer[] {
  if (!existsSync(cheersPath)) {
    const seeded = seedCheers(board, you);
    writeCheers(seeded);
    return seeded;
  }
  return (JSON.parse(readFileSync(cheersPath, 'utf-8')) as { cheers: Cheer[] }).cheers;
}

function writeCheers(cheers: Cheer[]): void {
  mkdirSync(path.dirname(cheersPath), { recursive: true });
  const tmp = `${cheersPath}.tmp`;
  writeFileSync(tmp, JSON.stringify({ cheers }, null, 2));
  renameSync(tmp, cheersPath);
}

const sameDay = (iso: string, now: Date) => new Date(iso).toDateString() === now.toDateString();

function summarize(cheers: Cheer[], you: LeaderboardEntry): CheersResponse {
  const now = new Date();
  return {
    received: cheers
      .filter((c) => c.toPet === you.petName)
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, MAX_RECEIVED),
    cheeredToday: cheers.filter((c) => c.fromPet === you.petName && sameDay(c.at, now)).map((c) => c.toPet),
  };
}

export function getCheers(): CheersResponse {
  const { board, you } = loadBoard();
  return summarize(readCheers(board, you), you);
}

/** Records a cheer from your pet to a classmate's pet: one per pet per day. */
export function sendCheer(toPet: string): CheersResponse {
  const { board, you } = loadBoard();
  const to = board.find((e) => e.petName === toPet);
  if (!to) throw new CheerError('That pet isn’t in your class.', 404);
  if (to.petName === you.petName) throw new CheerError('You can’t cheer for your own pet.', 400);

  const cheers = readCheers(board, you);
  if (summarize(cheers, you).cheeredToday.includes(to.petName)) {
    throw new CheerError(`You already cheered for ${to.petName} today.`, 409);
  }
  cheers.push(toCheer(you, to));
  writeCheers(cheers);
  return summarize(cheers, you);
}
