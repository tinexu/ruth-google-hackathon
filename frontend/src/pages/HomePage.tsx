import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { HomeData } from '@shared/types';
import { getLowestStat } from '../lib/derive';
import { ArrowRightIcon, QuestsIcon } from '../components/icons';
import { DailyGoalCard } from '../components/home/DailyGoalCard';
import { HealthCard } from '../components/home/HealthCard';
import { SkillsCard } from '../components/home/SkillsCard';
import { StreakCard } from '../components/home/StreakCard';
import { dailyQuests, isDone, nextStep } from '../components/home/quests';
import { RoomScene } from '../components/room/RoomScene';
import { RoomToolbar } from '../components/room/RoomToolbar';
import { RoomPanel } from '../components/room/RoomPanel';
import { RoomHint } from '../components/room/RoomHint';
import { pipSays } from '../components/room/pipSays';
import type { RoomAction, RoomPanel as Panel } from '../components/room/roomSpots';

// Which bottom button lights up with the suggested object in the room.
const TOOL_FOR_SPOT: Record<string, string> = { computer: 'learn', arcade: 'battle', dumbbell: 'train' };

function LevelShield({ level, size = 52 }: { level: number; size?: number }) {
  return (
    <svg width={size} height={size * (56 / 52)} viewBox="0 0 52 56" aria-hidden="true" className="shrink-0">
      <path
        d="M26 3 L48 11 V28 C48 42 38 50 26 54 C14 50 4 42 4 28 V11 Z"
        className="fill-room-sun stroke-room-ink"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <text x="26" y="38" textAnchor="middle" className="fill-room-ink font-heading" fontSize="24" fontWeight="800">
        {level}
      </text>
    </svg>
  );
}

function ProgressBar({ percent, className = '' }: { percent: number; className?: string }) {
  return (
    <span className={`block overflow-hidden rounded-full border-[3px] border-room-ink bg-white ${className}`}>
      <span className="block h-full bg-mint" style={{ width: `${percent}%` }} />
    </span>
  );
}

/**
 * Home is Pip's room: tap things in the room (or the buttons along the bottom)
 * to learn, train, battle and check on Pip. Today's quests and Pip's checkup
 * open as panels over the room, so the room stays the home base.
 */
