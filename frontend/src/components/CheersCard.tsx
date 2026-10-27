import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Cheer, CheersResponse } from '@shared/types';
import { fetchCheers, sendCheer } from '../lib/api';
import { Card } from './Card';
import { Button } from './Button';
import { TieredPetMascot } from './community/TieredPetMascot';

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/** The cheers classmates sent your pet, with a "Cheer back" on each. */
export function CheersCard({ petName }: { petName: string }) {
  const [cheers, setCheers] = useState<CheersResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCheers()
      .then((data) => {
        if (!cancelled) setCheers(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  const received = cheers?.received ?? [];

  return (
    <Card border="solid" rounded="rounded-[28px]" className="bg-white p-7">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold tracking-wide text-muted">CHEERS FROM YOUR CLASS</p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold text-ink">
            {received.length === 0 ? `No cheers for ${petName} yet` : `${petName} got ${received.length} ${received.length === 1 ? 'cheer' : 'cheers'}!`}
          </h2>
        </div>
        <Link to="/community" className="focus-ring font-heading text-sm font-bold text-pip-blue hover:underline">
          See the leaderboard
        </Link>
      </div>

      {cheers && received.length === 0 && (
        <p className="mt-3 text-muted">Cheer for a classmate on the leaderboard. They might cheer back!</p>
      )}

      {received.length > 0 && (
        <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {received.map((cheer) => (
            <CheerItem
              key={cheer.id}
              cheer={cheer}
              cheeredBack={cheers?.cheeredToday.includes(cheer.fromPet) ?? false}
              onCheerBack={async () => setCheers(await sendCheer(cheer.fromPet))}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

function CheerItem({
  cheer,
  cheeredBack,
  onCheerBack,
}: {
  cheer: Cheer;
  cheeredBack: boolean;
  onCheerBack: () => Promise<void>;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cheerBack() {
    setSending(true);
    setError(null);
    try {
      await onCheerBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send that cheer.');
    } finally {
      setSending(false);
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border-2 border-border bg-ground px-4 py-3">
      <TieredPetMascot tier={cheer.fromTier} color={cheer.fromColor} size={44} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-base font-extrabold leading-tight text-ink">
          {cheer.fromOwner}'s {cheer.fromPet}
        </p>
        <p className="text-sm text-muted">Cheered {timeAgo(cheer.at)}</p>
        {error && (
          <p role="alert" className="mt-1 text-xs font-semibold text-coral-ink">
            {error}
          </p>
        )}
      </div>
      <Button
        variant={cheeredBack ? 'white' : 'sun'}
        onClick={cheerBack}
        disabled={cheeredBack || sending}
        aria-label={cheeredBack ? `Cheered back at ${cheer.fromOwner}` : `Cheer back at ${cheer.fromOwner}`}
        className="shrink-0 px-3 py-1.5 text-sm"
      >
        {cheeredBack ? 'Cheered!' : 'Cheer back'}
      </Button>
    </li>
  );
}
