import { Link } from 'react-router-dom';
import type { TodayProgress } from '@shared/types';
import { CheckIcon } from '../icons';
import { isDone, type Quest } from './quests';

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(1, value / goal);
  const done = progress >= 1;
  return (
    <svg
      width="112"
      height="112"
      viewBox="0 0 112 112"
      role="img"
      aria-label={`${value} of ${goal} XP today`}
      className="shrink-0"
    >
      <circle cx="56" cy="56" r={r} fill="none" className="stroke-border" strokeWidth="12" />
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        className={done ? 'stroke-mint' : 'stroke-sun'}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${progress * circumference} ${circumference}`}
        transform="rotate(-90 56 56)"
      />
      <text x="56" y="56" textAnchor="middle" className="fill-ink font-heading" fontSize="26" fontWeight="800">
        {value}
      </text>
      <text x="56" y="76" textAnchor="middle" className="fill-muted" fontSize="13" fontWeight="700">
        / {goal} XP
      </text>
    </svg>
  );
}

/** Daily goal ring + today's three quests: small, clear targets that link straight to the activity. */
export function DailyGoalCard({ today, quests }: { today: TodayProgress; quests: Quest[] }) {
  const goalDone = today.xp >= today.goalXp;
  return (
    <section
      aria-labelledby="daily-goal"
      className="flex flex-col gap-5 rounded-[28px] border-[2.5px] border-ink bg-white p-6"
    >
      <div className="flex items-center gap-5">
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

      <ul className="flex flex-col gap-2">
        {quests.map((q) => {
          const done = isDone(q);
          const Icon = q.icon;
          return (
            <li key={q.id}>
              <Link
                to={q.to}
                className={`focus-ring flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${
                  done ? 'bg-mint-light' : 'bg-ground hover:bg-pip-blue-light'
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink ${
                    done ? 'bg-mint' : 'bg-white'
                  }`}
                >
                  {done ? <CheckIcon size={18} /> : <Icon size={20} />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={`font-heading text-base font-bold ${done ? 'text-ink' : ''}`}>
                    {q.label}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-border" aria-hidden="true">
                    <span
                      className={`block h-full rounded-full ${done ? 'bg-mint' : 'bg-pip-blue'}`}
                      style={{ width: `${Math.min(100, (q.value / q.target) * 100)}%` }}
                    />
                  </span>
                </span>
                <span className="w-10 shrink-0 text-right font-heading text-sm font-bold tabular-nums text-muted">
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
