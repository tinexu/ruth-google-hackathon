import type { LeaderboardEntry } from '@shared/types';
import { TieredPetMascot } from './TieredPetMascot';
import { TrophyIcon } from '../icons';

interface PodiumCardProps {
  /** Exactly the top 3 entries, in rank order (1st, 2nd, 3rd). */
  top3: LeaderboardEntry[];
}

export function PodiumCard({ top3 }: PodiumCardProps) {
  const [first, second, third] = top3;
  if (!first || !second || !third) return null;

  return (
    <div className="rounded-[32px] border-[2.5px] border-ink bg-pip-blue-light p-8">
      <div className="grid grid-cols-3 items-end gap-4">
        <PodiumColumn entry={second} />
        <PodiumColumn entry={first} elevated />
        <PodiumColumn entry={third} />
      </div>
    </div>
  );
}

function PodiumColumn({ entry, elevated = false }: { entry: LeaderboardEntry; elevated?: boolean }) {
  const isWinner = entry.rank === 1;
  return (
    <div className={`flex flex-col items-center ${elevated ? '' : 'pt-10'}`}>
      <TieredPetMascot tier={entry.tier} color={entry.color} size={elevated ? 150 : 110} />
      <p className="mt-1 font-heading text-xl font-extrabold text-ink">{entry.petName}</p>
      <p className="text-sm font-semibold text-muted">
        {entry.ownerName} · Lv {entry.level} {entry.levelTitle}
      </p>
      <div
        className={`mt-3 flex w-full flex-col items-center gap-1 rounded-2xl border-[2.5px] border-ink px-4 py-3 ${
          isWinner ? 'bg-sun' : 'bg-white'
        }`}
      >
        {isWinner ? <TrophyIcon size={26} className="stroke-ink" /> : null}
        <span className="font-heading text-2xl font-extrabold leading-none text-ink">
          {entry.rank}
        </span>
        <span className="font-heading text-base font-bold text-ink">
          {entry.xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}
