import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GrowthStage, NextUpgrade, PetTier } from '@shared/types';
import { TieredPetMascot } from './TieredPetMascot';
import { Button } from '../Button';

interface EvolutionCardProps {
  stages: GrowthStage[];
  currentTier: PetTier;
  upgrade: NextUpgrade;
}

type NodeState = 'done' | 'current' | 'next' | 'locked';

/**
 * Pip's evolution path, laid out like a game's evolution chain: forms you've
 * passed, the one you're on, the next one as a reward preview, and anything
 * further as a mystery silhouette. Below it, what the next form unlocks and
 * how far away it is.
 */
export function EvolutionCard({ stages, currentTier, upgrade }: EvolutionCardProps) {
  const navigate = useNavigate();
  const current = Math.max(0, stages.findIndex((s) => s.tier === currentTier));
  const next = stages[current + 1];
  const segment = 100 / stages.length;

  const stateOf = (i: number): NodeState =>
    i < current ? 'done' : i === current ? 'current' : i === current + 1 ? 'next' : 'locked';

  return (
    <section className="rounded-[28px] border-[2.5px] border-ink bg-white p-6">
      <p className="text-xs font-bold tracking-wide text-muted">PIP'S EVOLUTION</p>
      <h2 className="mt-1 font-heading text-xl font-extrabold text-ink">Learn more, grow stronger</h2>

      {/* the path */}
      <div className="relative mt-6">
        <div
          aria-hidden="true"
          className="absolute top-[40px] h-2 -translate-y-1/2 rounded-full bg-border"
          style={{ left: `${segment / 2}%`, right: `${segment / 2}%` }}
        />
        {stages.slice(0, -1).map((stage, i) => {
          const fill = i < current ? 100 : i === current ? upgrade.progressPercent : 0;
          return (
            <div
              key={stage.tier}
              aria-hidden="true"
              className="absolute top-[40px] h-2 -translate-y-1/2 overflow-hidden"
              style={{ left: `${segment / 2 + segment * i}%`, width: `${segment}%` }}
            >
              <div className="h-full rounded-full bg-sun" style={{ width: `${fill}%` }} />
            </div>
          );
        })}

        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
          {stages.map((stage, i) => (
            <EvolutionNode key={stage.tier} stage={stage} state={stateOf(i)} />
          ))}
        </ol>
      </div>

      {/* next unlock */}
      {next && (
        <div className="mt-6 rounded-[20px] border-[2.5px] border-ink bg-nav p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wide text-sun">NEXT FORM · LV {upgrade.level}</p>
              <h3 className="font-heading text-2xl font-extrabold leading-tight">{next.name}</h3>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 font-heading text-sm font-bold tabular-nums">
              {upgrade.xpToGo} XP to go
            </span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Unlocks">
            {next.description.split(/,\s*/).map((reward) => (
              <li
                key={reward}
                className="rounded-full border-2 border-sun/60 px-3 py-1 text-sm font-bold capitalize text-sun"
              >
                + {reward}
              </li>
            ))}
          </ul>

          <div
            role="progressbar"
            aria-label={`Progress to ${next.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={upgrade.progressPercent}
            className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/15"
          >
            <div className="h-full rounded-full bg-sun" style={{ width: `${upgrade.progressPercent}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-white/70">About {upgrade.feedCardsEstimate} feed cards to go</p>

          <Button variant="sun" className="mt-4 w-full justify-center" onClick={() => navigate('/feed')}>
            Earn XP in the Feed
          </Button>
        </div>
      )}
    </section>
  );
}

function EvolutionNode({ stage, state }: { stage: GrowthStage; state: NodeState }) {
  const ring = {
    done: 'size-[60px] border-2 border-ink bg-pip-blue-light',
    current: 'size-[80px] border-[3px] border-ink bg-sun shadow-[0_4px_0_var(--color-ink)]',
    next: 'size-[60px] border-2 border-dashed border-ink/50 bg-white',
    locked: 'size-[60px] border-2 border-dashed border-ink/25 bg-ground',
  }[state];

  return (
    <li className="relative flex flex-col items-center text-center">
      <div className="flex h-[80px] items-center">
        <div className={`relative flex items-center justify-center rounded-full ${ring}`}>
          <TieredPetMascot
            tier={stage.tier}
            color="pip-blue"
            size={state === 'current' ? 60 : 44}
            className={state === 'locked' ? 'opacity-25 [filter:brightness(0)]' : state === 'next' ? 'opacity-70' : ''}
          />
          {state === 'done' && (
            <Badge className="bg-mint">
              <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </Badge>
          )}
          {(state === 'next' || state === 'locked') && (
            <Badge className="bg-ink">
              <rect x="4.5" y="7.5" width="7" height="5.5" rx="1.2" fill="white" />
              <path d="M6 7.5V6a2 2 0 0 1 4 0v1.5" fill="none" stroke="white" strokeWidth="1.6" />
            </Badge>
          )}
        </div>
      </div>
      <p className={`mt-2 font-heading text-sm font-extrabold ${state === 'locked' ? 'text-muted' : 'text-ink'}`}>
        {state === 'locked' ? '???' : stage.name}
      </p>
      <p className="text-[11px] font-semibold text-muted">{state === 'current' ? 'You are here' : stage.levelRange}</p>
    </li>
  );
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-white ${className}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}
