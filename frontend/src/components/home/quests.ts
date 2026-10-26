import type { ComponentType, SVGProps } from 'react';
import type { Stat, TodayProgress } from '@shared/types';
import { DumbbellIcon, FeedIcon, ZapIcon } from '../icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface Quest {
  id: 'feed' | 'battle' | 'train';
  label: string;
  /** Button text when this quest is the next thing to do. */
  cta: string;
  value: number;
  target: number;
  to: string;
  icon: Icon;
}

/** Today's three small quests. Order = the order we nudge kids through them. */
export function dailyQuests(today: TodayProgress): Quest[] {
  return [
    { id: 'feed', label: 'Finish a set of 4 Feed cards', cta: 'Play Feed cards', value: today.feedCards, target: 4, to: '/feed', icon: FeedIcon },
    { id: 'battle', label: 'Play a Prompt Battle round', cta: 'Start a Prompt Battle', value: today.battleRounds, target: 1, to: '/battle', icon: ZapIcon },
    { id: 'train', label: 'Fix one of Pip’s blind spots', cta: 'Train Pip', value: today.trainFixes, target: 1, to: '/train', icon: DumbbellIcon },
  ];
}

export const isDone = (q: Quest) => q.value >= q.target;

/** Where each stat grows, so a low stat can point at the right activity. */
export const STAT_ACTIVITY: Record<Stat['key'], { how: string; to: string; cta: string }> = {
  energy: { how: 'Energy fills up when you play every day.', to: '/feed', cta: 'Play Feed cards' },
  brain: { how: 'Brain grows when you get Feed cards right.', to: '/feed', cta: 'Play Feed cards' },
  muscle: { how: 'Muscle grows when you fix blind spots in Train.', to: '/train', cta: 'Train Pip' },
  promptPower: { how: 'Prompt power grows with good Prompt Battle scores.', to: '/battle', cta: 'Start a Prompt Battle' },
  friendship: { how: 'Friendship grows each day you and Pip play.', to: '/feed', cta: 'Play Feed cards' },
};

/**
 * The one thing we suggest next: the first unfinished quest, or, once today's
 * quests are done, whatever grows Pip's lowest stat.
 */
export function nextStep(quests: Quest[], lowest: Stat | undefined): { label: string; to: string; reason: string } {
  const quest = quests.find((q) => !isDone(q));
  if (quest) return { label: quest.cta, to: quest.to, reason: `Next quest: ${quest.label}` };
  const activity = lowest ? STAT_ACTIVITY[lowest.key] : STAT_ACTIVITY.brain;
  return { label: activity.cta, to: activity.to, reason: 'Quests done! Keep growing Pip.' };
}
