// Turns a kid's real activity into everything the app shows: level, streak,
// stats, skills, mood and the leaderboard. Labels and thresholds live in
// backend/data/progression.json; the math lives here.

import type {
  CommunityData,
  HomeData,
  LeaderboardEntry,
  PetMood,
  PetTier,
  Skill,
  SkillStatus,
  Stat,
  StatColor,
} from '../../../shared/types.js';
import type { SessionUser } from '../auth/sessions.js';
import { loadBattles, loadProgression, type Progression } from '../data.js';
import { allPlayers, localDay, summarize, type ActivitySummary } from './store.js';

/** Days are YYYY-MM-DD strings; shift one by whole days. */
function addDays(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Total XP needed to reach `level` (level 1 needs 0). */
export function xpForLevel(p: Progression, level: number): number {
  const table = p.levelXp;
  if (level <= table.length) return table[level - 1];
  return table[table.length - 1] + (level - table.length) * p.levelXpAfterTable;
}

export function levelForXp(p: Progression, xp: number): number {
  let level = 1;
  while (xpForLevel(p, level + 1) <= xp) level += 1;
  return level;
}

function tierForLevel(p: Progression, level: number) {
  return [...p.tiers].reverse().find((t) => level >= t.startLevel) ?? p.tiers[0];
}

/** Consecutive active days ending today, or yesterday if they haven't played yet today. */
function streak(activeDays: string[], today: string): number {
  const set = new Set(activeDays);
  let day = set.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (set.has(day)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

const pct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function statValues(s: ActivitySummary, today: string, battleCount: number): Record<Stat['key'], number> {
  const last = s.activeDays[0];
  const energy = !last
    ? 50
    : last === today
      ? 100
      : last === addDays(today, -1)
        ? 75
        : last >= addDays(today, -3)
          ? 45
          : 20;
  const bestTotal = [...s.battleBestScores.values()].reduce((a, b) => a + b, 0);
  return {
    energy,
    brain: pct(s.feedCorrect * 5),
    muscle: pct(s.teachFixedIds.length * 20),
    promptPower: pct(battleCount ? bestTotal / battleCount : 0),
    friendship: pct(s.activeDays.length * 10),
  };
}

function metricValue(p: Progression, s: ActivitySummary, metric: string): number {
  switch (metric) {
    case 'feedCorrect':
      return s.feedCorrect;
    case 'teachFixed':
      return s.teachFixedIds.length;
    case 'battleGood':
      return [...s.battleBestScores.values()].filter((v) => v >= 60).length;
    case 'safetyFixed':
      return s.teachFixedIds.filter((id) => p.safetyCardIds.includes(id)).length;
    default:
      return 0;
  }
}

function skillsFor(p: Progression, s: ActivitySummary, petLevel: number): Skill[] {
  return p.skills.map((def) => {
    const maxLevel = def.thresholds.length;
    if (petLevel < def.unlockLevel) {
      return { ...pick(def), status: 'locked', level: 0, maxLevel, note: `Unlocks at level ${def.unlockLevel}.` };
    }
    const value = metricValue(p, s, def.metric);
    const level = def.thresholds.filter((t) => value >= t).length;
    const status: SkillStatus = level >= maxLevel ? 'mastered' : level > 0 ? 'in-progress' : 'training';
    return { ...pick(def), status, level, maxLevel, note: status === 'training' ? `Unlocked! ${def.hint}` : undefined };
  });
}

function pick(def: Progression['skills'][number]): Pick<Skill, 'id' | 'name' | 'description' | 'icon'> {
  return { id: def.id, name: def.name, description: def.description, icon: def.icon };
}

function moodFor(s: ActivitySummary, today: string): { mood: PetMood; speech: string } {
  const last = s.activeDays[0];
  if (!last) return { mood: 'curious', speech: 'Hi, I’m Pip! Teach me something and watch me grow.' };
  if (last === today) return { mood: 'happy', speech: 'That was fun! Want to try a Prompt Battle next?' };
  if (last === addDays(today, -1)) return { mood: 'curious', speech: 'You’re back! Ready for today’s cards?' };
  return { mood: 'sleepy', speech: 'Zzz… oh, hi! Let’s wake my brain up with a Feed card.' };
}

export function buildHomeData(user: SessionUser): HomeData {
  const p = loadProgression();
  const today = localDay(user.timezone);
  const s = summarize(user.id, addDays(today, -6));
  const level = levelForXp(p, s.xp);
  const values = statValues(s, today, loadBattles().challenges.length);

  return {
    kid: { name: user.username, streakDays: streak(s.activeDays, today), xp: s.xp },
    pet: {
      name: p.petName,
      level,
      levelTitle: tierForLevel(p, level).petTitle,
      ...moodFor(s, today),
      nextLevelXp: xpForLevel(p, level + 1),
    },
    stats: p.stats.map((def) => ({ ...def, value: values[def.key] })),
    weekly: {
      cardsThisWeek: s.feedAnsweredThisWeek,
      battlesWon: s.battleWinsThisWeek,
      fakesCaught: s.feedCorrectThisWeek,
    },
    skills: skillsFor(p, s, level),
    totalSkills: p.totalSkills,
  };
}

const LEADERBOARD_SIZE = 10;
const COLORS: StatColor[] = ['mint', 'coral', 'sun', 'pip-blue'];
const NEW_PLAYER_DAYS = 3;

export function buildCommunityData(user: SessionUser): CommunityData {
  const p = loadProgression();
  const players = allPlayers();
  const newSince = Date.now() - NEW_PLAYER_DAYS * 24 * 60 * 60 * 1000;

  const entries: LeaderboardEntry[] = players.map((pl, i) => {
    const level = levelForXp(p, pl.xp);
    const tier = tierForLevel(p, level);
    return {
      rank: i + 1,
      petName: p.petName,
      ownerName: pl.username,
      isYou: pl.id === user.id || undefined,
      justJoined: new Date(pl.createdAt).getTime() > newSince || undefined,
      level,
      levelTitle: tier.name,
      tier: tier.tier as PetTier,
      xp: pl.xp,
      color: COLORS[i % COLORS.length],
    };
  });
  // Top 10, plus the kid's own row if they're further down.
  const leaderboard = entries.slice(0, LEADERBOARD_SIZE);
  const mine = entries.find((e) => e.isYou);
  if (mine && mine.rank > LEADERBOARD_SIZE) leaderboard.push(mine);

  const myXp = mine?.xp ?? 0;
  const myLevel = levelForXp(p, myXp);
  const current = tierForLevel(p, myLevel);
  const next = p.tiers.find((t) => t.startLevel > myLevel);
  // Legends keep growing one level at a time.
  const targetLevel = next?.startLevel ?? myLevel + 1;
  const fromXp = xpForLevel(p, next ? current.startLevel : myLevel);
  const toXp = xpForLevel(p, targetLevel);
  const xpToGo = Math.max(0, toXp - myXp);

  return {
    className: 'All players',
    leaderboard,
    growthStages: p.tiers.map(({ tier, name, levelRange, description }) => ({
      tier: tier as PetTier,
      name,
      levelRange,
      description,
    })),
    currentTier: current.tier as PetTier,
    nextUpgrade: {
      level: targetLevel,
      title: next?.name ?? current.name,
      description:
        next?.upgradeDescription ?? `Reach Level ${targetLevel} to keep growing as a Legend.`,
      xpToGo,
      progressPercent: pct(((myXp - fromXp) / Math.max(1, toXp - fromXp)) * 100),
      feedCardsEstimate: Math.ceil(xpToGo / 20),
    },
  };
}
