import type { BattleResult, Kid, Opponent, PublicChallenge } from '@shared/types';
import { CheckIcon, CrossIcon } from '../icons';

function Avatar({ initial, color }: { initial: string; color: string }) {
  return (
    <span
      className="flex size-11 flex-none items-center justify-center rounded-full border-2 border-white font-heading text-[20px] font-extrabold text-ink"
      style={{ background: color }}
    >
      {initial}
    </span>
  );
}

/** Game-style header for the battle card: who's winning, and where you are in the 3 rounds. */
export function VersusBanner({
  kid,
  opponent,
  challenges,
  results,
  activeId,
}: {
  kid: Kid;
  opponent: Opponent;
  challenges: PublicChallenge[];
  results: Record<string, BattleResult>;
  activeId: string;
}) {
  const played = challenges.map((c) => results[c.id]).filter(Boolean);
  const youWon = played.filter((r) => r.outcome === 'win').length;
  const theyWon = played.filter((r) => r.outcome === 'lose').length;
  const finished = played.length === challenges.length;

  let verdict: string | null = null;
  if (finished) {
    verdict =
      youWon > theyWon
        ? `You won the battle! ${opponent.name} wants a rematch.`
        : youWon < theyWon
          ? `${opponent.name} takes it this time. Rewrite a round to steal it back.`
          : 'Dead even. Rewrite a round to break the tie.';
  }

  return (
    <div className="flex flex-col gap-4 bg-ink px-5 pt-4 pb-5 text-white sm:px-6">
      <div
        className="flex items-center justify-between gap-3"
        aria-label={`Rounds won: you ${youWon}, ${opponent.name} ${theyWon}`}
      >
        <div className="flex items-center gap-2.5">
          <Avatar initial={kid.name.charAt(0).toUpperCase()} color="#5B86FF" />
          <span className="font-bold">You</span>
        </div>
        <span className="font-heading text-[44px] leading-none font-extrabold text-sun tabular-nums">
          {youWon}
          <span className="px-2 text-nav-muted">–</span>
          {theyWon}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="font-bold">{opponent.name}</span>
          <Avatar initial={opponent.initial} color="#2FBF71" />
        </div>
      </div>

      <ol className="m-0 grid list-none grid-cols-3 p-0" aria-label="Rounds">
        {challenges.map((c, i) => {
          const r = results[c.id];
          const isActive = c.id === activeId;
          const dot = isActive
            ? 'bg-sun text-ink border-sun'
            : r?.outcome === 'win'
              ? 'bg-mint text-ink border-mint'
              : r?.outcome === 'lose'
                ? 'bg-coral text-ink border-coral'
                : r
                  ? 'bg-nav-muted text-ink border-nav-muted'
                  : 'bg-transparent text-nav-muted border-nav-chip';
          return (
            <li
              key={c.id}
              aria-current={isActive ? 'step' : undefined}
              className={`relative flex flex-col items-center gap-1 text-center ${isActive || r ? '' : 'opacity-60'}`}
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-[15px] h-0.5 bg-nav-chip"
                  style={{ right: 'calc(50% + 22px)', width: 'calc(100% - 44px)' }}
                />
              )}
              <span
                className={`relative flex size-8 items-center justify-center rounded-full border-2 font-heading font-extrabold ${dot}`}
              >
                {!r ? (
                  c.round
                ) : r.outcome === 'lose' ? (
                  <CrossIcon width={15} height={15} strokeWidth={3} />
                ) : (
                  <CheckIcon width={15} height={15} strokeWidth={3} />
                )}
              </span>
              <span
                className={`text-[13px] leading-tight font-bold ${isActive ? 'text-white' : 'text-nav-muted'}`}
              >
                {c.title}
              </span>
              <span className="text-[12px] text-nav-muted tabular-nums">
                {r ? `${r.score} – ${r.opponent.score}` : isActive ? 'Playing' : 'Up next'}
              </span>
            </li>
          );
        })}
      </ol>

      {verdict && <p className="pop-in m-0 text-center font-bold text-sun">{verdict}</p>}
    </div>
  );
}
