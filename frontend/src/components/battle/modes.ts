import type { ComponentType, SVGProps } from 'react';
import type { BattleMode } from '@shared/types';
import { ImageIcon, StepsIcon, TabooIcon } from '../icons';

export const MODE_STYLE: Record<
  BattleMode,
  { icon: ComponentType<SVGProps<SVGSVGElement>>; tile: string }
> = {
  'picture-twin': { icon: ImageIcon, tile: 'bg-sun' },
  'literal-robot': { icon: StepsIcon, tile: 'bg-pip-blue' },
  'secret-word-taboo': { icon: TabooIcon, tile: 'bg-coral' },
};
