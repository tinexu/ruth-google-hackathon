import type { Weekly, WeekDay } from '@shared/types';
import { CheckIcon, FlameIcon } from '../icons';

/** Streak count + a 7-day strip on a taped-up note, so kids can see the habit they're building. */
export function StreakCard({ streakDays, week, weekly }: { streakDays: number; week: WeekDay[]; weekly: Weekly }) {
  const playedToday = week.find((d) => d.isToday)?.active ?? false;
  return (
    <section
      aria-labelledby="streak"
      className="relative flex rotate-[0.6deg] flex-col gap-3 border-[3px] border-room-ink bg-room-note-pink px-4 pb-3.5 pt-4 shadow-[0_5px_0_rgba(28,20,16,0.35)]"
    >
      {/* a strip of tape holding the note up */}
      <span aria-hidden="true" className="absolute -top-2.5 left-8 h-4 w-12 -rotate-6 bg-[rgba(255,244,199,0.9)]" />
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-room-ink bg-room-sun">
          <FlameIcon size={24} strokeWidth={2.4} />
        </span>
        <div>
          <h2 id="streak" className="font-heading text-[22px] font-extrabold leading-tight">
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

      <ol className="grid grid-cols-7 gap-1" aria-label="Last 7 days">
        {week.map((d) => (
          <li key={d.date} className="flex flex-col items-center gap-1">
            <span
              className={`flex size-8 items-center sm:size-9 justify-center rounded-full border-[3px] border-room-ink ${
                d.active ? 'bg-room-sun' : 'bg-white'
              } ${d.isToday ? 'shadow-[0_0_0_3px_var(--color-room-orange)]' : ''}`}
              aria-label={`${d.date}: ${d.active ? 'played' : 'not played'}`}
            >
              {d.active && <CheckIcon size={16} strokeWidth={3} />}
            </span>
            <span className={`text-xs font-extrabold ${d.isToday ? 'text-room-ink' : 'text-muted'}`}>
              {d.isToday ? 'Today' : d.label}
            </span>
          </li>
        ))}
      </ol>

      <p className="border-t-[3px] border-dashed border-room-ink/25 pt-2.5 text-sm text-muted">
        This week: <b className="text-room-ink">{weekly.cardsThisWeek}</b> cards ·{' '}
        <b className="text-room-ink">{weekly.battlesWon}</b> battles won ·{' '}
        <b className="text-room-ink">{weekly.fakesCaught}</b> fakes caught
      </p>
    </section>
  );
}
