import type { Skill } from '@shared/types';
import { Card } from './Card';
import { Pill, type PillTone } from './Pill';
import {
  SearchIcon,
  BulbIcon,
  PencilIcon,
  ShieldIcon,
  ScaleIcon,
  LockIcon,
} from './icons';

const iconByKey = {
  search: SearchIcon,
  bulb: BulbIcon,
  pencil: PencilIcon,
  shield: ShieldIcon,
  scale: ScaleIcon,
  eye: ScaleIcon, // unused once locked — locked skills show a lock instead
};

const tileToneByIcon: Record<Skill['icon'], string> = {
  search: 'bg-sun',
  bulb: 'bg-pip-blue',
  pencil: 'bg-coral',
  shield: 'bg-mint',
  scale: 'bg-coral',
  eye: 'bg-border',
};

const statusMeta: Record<
  Skill['status'],
  { label: (s: Skill) => string; pillTone: PillTone; barColor: string }
> = {
  mastered: { label: () => 'Mastered', pillTone: 'mint', barColor: 'bg-mint' },
  'in-progress': {
    label: (s) => `Level ${s.level} of ${s.maxLevel}`,
    pillTone: 'blueTint',
    barColor: 'bg-pip-blue',
  },
  training: { label: () => 'In training', pillTone: 'coral', barColor: 'bg-coral' },
  locked: { label: () => 'Locked', pillTone: 'white', barColor: 'bg-border' },
};

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const meta = statusMeta[skill.status];
  const isLocked = skill.status === 'locked';
  const isTraining = skill.status === 'training';
  const Icon = isLocked ? LockIcon : iconByKey[skill.icon];

  const cardBg = isTraining ? 'bg-coral-light' : isLocked ? 'bg-white/60' : 'bg-white';
  const border = isTraining || isLocked ? 'dashed' : 'solid';
  const tileTone = isLocked ? 'bg-white border-2 border-ink/30' : tileToneByIcon[skill.icon];

  return (
    <Card
      border={border}
      rounded="rounded-[24px]"
      className={`flex flex-col gap-3 p-5 ${cardBg} ${isLocked ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-ink ${tileTone}`}>
          <Icon width={20} height={20} className="stroke-ink" />
        </div>
        <Pill tone={meta.pillTone}>{meta.label(skill)}</Pill>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-ink">{skill.name}</h3>
        <p className={`mt-1 text-sm ${isTraining ? 'text-coral font-semibold' : 'text-muted'}`}>
          {skill.description}
        </p>
      </div>

      <div className="mt-auto flex gap-1.5 pt-1">
        {Array.from({ length: skill.maxLevel }).map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < skill.level ? meta.barColor : 'bg-border'}`}
          />
        ))}
      </div>
    </Card>
  );
}
