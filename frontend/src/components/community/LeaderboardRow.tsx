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
  /** You already cheered for this pet today (remembered in this browser). */
  cheered: boolean;
  onCheer: () => void;
}

export function LeaderboardRow({ entry, maxXp, entryAbove, cheered, onCheer }: LeaderboardRowProps) {
  const [justCheered, setJustCheered] = useState(false);
  const percent = Math.min(100, Math.round((entry.xp / maxXp) * 100));
  const xpToPass = entryAbove ? Math.max(0, entryAbove.xp - entry.xp) : 0;

  function cheer() {
    onCheer();
    setJustCheered(true);
  }

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
          <div className="relative">
            <Button
              variant={cheered ? 'white' : 'sun'}
              onClick={cheer}
              disabled={cheered}
              aria-label={cheered ? `Cheered ${entry.ownerName}` : `Cheer for ${entry.ownerName}`}
              className="px-4 py-2 text-sm"
            >
              {cheered ? 'Cheered!' : 'Cheer'}
            </Button>
            {justCheered && (
              <span aria-hidden="true" className="cheer-float pointer-events-none absolute -top-2 left-1/2 text-coral">
                <svg width="22" height="22" viewBox="-16 -12 32 30">
                  <path d="M0 -4 c-5 -7 -15 -3 -15 4 c0 7 9 11 15 16 c6 -5 15 -9 15 -16 c0 -7 -10 -11 -15 -4 Z" fill="currentColor" stroke="#1B2140" strokeWidth="2.5" />
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
