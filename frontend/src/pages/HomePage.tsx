import { useNavigate, useOutletContext } from 'react-router-dom';
import type { HomeData } from '@shared/types';
import { getLowestStat, getUnlockedSkillCount } from '../lib/derive';
import { PipMascot } from '../components/PipMascot';
import { SpeechBubble } from '../components/SpeechBubble';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatBar } from '../components/StatBar';
import { SkillCard } from '../components/SkillCard';
import { CheersCard } from '../components/CheersCard';
import { FeedIcon, ZapIcon, UsersIcon } from '../components/icons';

export function HomePage() {
  const data = useOutletContext<HomeData>();
  const navigate = useNavigate();
  const { kid, pet, stats, weekly, skills, totalSkills } = data;

  const lowest = getLowestStat(stats);
  const unlockedCount = getUnlockedSkillCount(skills);

  return (
    <main className="mx-auto max-w-[1360px] px-6 py-10">
      {/* greeting */}
      <h1 className="font-heading text-[40px] font-extrabold leading-tight text-ink">
        Hi {kid.name}, Pip missed you!
      </h1>
      <p className="mt-1 text-lg text-muted">
        Pip is feeling {pet.mood} today. Teach it something new?
      </p>

      {/* two column row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* pet stage card */}
        <Card
          border="solid"
          rounded="rounded-[32px]"
          className="flex flex-col bg-pip-blue-light p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-ink">{pet.name}</h2>
              <p className="text-sm font-semibold text-muted">
                Level {pet.level} · {pet.levelTitle}
              </p>
            </div>
            <Pill tone="white" icon={<span className="h-2.5 w-2.5 rounded-full bg-mint" aria-hidden />}>
              Mood: {pet.mood}
            </Pill>
          </div>

          <SpeechBubble className="mt-6 max-w-sm self-start">{pet.speech}</SpeechBubble>

          <div className="flex flex-1 items-center justify-center py-4">
            <PipMascot mood="happy" size={280} waving />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="sun"
              icon={<FeedIcon width={18} height={18} className="stroke-ink" />}
              onClick={() => navigate('/feed')}
            >
              Feed Pip a lesson
            </Button>
            <Button
              variant="coral"
              icon={<ZapIcon width={18} height={18} className="stroke-ink" />}
              onClick={() => navigate('/battle')}
            >
              Prompt Battle
            </Button>
            <Button
              variant="white"
              icon={<UsersIcon width={18} height={18} className="stroke-ink" />}
              onClick={() => navigate('/community')}
            >
              Take Pip to play
            </Button>
          </div>
        </Card>

        {/* health report card */}
        <Card border="solid" rounded="rounded-[28px]" className="flex flex-col bg-white p-7">
          <div>
            <p className="text-xs font-bold tracking-wide text-muted">HEALTH REPORT CARD</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold text-ink">
              How Pip is doing
            </h2>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {stats.map((stat) => (
              <StatBar key={stat.key} stat={stat} needsCare={lowest?.key === stat.key} />
            ))}
          </div>

          <div className="mt-auto flex gap-10 border-t border-border pt-5 text-left">
            <WeeklyStat value={weekly.cardsThisWeek} label="cards this week" />
            <WeeklyStat value={weekly.battlesWon} label="battles won" />
            <WeeklyStat value={weekly.fakesCaught} label="fakes caught" />
          </div>
        </Card>
      </div>

      <CheersCard petName={pet.name} className="mt-6" />

      {/* skills section */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-ink">What Pip knows</h2>
            <p className="mt-1 text-muted">
              Every skill Pip learns can be used when it plays in Community.
            </p>
          </div>
          <p className="font-heading text-sm font-bold text-ink">
            {unlockedCount} of {totalSkills} skills unlocked
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>
    </main>
  );
}

function WeeklyStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-heading text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
