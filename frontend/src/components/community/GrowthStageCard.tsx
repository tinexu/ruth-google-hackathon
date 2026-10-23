import type { GrowthStage } from '@shared/types';
import { TieredPetMascot } from './TieredPetMascot';
import { Pill } from '../Pill';

interface GrowthStageCardProps {
  stage: GrowthStage;
  isCurrent: boolean;
}

export function GrowthStageCard({ stage, isCurrent }: GrowthStageCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center ${
        isCurrent ? 'border-sun bg-sun/15' : 'border-border bg-white'
      }`}
    >
      {isCurrent && (
        <Pill tone="navChip" className="absolute -top-3 right-3 px-2.5 py-0.5 text-[10px] uppercase tracking-wide">
          You are here
        </Pill>
      )}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pip-blue-light">
        <TieredPetMascot tier={stage.tier} color="pip-blue" size={44} />
      </div>
      <p className="font-heading text-base font-extrabold text-ink">{stage.name}</p>
      <p className="text-xs text-muted">
        {stage.levelRange} · {stage.description}
      </p>
    </div>
  );
}
