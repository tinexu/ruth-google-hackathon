import type { PetTier, StatColor } from '@shared/types';

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

/**
 * A pet avatar whose accessories change with its growth tier, matching the
 * "How pets grow" reference in the Community leaderboard design:
 *   sprout   -> just a little bot (head + base, no limbs)
 *   explorer -> arms, legs, antenna (what PipMascot normally looks like)
 *   champ    -> muscles, headband, star badge
 *   legend   -> crown, cape, medal
 */
export function TieredPetMascot({ tier, color, size = 120, className = '' }: TieredPetMascotProps) {
  const fill = fillClass[color];
  const hasLimbs = tier !== 'sprout';
  const isBulky = tier === 'champ' || tier === 'legend';
  const armWidth = isBulky ? 32 : 26;

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
      <ellipse cx="120" cy="240" rx="56" ry="9" className="fill-ink/15" />

      {/* cape (legend only, drawn behind the body) */}
      {tier === 'legend' && (
        <path
          d="M80 142 L60 232 L120 210 L180 232 L160 142 Z"
          className="fill-coral stroke-ink"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      {hasLimbs && (
        <>
          {/* resting left arm */}
          <rect
            x={48}
            y="150"
            width={armWidth}
            height="62"
            rx={armWidth / 2}
            className={`${fill} stroke-ink`}
            strokeWidth="3"
            transform="rotate(8 61 150)"
          />
          {/* resting right arm */}
          <rect
            x={166}
            y="150"
            width={armWidth}
            height="62"
            rx={armWidth / 2}
            className={`${fill} stroke-ink`}
            strokeWidth="3"
            transform="rotate(-8 179 150)"
          />
        </>
      )}

      {/* body */}
      <rect
        x="68"
        y="150"
        width="104"
        height="82"
        rx="28"
        className={`${fill} stroke-ink`}
        strokeWidth="3"
      />

      {/* chest badge */}
      {tier === 'explorer' && (
        <path
          d="M120 196 c-10-12-26-4-26 8 c0 12 16 20 26 28 c10-8 26-16 26-28 c0-12-16-20-26-8 Z"
          className="fill-white stroke-ink"
          strokeWidth="2.5"
        />
      )}
      {tier === 'champ' && (
        <path
          d="M120 190 l7 15 16 2 -12 11 3 16 -14-8 -14 8 3-16 -12-11 16-2Z"
          className="fill-white stroke-ink"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {tier === 'legend' && (
        <>
          <line x1="110" y1="150" x2="120" y2="175" className="stroke-ink" strokeWidth="2.5" />
          <line x1="130" y1="150" x2="120" y2="175" className="stroke-ink" strokeWidth="2.5" />
          <circle cx="120" cy="188" r="15" className="fill-sun stroke-ink" strokeWidth="2.5" />
          <path
            d="M120 181 l3.5 7 7.5 1 -5.5 5.5 1.5 7.5 -7-4 -7 4 1.5-7.5 -5.5-5.5 7.5-1Z"
            className="fill-white stroke-ink"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      )}

      {hasLimbs && (
        <>
          <ellipse cx="95" cy="234" rx="16" ry="9" className="fill-ink" />
          <ellipse cx="145" cy="234" rx="16" ry="9" className="fill-ink" />
        </>
      )}

      {/* head accessory */}
      {tier === 'explorer' && (
        <>
          <line x1="120" y1="18" x2="120" y2="2" className="stroke-ink" strokeWidth="3" />
          <path
            d="M120 2 c-5-7-15-3-15 4 c0 7 9 11 15 16 c6-5 15-9 15-16 c0-7-10-11-15-4 Z"
            className="fill-coral stroke-ink"
            strokeWidth="2.5"
          />
        </>
      )}
      {tier === 'legend' && (
        <path
          d="M78 18 L92 -8 L112 10 L120 -14 L128 10 L148 -8 L162 18 Z"
          className="fill-sun stroke-ink"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      {/* head */}
      <rect
        x="40"
        y="18"
        width="160"
        height="130"
        rx="40"
        className={`${fill} stroke-ink`}
        strokeWidth="3.5"
      />
      {/* ear blocks */}
      <rect x="18" y="64" width="28" height="52" rx="14" className={`${fill} stroke-ink`} strokeWidth="3" />
      <rect x="194" y="64" width="28" height="52" rx="14" className={`${fill} stroke-ink`} strokeWidth="3" />

      {/* face plate */}
      <rect x="62" y="48" width="116" height="88" rx="32" className="fill-white stroke-ink" strokeWidth="3" />

      {tier === 'champ' && (
        <rect x="68" y="56" width="104" height="22" rx="11" className={`${fill} stroke-ink`} strokeWidth="2.5" />
      )}

      <circle cx="100" cy="90" r="8" className="fill-ink" />
      <circle cx="140" cy="90" r="8" className="fill-ink" />
      <ellipse cx="88" cy="110" rx="10" ry="6" className="fill-coral/60" />
      <ellipse cx="152" cy="110" rx="10" ry="6" className="fill-coral/60" />
      <path
        d="M100 114 q20 16 40 0"
        fill="none"
        className="stroke-ink"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
