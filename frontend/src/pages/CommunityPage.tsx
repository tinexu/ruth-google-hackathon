import { useEffect, useState } from 'react';
import type { CommunityData } from '@shared/types';
import { fetchCommunityData } from '../lib/api';
import { sendCheer, useCheers } from '../lib/cheers';
import { PipMascot } from '../components/PipMascot';
import { Card } from '../components/Card';
import { ToggleGroup } from '../components/community/ToggleGroup';
import { PodiumCard } from '../components/community/PodiumCard';
import { LeaderboardRow } from '../components/community/LeaderboardRow';
import { EvolutionCard } from '../components/community/EvolutionCard';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: CommunityData };

const TIME_OPTIONS = [
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All time' },
] as const;
const AUDIENCE_OPTIONS = [
  { value: 'friends', label: 'Friends' },
  { value: 'school', label: 'Whole school' },
] as const;

export function CommunityPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [timeframe, setTimeframe] = useState<(typeof TIME_OPTIONS)[number]['value']>('week');
  const { cheeredToday } = useCheers();
  const [audience, setAudience] = useState<(typeof AUDIENCE_OPTIONS)[number]['value']>('friends');

  useEffect(() => {
    let cancelled = false;
    fetchCommunityData()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({ status: 'error', message: e instanceof Error ? e.message : 'Unknown error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <main className="mx-auto flex max-w-[1360px] flex-col items-center gap-4 px-6 py-24">
        <PipMascot mood="happy" size={100} waving={false} className="animate-pip-bounce" />
        <p className="font-heading text-lg font-bold text-ink">Loading the leaderboard…</p>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="mx-auto flex max-w-[1360px] flex-col items-center gap-4 px-6 py-24 text-center">
        <PipMascot mood="worried" size={120} waving={false} />
        <h1 className="font-heading text-2xl font-extrabold text-ink">
          Pip couldn't load the class
        </h1>
        <p className="max-w-sm text-muted">{state.message}</p>
      </main>
    );
  }

  const { className, leaderboard, growthStages, currentTier, nextUpgrade } = state.data;
  const top3 = leaderboard.filter((e) => e.rank <= 3);
  const rest = leaderboard.filter((e) => e.rank > 3);
  const maxXp = leaderboard[0]?.xp ?? 1;

  return (
    <main className="mx-auto max-w-[1360px] px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[40px] font-extrabold leading-tight text-ink">
            {className} leaderboard
          </h1>
          <p className="mt-1 text-lg text-muted">
            Pets get stronger as their owners learn. Who's on top this week?
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            ariaLabel="Time range"
            options={TIME_OPTIONS}
            value={timeframe}
            onChange={setTimeframe}
          />
          <ToggleGroup
            ariaLabel="Audience"
            options={AUDIENCE_OPTIONS}
            value={audience}
            onChange={setAudience}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <PodiumCard top3={top3} />

          <Card border="solid" rounded="rounded-[28px]" className="flex flex-col gap-1 bg-white p-4">
            {rest.map((entry, i) => (
              <LeaderboardRow
                key={entry.rank}
                entry={entry}
                maxXp={maxXp}
                entryAbove={i === 0 ? top3[top3.length - 1] : rest[i - 1]}
                cheered={cheeredToday.includes(entry.petName)}
                onCheer={() => sendCheer(entry.petName)}
              />
            ))}
          </Card>
        </div>

        <div>
          <EvolutionCard stages={growthStages} currentTier={currentTier} upgrade={nextUpgrade} />
        </div>
      </div>
    </main>
  );
}
