import type { PetTier, StatColor } from '@shared/types';
import { Eye, HEART, Sparkle, line } from '../PipMascot';

interface TieredPetMascotProps {
  tier: PetTier;
  color: StatColor;
  size?: number;
  className?: string;
}

const fillClass: Record<StatColor, string> = {
  sun: 'fill-sun',
  'pip-blue': 'fill-pip-blue',
  coral: 'fill-coral',
  mint: 'fill-mint',
};

// Limbs and ear pods are a shade deeper than the head, like PipMascot.
const deepFill: Record<StatColor, string> = {
  sun: '#F0B21C',
  'pip-blue': '#4C74F2',
  coral: '#F0603F',
  mint: '#22A35E',
};

// A five-point star centred on (0, 0), about 46 wide.
const STAR = 'M0 -21 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 Z';

/**
 * A pet avatar drawn like PipMascot, whose accessories change with its growth
 * tier, matching the "How pets grow" reference in the Community design:
 *   sprout   -> just a little bot (head + body, no limbs)
 *   explorer -> arms, feet, heart antenna (what PipMascot normally looks like)
 *   champ    -> bigger arms, headband, star badge
 *   legend   -> crown, cape, medal, sparkles
 */
export function TieredPetMascot({ tier, color, size = 120, className = '' }: TieredPetMascotProps) {
  const fill = fillClass[color];
  const deep = deepFill[color];
  const hasLimbs = tier !== 'sprout';
  const armWidth = tier === 'champ' || tier === 'legend' ? 32 : 26;
  const armShift = (armWidth - 26) / 2;
  const eyeY = tier === 'champ' ? 95 : 93;

  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={(size * 260) / 240}
      className={className}
      role="img"
      aria-label={`A ${tier}-stage pet`}
    >
      {/* floor shadow */}
      <ellipse cx="121" cy="236" rx="82" ry="9" className="fill-ink/15" />

      {tier === 'legend' && (
        <>
          <Sparkle x={30} y={60} r={13} className="fill-sun" />
          <Sparkle x={216} y={56} r={10} className="fill-white" />
          {/* cape, behind the body */}
          <path d="M84 150 L58 228 L121 212 L184 228 L158 150 Z" className="fill-coral stroke-ink" strokeWidth="4" {...line} />
        </>
      )}

      {hasLimbs && (
        <>
          {/* resting arms (behind the body) */}
          <rect x={40 - armShift} y="140" width={armWidth} height="54" rx={armWidth / 2} fill={deep} className="stroke-ink" strokeWidth="4" transform="rotate(20 53 167)" />
          <rect x={176 - armShift} y="140" width={armWidth} height="54" rx={armWidth / 2} fill={deep} className="stroke-ink" strokeWidth="4" transform="rotate(-20 189 167)" />
          {/* feet */}
          <rect x="71" y="206" width="41" height="20" rx="10" className="fill-ink" />
          <rect x="131" y="206" width="41" height="20" rx="10" className="fill-ink" />
        </>
      )}

      {/* body (a sprout sits right on the floor) */}
      <rect x="69" y="146" width="106" height={hasLimbs ? 68 : 82} rx="26" className={`${fill} stroke-ink`} strokeWidth="4.5" />

      {/* chest badge */}
      {tier === 'explorer' && (
        <path d={HEART} transform="translate(121 192) scale(0.78)" className={`${color === 'sun' ? 'fill-coral' : 'fill-sun'} stroke-ink`} strokeWidth="3.5" {...line} />
      )}
      {tier === 'champ' && (
        <path d={STAR} transform="translate(121 184) scale(0.8)" className="fill-white stroke-ink" strokeWidth="3.5" {...line} />
      )}
      {tier === 'legend' && (
        <>
          <path d="M110 147 L121 170 L132 147" fill="none" className="stroke-ink" strokeWidth="3.5" {...line} />
          <circle cx="121" cy="184" r="16" className="fill-sun stroke-ink" strokeWidth="3.5" />
          <path d={STAR} transform="translate(121 185) scale(0.42)" className="fill-white stroke-ink" strokeWidth="4" {...line} />
        </>
      )}

      {/* ear pods */}
      <rect x="29" y="76" width="18" height="42" rx="9" fill={deep} className="stroke-ink" strokeWidth="4" />
      <rect x="195" y="76" width="18" height="42" rx="9" fill={deep} className="stroke-ink" strokeWidth="4" />

      {/* head and screen face */}
      <rect x="42" y="36" width="158" height="120" rx="56" className={`${fill} stroke-ink`} strokeWidth="4.5" />
      <rect x="63" y="58" width="116" height="79" rx="28" className="fill-white stroke-ink" strokeWidth="4" />

      {/* head accessory */}
      {(tier === 'explorer' || tier === 'champ') && (
        <path d={HEART} transform="translate(121 22)" className="fill-coral stroke-ink" strokeWidth="3.5" {...line} />
      )}
      {tier === 'champ' && (
        <>
          <rect x="52" y="44" width="138" height="18" rx="9" className="fill-coral stroke-ink" strokeWidth="3.5" />
          <path d="M190 52 l18 -10 M190 54 l20 6" fill="none" className="stroke-ink" strokeWidth="5" {...line} />
        </>
      )}
      {tier === 'legend' && (
        <path d="M80 44 L86 8 L106 28 L121 2 L136 28 L156 8 L162 44 Z" className="fill-sun stroke-ink" strokeWidth="4" {...line} />
      )}

      {/* happy face, same as PipMascot */}
      <Eye cx={95} cy={eyeY} />
      <Eye cx={147} cy={eyeY} />
      <ellipse cx="79" cy="113" rx="9.5" ry="5.5" className="fill-coral/50" />
      <ellipse cx="163" cy="113" rx="9.5" ry="5.5" className="fill-coral/50" />
      <path d="M105 112 q16 12 32 0" fill="none" className="stroke-ink" strokeWidth="4" {...line} />
    </svg>
  );
}
