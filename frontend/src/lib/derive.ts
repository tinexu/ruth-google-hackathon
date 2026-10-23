import type { Stat, Skill } from '@shared/types';

/** The stat with the lowest value — the one flagged "needs care". */
export function getLowestStat(stats: Stat[]): Stat | undefined {
  if (stats.length === 0) return undefined;
  return stats.reduce((lowest, s) => (s.value < lowest.value ? s : lowest), stats[0]);
}

/** A skill counts as "unlocked" once the kid has started learning it. */
export function getUnlockedSkillCount(skills: Skill[]): number {
  return skills.filter((s) => s.status === 'mastered' || s.status === 'in-progress').length;
}
