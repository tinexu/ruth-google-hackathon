import type { Stat, StatColor } from '@shared/types';

const fillClasses: Record<StatColor, string> = {
  sun: 'bg-sun',
  'pip-blue': 'bg-pip-blue',
  coral: 'bg-coral',
  mint: 'bg-mint',
};

interface StatBarProps {
  stat: Stat;
  /** true when this is the lowest stat and should be flagged "needs care" */
  needsCare?: boolean;
}

export function StatBar({ stat, needsCare = false }: StatBarProps) {
  const row = (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-heading text-base font-bold text-ink">{stat.label}</span>
        <span className="font-heading text-base font-bold text-ink">
          {stat.value}%{needsCare && <span className="text-coral"> · needs care</span>}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${fillClasses[stat.color]}`}
          style={{ width: `${stat.value}%` }}
        />
      </div>
      <p className={`mt-1.5 text-sm ${needsCare ? 'text-coral font-semibold' : 'text-muted'}`}>
        {stat.note}
      </p>
    </div>
  );

  if (!needsCare) return row;

  return <div className="rounded-2xl bg-coral-light px-4 py-3">{row}</div>;
}
