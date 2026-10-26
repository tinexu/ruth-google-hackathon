import type { Weekly, WeekDay } from '@shared/types';
import { CheckIcon, FlameIcon } from '../icons';

/** Streak count + a 7-day strip, so kids can see the habit they're building. */
export function StreakCard({ streakDays, week, weekly }: { streakDays: number; week: WeekDay[]; weekly: Weekly }) {
  const playedToday = week.find((d) => d.isToday)?.active ?? false;
  return (
    <section aria-labelledby="streak" className="flex flex-col gap-4 rounded-[28px] border-[2.5px] border-ink bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-sun">
          <FlameIcon size={26} />
        </span>
        <div>
          <h2 id="streak" className="font-heading text-2xl font-extrabold leading-tight">
            {streakDays} day{streakDays === 1 ? '' : 's'} in a row
          </h2>
          <p className="text-[15px] text-muted">
            {playedToday
              ? 'You played today. See you tomorrow!'
              : streakDays > 0
                ? 'Play today to keep your streak going.'
                : 'Play today to start a streak.'}
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1.5" aria-label="Last 7 days">
        {week.map((d) => (
          <li key={d.date} className="flex flex-col items-center gap-1">
            <span
              className={`flex size-9 items-center justify-center rounded-full border-2 ${
                d.active ? 'border-ink bg-sun' : d.isToday ? 'border-ink bg-white' : 'border-border bg-ground'
              }`}
              aria-label={`${d.date}: ${d.active ? 'played' : 'not played'}`}
            >
              {d.active && <CheckIcon size={16} />}
            </span>
            <span className={`text-xs font-bold ${d.isToday ? 'text-ink' : 'text-muted'}`}>
              {d.isToday ? 'Today' : d.label}
            </span>
          </li>
        ))}
      </ol>

      <p className="border-t-2 border-border pt-3 text-sm text-muted">
        This week: <b className="text-ink">{weekly.cardsThisWeek}</b> cards ·{' '}
        <b className="text-ink">{weekly.battlesWon}</b> battles won ·{' '}
        <b className="text-ink">{weekly.fakesCaught}</b> fakes caught
      </p>
    </section>
  );
}
