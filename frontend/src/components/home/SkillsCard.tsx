import type { Skill } from '@shared/types';
import { BulbIcon, EyeIcon, LockIcon, PencilIcon, ScaleIcon, SearchIcon, ShieldIcon } from '../icons';

const ICONS = { search: SearchIcon, bulb: BulbIcon, pencil: PencilIcon, shield: ShieldIcon, scale: ScaleIcon, eye: EyeIcon };
const TILE: Record<Skill['icon'], string> = {
  search: 'bg-room-sun',
  bulb: 'bg-room-blue text-white',
  pencil: 'bg-room-orange',
  shield: 'bg-room-green text-white',
  scale: 'bg-room-orange',
  eye: 'bg-room-sun',
};

function statusText(skill: Skill): string {
  switch (skill.status) {
    case 'mastered':
      return 'Mastered';
    case 'in-progress':
      return `Level ${skill.level} of ${skill.maxLevel}`;
    case 'training':
      return 'Ready to start';
    case 'locked':
      return skill.note?.replace(/\.$/, '') ?? 'Locked';
  }
}

/**
 * Skills as one compact list: what each is, how far along it is (dots), and
 * for a skill that's ready to start, the one thing to do to level it up.
 */
export function SkillsCard({ skills, totalSkills }: { skills: Skill[]; totalSkills: number }) {
  const unlocked = skills.filter((s) => s.status === 'mastered' || s.status === 'in-progress').length;
  return (
    <section aria-labelledby="skills" className="flex flex-col gap-3 rounded-[22px] border-4 border-room-ink bg-white p-5 shadow-[0_4px_0_var(--color-room-ink)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="skills" className="font-heading text-2xl font-extrabold leading-tight">
          Pip’s skills
        </h2>
        <span className="text-sm font-bold text-muted">
          {unlocked} of {totalSkills} learned
        </span>
      </div>

      <ul className="flex flex-col divide-y-[3px] divide-dashed divide-room-ink/15">
        {skills.map((skill) => {
          const locked = skill.status === 'locked';
          const Icon = locked ? LockIcon : ICONS[skill.icon];
          return (
            <li key={skill.id} className={`flex items-center gap-3 py-3 ${locked ? 'opacity-60' : ''}`}>
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-[3px] ${
                  locked ? 'border-room-ink/30 bg-room-track' : `border-room-ink ${TILE[skill.icon]}`
                }`}
              >
                <Icon size={20} strokeWidth={2.6} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-heading text-base font-bold">{skill.name}</span>
                <span className="text-sm text-muted">
                  {skill.status === 'training' && skill.note
                    ? skill.note.replace(/^Unlocked! /, '')
                    : skill.description}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-xs font-bold text-muted">{statusText(skill)}</span>
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: skill.maxLevel }, (_, i) => (
                    <span
                      key={i}
                      className={`size-3 rounded-full border-2 border-room-ink ${
                        i < skill.level ? (skill.status === 'mastered' ? 'bg-room-green' : 'bg-room-blue') : 'bg-white'
                      }`}
                    />
                  ))}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
