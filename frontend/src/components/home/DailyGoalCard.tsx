import { Link } from 'react-router-dom';
import type { TodayProgress } from '@shared/types';
import { CheckIcon } from '../icons';
import { isDone, type Quest } from './quests';

/** A round push pin for notes on the cork board. */
export function Pin({ color, className = '' }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-2.5 left-1/2 size-[18px] -translate-x-1/2 rounded-full border-[3px] border-room-ink shadow-[inset_2px_2px_0_rgba(255,255,255,0.55)] ${color} ${className}`}
    />
  );
}

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(1, value / goal);
  const done = progress >= 1;
  return (
    <svg
      width="104"
      height="104"
      viewBox="0 0 112 112"
      role="img"
      aria-label={`${value} of ${goal} XP today`}
      className="shrink-0"
    >
      <circle cx="56" cy="56" r={r} fill="none" className="stroke-room-track" strokeWidth="14" />
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        className={done ? 'stroke-room-green' : 'stroke-room-sun'}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${progress * circumference} ${circumference}`}
        transform="rotate(-90 56 56)"
      />
      <circle cx="56" cy="56" r="52" fill="none" className="stroke-room-ink" strokeWidth="3" />
      <circle cx="56" cy="56" r="36" fill="none" className="stroke-room-ink" strokeWidth="3" />
      <text x="56" y="58" textAnchor="middle" className="fill-room-ink font-heading" fontSize="28" fontWeight="800">
        {value}
      </text>
      <text x="56" y="77" textAnchor="middle" className="fill-muted" fontSize="12" fontWeight="700">
        / {goal} XP
      </text>
    </svg>
  );
}

// Each quest note sits at its own slight angle, like it was pinned by hand.
const TILT = ['-rotate-2', 'rotate-[1.5deg]', '-rotate-1'];

/**
 * The daily goal as a pinned note, and today's quests as sticky notes: green
 * when done, yellow and outlined for the one to do next, white for later.
 */
export function DailyGoalCard({ today, quests }: { today: TodayProgress; quests: Quest[] }) {
  const goalDone = today.xp >= today.goalXp;
  const nextId = quests.find((q) => !isDone(q))?.id;
  return (
    <section aria-labelledby="daily-goal" className="flex flex-col gap-5">
      <div className="relative -rotate-1 border-[3px] border-room-ink bg-white px-4 py-3.5 shadow-[0_5px_0_rgba(28,20,16,0.35)]">
        <Pin color="bg-room-orange" />
        <div className="flex items-center gap-4">
          <GoalRing value={today.xp} goal={today.goalXp} />
          <div className="flex flex-col gap-1">
            <h2 id="daily-goal" className="font-heading text-2xl font-extrabold leading-tight">
              {goalDone ? 'Daily goal done!' : 'Daily goal'}
            </h2>
            <p className="text-[15px] text-muted">
              {goalDone
                ? 'Pip is proud of you. Extra XP still counts toward your next level.'
                : `${today.goalXp - today.xp} XP to go. Finish a quest or two to get there.`}
            </p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3.5">
        {quests.map((q, i) => {
          const done = isDone(q);
          const next = q.id === nextId;
          const Icon = q.icon;
          return (
            <li key={q.id}>
              <Link
                to={q.to}
                className={`focus-ring relative flex h-full flex-row items-center gap-3 border-[3px] border-room-ink px-3 pb-3 pt-4 text-room-ink transition-transform hover:-translate-y-0.5 sm:min-h-[156px] sm:flex-col sm:items-start ${TILT[i % TILT.length]} ${
                  done
                    ? 'bg-room-note-mint shadow-[0_5px_0_rgba(28,20,16,0.35)]'
                    : next
                      ? 'bg-room-note-sun shadow-[0_0_0_4px_var(--color-room-sun),0_6px_0_rgba(28,20,16,0.4)]'
                      : 'bg-white shadow-[0_5px_0_rgba(28,20,16,0.35)]'
                }`}
              >
                <Pin color={done ? 'bg-room-green' : next ? 'bg-room-red' : 'bg-room-blue'} />
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-room-ink ${
                    done ? 'bg-room-green text-white' : next ? 'bg-room-orange' : 'bg-room-track'
                  }`}
                >
                  {done ? <CheckIcon size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={2.6} />}
                </span>
                <span className="min-w-0 flex-1 font-heading text-[17px] font-extrabold leading-tight">{q.label}</span>
                <span
                  className={`shrink-0 text-[13px] font-extrabold tabular-nums sm:mt-auto ${
                    done ? '' : next ? 'text-coral-ink' : 'text-muted'
                  }`}
                >
                  {done ? 'Done! ' : next ? <span className="hidden sm:inline">NEXT UP · </span> : ''}
                  {Math.min(q.value, q.target)}/{q.target}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
