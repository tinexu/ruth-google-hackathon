import type { HomeData } from '@shared/types';
import { PipMascot, type PipMood } from '../PipMascot';

const DEFAULT_NEXT_LEVEL_XP = 500;

interface PipProgressProps {
  pet: HomeData['pet'];
  xp: number;
  mood: PipMood;
  /** Wave when Pip just learned something. */
  celebrating: boolean;
}

/** Left column of the Teach page: Pip on its sun halo, with level and XP progress. */
export function PipProgress({ pet, xp, mood, celebrating }: PipProgressProps) {
  const nextLevelXp = pet.nextLevelXp ?? DEFAULT_NEXT_LEVEL_XP;
  const percent = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const remaining = Math.max(0, nextLevelXp - xp);

  return (
    <section
      aria-label="Pip's progress"
      className="flex w-full flex-col items-center gap-5 lg:max-w-[340px] lg:pt-3"
    >
      <div className="flex size-[220px] items-center justify-center rounded-full border-[2.5px] border-ink bg-sun sm:size-[260px]">
        <PipMascot mood={mood} size={190} waving={celebrating} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-heading text-[28px] font-extrabold leading-none">{pet.name}</span>
          <span className="font-heading text-lg font-extrabold">Level {pet.level}</span>
        </div>
        <div
          role="progressbar"
          aria-label={`XP toward level ${pet.level + 1}`}
          aria-valuemin={0}
          aria-valuemax={nextLevelXp}
          aria-valuenow={Math.min(xp, nextLevelXp)}
          className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-border"
        >
          <div
            className="h-full bg-mint transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-muted tabular-nums">
          <span>
            <b className="text-ink">{xp}</b> / {nextLevelXp} XP
          </span>
          <span>
            {remaining > 0 ? `${remaining} XP to level ${pet.level + 1}` : 'Ready to level up!'}
          </span>
        </div>
      </div>

      <p className="w-full border-t-2 border-border pt-3.5 text-[15px] leading-relaxed text-muted">
        Every card you fix gives Pip <b className="text-ink">+20 XP</b> and makes its training data
        a little fairer.
      </p>
    </section>
  );
}
