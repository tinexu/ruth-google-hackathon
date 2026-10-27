import { useState } from 'react';
import { thankCheer, useCheers, type ReceivedCheer } from '../lib/cheers';
import { Card } from './Card';
import { Button } from './Button';
import { TieredPetMascot } from './community/TieredPetMascot';

const THANKS_MS = 700;

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/** New cheers from classmates. Each one shows until you say thanks; with none left, the card goes away. */
export function CheersCard({ petName, className = '' }: { petName: string; className?: string }) {
  const { inbox } = useCheers();
  if (inbox.length === 0) return null;

  return (
    <Card border="solid" rounded="rounded-[28px]" className={`bg-white p-7 ${className}`}>
      <p className="text-xs font-bold tracking-wide text-muted">NEW CHEERS</p>
      <h2 className="mt-1 font-heading text-2xl font-extrabold text-ink">
        {inbox.length === 1 ? `${inbox[0].fromOwner} cheered for ${petName}!` : `${inbox.length} classmates cheered for ${petName}!`}
      </h2>

      <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {inbox.map((cheer) => (
          <CheerItem key={cheer.id} cheer={cheer} />
        ))}
      </ul>
    </Card>
  );
}

function CheerItem({ cheer }: { cheer: ReceivedCheer }) {
  const [thanked, setThanked] = useState(false);

  function thank() {
    setThanked(true);
    // Let the heart float up before the cheer leaves the inbox.
    window.setTimeout(() => thankCheer(cheer.id), THANKS_MS);
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border-2 border-border bg-ground px-4 py-3 transition-opacity duration-500 ${
        thanked ? 'opacity-0 delay-200' : ''
      }`}
    >
      <TieredPetMascot tier={cheer.fromTier} color={cheer.fromColor} size={44} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-base font-extrabold leading-tight text-ink">
          {cheer.fromOwner}'s {cheer.fromPet}
        </p>
        <p className="text-sm text-muted">Cheered {timeAgo(cheer.at)}</p>
      </div>
      <div className="relative shrink-0">
        <Button
          variant="sun"
          onClick={thank}
          disabled={thanked}
          aria-label={`Say thanks to ${cheer.fromOwner}`}
          className="px-3 py-1.5 text-sm"
        >
          Thanks!
        </Button>
        {thanked && (
          <span aria-hidden="true" className="cheer-float pointer-events-none absolute -top-2 left-1/2 text-coral">
            <svg width="22" height="22" viewBox="-16 -12 32 30">
              <path d="M0 -4 c-5 -7 -15 -3 -15 4 c0 7 9 11 15 16 c6 -5 15 -9 15 -16 c0 -7 -10 -11 -15 -4 Z" fill="currentColor" stroke="#1B2140" strokeWidth="2.5" />
            </svg>
          </span>
        )}
      </div>
    </li>
  );
}
