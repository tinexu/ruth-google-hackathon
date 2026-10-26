import { Link } from 'react-router-dom';
import type { Stat, StatColor } from '@shared/types';
import { ArrowRightIcon } from '../icons';
import { STAT_ACTIVITY } from './quests';

const FILL: Record<StatColor, string> = {
  sun: 'bg-sun',
  'pip-blue': 'bg-pip-blue',
  coral: 'bg-coral',
  mint: 'bg-mint',
};

/**
 * Pip's stats as one compact line each, plus one friendly tip for the lowest
 * stat (a suggestion with a link, not a red warning).
 */
export function HealthCard({ stats, lowest }: { stats: Stat[]; lowest?: Stat }) {
  const tip = lowest ? STAT_ACTIVITY[lowest.key] : null;
  return (
    <section aria-labelledby="pip-health" className="flex flex-col gap-4 rounded-[28px] border-[2.5px] border-ink bg-white p-6">
      <h2 id="pip-health" className="font-heading text-2xl font-extrabold leading-tight">
        How Pip is doing
      </h2>

      <dl className="flex flex-col gap-3">
        {stats.map((stat) => (
          <div key={stat.key} className="grid grid-cols-[110px_1fr_44px] items-center gap-3">
            <dt className="font-heading text-base font-bold">{stat.label}</dt>
            <dd className="h-2.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
              <div className={`h-full rounded-full ${FILL[stat.color]}`} style={{ width: `${stat.value}%` }} />
            </dd>
            <dd className="text-right font-heading text-sm font-bold tabular-nums">{stat.value}%</dd>
          </div>
        ))}
      </dl>

      {lowest && tip && (
        <div className="flex flex-col gap-2 rounded-2xl bg-pip-blue-light px-4 py-3">
          <p className="text-[15px] leading-snug">
            <b>Tip:</b> {tip.how}
          </p>
          <Link
            to={tip.to}
            className="focus-ring inline-flex items-center gap-1.5 self-start font-heading text-sm font-bold underline underline-offset-4"
          >
            Boost {lowest.label}
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