export function HomePage() {
  const data = useOutletContext<HomeData>();
  const navigate = useNavigate();
  const { kid, pet, stats, weekly, skills, totalSkills, today, week } = data;
  const [panel, setPanel] = useState<Panel | null>(null);

  const lowest = getLowestStat(stats);
  const quests = dailyQuests(today);
  const questsLeft = quests.filter((q) => !isDone(q)).length;
  const next = nextStep(quests, lowest);
  const say = pipSays(quests, lowest);

  const levelStart = pet.levelStartXp ?? 0;
  const levelEnd = pet.nextLevelXp ?? levelStart + 100;
  const levelPercent = Math.min(100, Math.round(((kid.xp - levelStart) / Math.max(1, levelEnd - levelStart)) * 100));
  const xpToGo = Math.max(0, levelEnd - kid.xp);

  const act = (action: RoomAction) => {
    if (action.kind === 'go') navigate(action.to);
    else setPanel(action.panel);
  };
  const go = (to: string) => {
    setPanel(null);
    navigate(to);
  };

  const questsLabel = questsLeft > 0 ? `Today’s quests: ${questsLeft} left` : 'Today’s quests: all done';
  const levelLabel = `Level ${pet.level}, ${xpToGo} XP to level ${pet.level + 1}. Open Pip’s checkup`;

  const questsBadge =
    questsLeft > 0 ? (
      <span className="absolute -right-1.5 -top-1.5 flex size-7 items-center justify-center rounded-full border-[3px] border-room-ink bg-room-red font-heading text-sm font-extrabold text-white">
        {questsLeft}
      </span>
    ) : null;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-room-sky bg-[radial-gradient(rgba(255,255,255,0.55)_2px,transparent_2.5px)] bg-[length:28px_28px] text-room-ink">
      <div className="mx-auto flex max-w-[1290px] flex-col items-center gap-4 px-4 pb-14 pt-6 sm:px-6">
        <h1 className="room-title text-center font-heading text-[32px] font-extrabold leading-tight sm:text-[40px]">
          {kid.name}’s Room
        </h1>

        {/* Phones and tablets: level and quests sit above the room instead of over it */}
        <div className="flex w-full max-w-[640px] items-center gap-2.5 lg:hidden">
          <button
            type="button"
            aria-label={levelLabel}
            onClick={() => setPanel('checkup')}
            className="focus-ring flex min-h-[56px] flex-1 items-center gap-2 rounded-full border-4 border-room-ink bg-white py-1 pl-1 pr-4 shadow-[0_3px_0_var(--color-room-ink)]"
          >
            <LevelShield level={pet.level} size={40} />
            <span className="flex flex-1 flex-col gap-1 text-left">
              <span className="font-heading text-sm font-extrabold leading-none">
                {xpToGo} XP to level {pet.level + 1}
              </span>
              <ProgressBar percent={levelPercent} className="h-3" />
            </span>
          </button>
          <button
            type="button"
            aria-label={questsLabel}
            onClick={() => setPanel('quests')}
            className="focus-ring relative flex size-[60px] shrink-0 items-center justify-center rounded-full border-4 border-room-ink bg-white shadow-[inset_0_-5px_0_#c9d2e6,0_3px_0_var(--color-room-ink)]"
          >
            <QuestsIcon size={30} strokeWidth={2.4} />
            {questsBadge}
          </button>
        </div>

        <RoomHint />

        {/* The room, in a chunky blue game frame */}
        <div className="w-full rounded-[30px] border-[5px] border-room-ink bg-room-blue p-2 shadow-[inset_0_-6px_0_rgba(0,0,0,0.2),0_8px_0_var(--color-room-ink)] sm:rounded-[38px] sm:p-3">
          <div className="relative aspect-[1200/760] overflow-hidden rounded-[22px] border-[5px] border-room-ink sm:rounded-[26px]">
            <RoomScene onAction={act} suggested={say.spot} bubble={say} />

            <div className="hidden lg:block">
              <button
                type="button"
                aria-label={questsLabel}
                onClick={() => setPanel('quests')}
                className="focus-ring absolute left-4 top-4 flex flex-col items-center gap-0.5"
              >
                <span className="relative flex size-[70px] items-center justify-center rounded-full border-[5px] border-room-ink bg-white shadow-[inset_0_-5px_0_#c9d2e6,0_4px_0_var(--color-room-ink)]">
                  <QuestsIcon size={36} strokeWidth={2.2} />
                  {questsBadge}
                </span>
                <span className="room-label font-heading text-[15px] font-extrabold">QUESTS</span>
              </button>

              <button
                type="button"
                aria-label={levelLabel}
                onClick={() => setPanel('checkup')}
                className="focus-ring absolute right-4 top-4 flex items-center gap-2.5 rounded-full border-[5px] border-room-ink bg-white py-1.5 pl-1.5 pr-4 text-left shadow-[0_4px_0_var(--color-room-ink)]"
              >
                <LevelShield level={pet.level} />
                <span className="flex flex-col gap-1">
                  <span className="font-heading text-[15px] font-extrabold leading-none">
                    LEVEL {pet.level} · {xpToGo} XP to go
                  </span>
                  <ProgressBar percent={levelPercent} className="h-3 w-[170px]" />
                  <span className="text-xs font-bold text-muted">
                    Today: {today.xp} / {today.goalXp} XP
                  </span>
                </span>
              </button>

              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2">
                <RoomToolbar variant="bar" highlight={TOOL_FOR_SPOT[say.spot]} onAction={act} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[640px] flex-col items-center gap-3 lg:hidden">
          <p className="text-center font-heading text-base font-extrabold">{say.line}</p>
          <RoomToolbar variant="grid" highlight={TOOL_FOR_SPOT[say.spot]} onAction={act} />
        </div>

        <p className="hidden text-base font-bold lg:block">Tap anything in your room, or use the buttons along the bottom.</p>
      </div>

      <RoomPanel open={panel === 'quests'} title="Today’s Quests" onClose={() => setPanel(null)}>
        <div className="rounded-[22px] border-[5px] border-room-ink bg-room-cork-frame p-2.5">
          <div className="flex flex-col gap-4 rounded-[14px] bg-room-cork p-4 shadow-[inset_0_0_0_2px_#5a3420] sm:p-5">
            <DailyGoalCard today={today} quests={quests} />
            <StreakCard streakDays={kid.streakDays} week={week} weekly={weekly} />
            <NextButton label={next.label} onClick={() => go(next.to)} />
          </div>
        </div>
      </RoomPanel>

      <RoomPanel open={panel === 'checkup'} title="Pip’s Checkup" onClose={() => setPanel(null)}>
        <div className="flex flex-col gap-4 rounded-[22px] border-[5px] border-room-ink bg-[#e1ebf2] p-4 sm:p-5">
          <section
            aria-label="Pip’s level"
            className="flex items-center gap-3.5 rounded-[18px] border-4 border-room-ink bg-white px-4 py-3 shadow-[0_4px_0_var(--color-room-ink)]"
          >
            <LevelShield level={pet.level} size={56} />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="font-heading text-xl font-extrabold">
                  Level {pet.level} · {pet.levelTitle}
                </span>
                <span className="text-sm font-bold tabular-nums text-muted">
                  {kid.xp} / {levelEnd} XP
                </span>
              </div>
              <ProgressBar percent={levelPercent} className="h-4" />
              <span className="text-sm text-muted">
                <b className="text-room-ink">{xpToGo} XP</b> to level {pet.level + 1}
              </span>
            </div>
          </section>
          <HealthCard stats={stats} lowest={lowest} />
          <SkillsCard skills={skills} totalSkills={totalSkills} />
        </div>
      </RoomPanel>
    </main>
  );
}

function NextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex min-h-[60px] items-center justify-center gap-2.5 rounded-[20px] border-[5px] border-room-ink bg-room-sun font-heading text-[22px] font-extrabold text-room-ink shadow-[inset_0_-5px_0_rgba(0,0,0,0.2),0_6px_0_var(--color-room-ink)] active:translate-y-0.5"
    >
      {label}!
      <ArrowRightIcon size={22} strokeWidth={3} />
    </button>
  );
}
