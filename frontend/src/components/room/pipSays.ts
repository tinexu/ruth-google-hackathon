import type { Stat } from '@shared/types';
import { isDone, STAT_ACTIVITY, type Quest } from '../home/quests';
import type { PipBubble } from './RoomScene';

// The room object for each activity page, and how Pip names it.
const PLACE: Record<string, { spot: string; where: string }> = {
  '/feed': { spot: 'computer', where: 'the computer' },
  '/battle': { spot: 'arcade', where: 'the arcade' },
  '/train': { spot: 'dumbbell', where: 'the dumbbells' },
};

/**
 * What Pip says in the room, and which object to light up: the first
 * unfinished quest, or once they're all done, whatever grows Pip's lowest stat.
 */
export function pipSays(quests: Quest[], lowest: Stat | undefined): PipBubble & { spot: string } {
  const quest = quests.find((q) => !isDone(q));
  if (quest) {
    const place = PLACE[quest.to];
    const line =
      quest.id === 'feed'
        ? quest.value > 0
          ? `Let’s finish our Feed cards! (${quest.value}/${quest.target})`
          : 'Let’s play Feed cards together!'
        : quest.id === 'battle'
          ? 'Ready for a Prompt Battle?'
          : 'Help me fix a blind spot!';
    return { line, hint: `Tap ${place.where}!`, spot: place.spot };
  }
  const stat = lowest ?? { key: 'brain' as const, label: 'Brain' };
  const place = PLACE[STAT_ACTIVITY[stat.key].to];
  return { line: `Quests done! Let’s grow my ${stat.label}.`, hint: `Tap ${place.where}!`, spot: place.spot };
}
