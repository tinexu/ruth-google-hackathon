import type { ReactNode } from 'react';
import { PipMascot, type PipMood } from '../PipMascot';

/** Pip beside a speech bubble whose pointy corner faces Pip, talking straight to the kid. */
export function PipSays({
  children,
  mood = 'happy',
  size = 56,
}: {
  children: ReactNode;
  mood?: PipMood;
  size?: number;
}) {
  return (
    <div className="flex items-start gap-3">
      <PipMascot mood={mood} size={size} waving={false} className="shrink-0" />
      <div className="rounded-[6px_20px_20px_20px] border-[2.5px] border-ink bg-white px-3.5 py-3 font-heading text-[17px] font-semibold leading-snug">
        {children}
      </div>
    </div>
  );
}
