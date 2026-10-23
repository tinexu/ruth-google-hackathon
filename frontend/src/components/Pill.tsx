import type { ReactNode } from 'react';

export type PillTone =
  | 'sun' // yellow fill, ink text — active nav tab, "mastered" badge support
  | 'mint' // green fill, ink text — "mastered" skill badge
  | 'coral' // coral fill, ink text — "in training" badge
  | 'navChip' // dark pill on the nav bar — streak / XP
  | 'white' // white fill, ink border — mood pill, "locked" badge
  | 'blueTint'; // pale blue fill, ink text — "level x of y" badge

const toneClasses: Record<PillTone, string> = {
  sun: 'bg-sun text-ink border-2 border-ink',
  mint: 'bg-mint text-ink border-2 border-ink',
  coral: 'bg-coral text-ink border-2 border-ink',
  navChip: 'bg-nav-chip text-white border border-nav-border',
  white: 'bg-white text-ink border-2 border-ink',
  blueTint: 'bg-pip-blue-light text-ink border-2 border-ink',
};

interface PillProps {
  tone: PillTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Pill({ tone, children, icon, className = '' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-heading font-semibold whitespace-nowrap ${toneClasses[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
