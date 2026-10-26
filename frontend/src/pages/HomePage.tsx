import { useNavigate, useOutletContext } from 'react-router-dom';
import type { HomeData } from '@shared/types';
import { getLowestStat } from '../lib/derive';
import { PipMascot } from '../components/PipMascot';
import { SpeechBubble } from '../components/SpeechBubble';
import { Button } from '../components/Button';
import { ArrowRightIcon } from '../components/icons';
import { DailyGoalCard } from '../components/home/DailyGoalCard';
import { HealthCard } from '../components/home/HealthCard';
import { SkillsCard } from '../components/home/SkillsCard';
import { StreakCard } from '../components/home/StreakCard';
import { dailyQuests, nextStep } from '../components/home/quests';

// Dashboard layout, top to bottom on phones:
//  1. Pip + one big "next step" button (one clear action, not three equal ones)
//  2. Daily goal ring + today's quests (small, reachable targets)
//  3. Streak week strip (the habit), 4. Pip's stats with one tip, 5. skills as a short list
export function HomePage() {
  const data = useOutletContext<HomeData>();
  const navigate = useNavigate();
  const { kid, pet, stats, weekly, skills, totalSkills, today, week } = data;

  const lowest = getLowestStat(stats);
  const quests = dailyQuests(today);
  const next = nextStep(quests, lowest);

  const levelStart = pet.levelStartXp ?? 0;
  const levelEnd = pet.nextLevelXp ?? levelStart + 100;
  const levelPercent = Math.min(100, Math.round(((kid.xp - levelStart) / Math.max(1, levelEnd - levelStart)) * 100));

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10 text-ink">
      <h1 className="font-heading text-[40px] font-extrabold leading-tight">Hi {kid.name}!</h1>
      <p className="mt-1 text-lg text-muted">
        {today.xp >= today.goalXp
          ? 'You hit today’s goal. Nice work!'
          : today.xp > 0
            ? `${today.goalXp - today.xp} XP to go for today’s goal.`
            : 'Ready for today? Your next step is right below Pip.'}
      </p>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Pip, level progress and the one main action */}
        <section
          aria-labelledby="pip-name"
          className="flex flex-col gap-5 rounded-[32px] border-[2.5px] border-ink bg-pip-blue-light p-6 sm:p-8"
        >
          <SpeechBubble className="max-w-sm self-start">{pet.speech}</SpeechBubble>

          <div className="flex justify-center">
            <PipMascot size={220} waving className="animate-pip-bounce" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="pip-name" className="font-heading text-2xl font-extrabold">
                {pet.name} · Level {pet.level}
              </h2>
              <span className="text-sm font-bold text-muted">{pet.levelTitle}</span>
            </div>
            <div
              role="progressbar"
              aria-label={`Progress to level ${pet.level + 1}`}
              aria-valuemin={levelStart}
              aria-valuemax={levelEnd}
              aria-valuenow={kid.xp}
              className="h-4 overflow-hidden rounded-full border-2 border-ink bg-white"
            >
              <div className="h-full bg-mint transition-[width] duration-500" style={{ width: `${levelPercent}%` }} />
            </div>
            <p className="text-sm text-muted tabular-nums">
              <b className="text-ink">{Math.max(0, levelEnd - kid.xp)} XP</b> to level {pet.level + 1}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="sun" onClick={() => navigate(next.to)} className="w-full py-4 text-lg">
              {next.label}
              <ArrowRightIcon size={20} />
            </Button>
            <p className="text-center text-sm text-muted">{next.reason}</p>
          </div>
        </section>

        {/* Today: goal + quests, then the streak */}
        <div className="flex flex-col gap-6">
          <DailyGoalCard today={today} quests={quests} />
          <StreakCard streakDays={kid.streakDays} week={week} weekly={weekly} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.25fr]">
        <HealthCard stats={stats} lowest={lowest} />

        <SkillsCard skills={skills} totalSkills={totalSkills} />
      </div>
    </main>
  );
}
