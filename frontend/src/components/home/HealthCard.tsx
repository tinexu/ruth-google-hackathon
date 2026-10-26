import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Stat, StatColor } from '@shared/types';
import { AboutIcon, ArrowRightIcon } from '../icons';
import { STAT_ACTIVITY } from './quests';

const FILL: Record<StatColor, string> = {
  sun: 'bg-sun',
  'pip-blue': 'bg-pip-blue',
  coral: 'bg-coral',
  mint: 'bg-mint',
};

/**
 * Pip's stats as one compact line each, plus one friendly tip for the lowest
 * stat (a suggestion with a link, not a red warning). Each stat has an info
 * button that opens what it means and how to grow it, one at a time.
 */
export function HealthCard({ stats, lowest }: { stats: Stat[]; lowest?: Stat }) {
  const tip = lowest ? STAT_ACTIVITY[lowest.key] : null;
  const [openKey, setOpenKey] = useState<Stat['key'] | null>(null);

  // Escape closes an open explanation.
  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openKey]);

  return (
    <section aria-labelledby="pip-health" className="flex flex-col gap-4 rounded-[28px] border-[2.5px] border-ink bg-white p-6">
      <h2 id="pip-health" className="font-heading text-2xl font-extrabold leading-tight">
        How Pip is doing
      </h2>

      <ul className="flex flex-col gap-1">
        {stats.map((stat) => {
          const open = openKey === stat.key;
          const panelId = `stat-info-${stat.key}`;
          const activity = STAT_ACTIVITY[stat.key];
          return (
            <li key={stat.key} className="flex flex-col">
              <div className="grid grid-cols-[minmax(0,150px)_1fr_44px] items-center gap-3">
                <div className="flex items-center gap-0.5 font-heading text-base font-bold">
                  {stat.label}
                  <button
                    type="button"
                    aria-label={`What is ${stat.label}?`}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenKey(open ? null : stat.key)}
                    className={`focus-ring flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ${
                      open ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full ${
                        open ? 'bg-pip-blue-light' : 'hover:bg-ground'
                      }`}
                    >
                      <AboutIcon size={18} />
                    </span>
                  </button>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
                  <div className={`h-full rounded-full ${FILL[stat.color]}`} style={{ width: `${stat.value}%` }} />
                </div>
                <div className="text-right font-heading text-sm font-bold tabular-nums">{stat.value}%</div>
              </div>

              {open && (
                <div
                  id={panelId}
                  className="pop-in mb-2 flex flex-col gap-2 rounded-2xl border-2 border-border bg-ground px-4 py-3 text-[15px] leading-snug"
                >
                  {stat.about && (
                    <p>
                      <b>{stat.label}</b> is {stat.about.charAt(0).toLowerCase() + stat.about.slice(1)}
                    </p>
                  )}
                  <p className="text-muted">
                    <b className="text-ink">How to grow it:</b> {stat.note}
                  </p>
                  <Link
                    to={activity.to}
                    className="focus-ring inline-flex items-center gap-1.5 self-start font-heading text-sm font-bold underline underline-offset-4"
                  >
                    {activity.cta}
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>

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
