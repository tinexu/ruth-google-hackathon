import { useState } from 'react';
import type { LeaderboardEntry } from '@shared/types';
import { TieredPetMascot } from './TieredPetMascot';
import { Pill } from '../Pill';
import { Button } from '../Button';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  /** The XP of #1 on the board, so every row's bar fills relative to the same scale. */
  maxXp: number;
  /** Who's directly ahead of this pet, for the "XP to pass" note on your own row. */
  entryAbove?: LeaderboardEntry;
}

export function LeaderboardRow({ entry, maxXp, entryAbove }: LeaderboardRowProps) {
  const [greeted, setGreeted] = useState(false);
  const percent = Math.min(100, Math.round((entry.xp / maxXp) * 100));
  const xpToPass = entryAbove ? Math.max(0, entryAbove.xp - entry.xp) : 0;

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${
        entry.isYou ? 'border-2 border-sun bg-sun/20' : ''
      }`}
    >
      <span className="w-5 shrink-0 font-heading text-lg font-extrabold text-ink">{entry.rank}</span>

      <TieredPetMascot tier={entry.tier} color={entry.color} size={44} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-base font-extrabold text-ink">{entry.petName}</span>
          <span className="text-sm text-muted">
            {entry.isYou ? 'You' : entry.ownerName}
            {entry.justJoined ? ' · just joined' : ''}
          </span>
          <Pill tone="blueTint" className="px-2.5 py-0.5 text-xs">
            Lv {entry.level} {entry.levelTitle}
          </Pill>
        </div>
        <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${entry.isYou ? 'bg-sun' : 'bg-pip-blue'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-heading text-base font-bold text-ink">
          {entry.xp.toLocaleString()} XP
        </span>
        {entry.isYou ? (
          entryAbove && (
            <span className="whitespace-nowrap text-sm text-muted">
              {xpToPass.toLocaleString()} XP to pass {entryAbove.ownerName}
            </span>
          )
        ) : (
          <Button
            variant={entry.justJoined ? 'mint' : 'white'}
            onClick={() => setGreeted(true)}
            disabled={greeted}
            className="px-4 py-2 text-sm"
          >
            {greeted ? (entry.justJoined ? 'Said hi!' : 'Cheered!') : entry.justJoined ? 'Say hi' : 'Cheer'}
          </Button>
        )}
      </div>
    </div>
  );
}
