export type PipMood = 'happy' | 'excited' | 'worried';

interface PipMascotProps {
  mood?: PipMood;
  size?: number;
  waving?: boolean;
  className?: string;
}

// A heart centred on (0, 0), about 30 wide.
export const HEART = 'M0 -4 c-5 -7 -15 -3 -15 4 c0 7 9 11 15 16 c6 -5 15 -9 15 -16 c0 -7 -10 -11 -15 -4 Z';
// Limbs and ear pods are a shade deeper than the head, like the reference art.
const DEEP_BLUE = '#4C74F2';

export const line = { strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function Eye({ cx, cy, r = 10.5 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className="fill-ink" />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.4} r={r * 0.38} className="fill-white" />
    </g>
  );
}

export function Sparkle({ x, y, r, className }: { x: number; y: number; r: number; className: string }) {
  const k = r * 0.28;
  return (
    <path
      d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`}
      className={`${className} stroke-ink`}
      strokeWidth="2.5"
      {...line}
    />
  );
}

/**
 * The Pip robot pet mascot: a big round screen-face head, heart antenna, ear
 * pods, a little body with a heart, and chunky arms (one waving). Pure inline
 * SVG so it stays crisp at any size.
 */
export function PipMascot({ mood = 'happy', size = 220, waving = true, className = '' }: PipMascotProps) {
  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={(size * 260) / 240}
      className={className}
      role="img"
      aria-label={`Pip the robot, feeling ${mood}`}
    >
      {/* floor shadow */}
      <ellipse cx="121" cy="236" rx="82" ry="9" className="fill-ink/15" />

      <Sparkle x={36} y={52} r={14} className="fill-sun" />
      <Sparkle x={218} y={44} r={10} className="fill-white" />

      {/* arms (behind the body) */}
      <rect x="40" y="140" width="26" height="54" rx="13" fill={DEEP_BLUE} className="stroke-ink" strokeWidth="4" transform="rotate(20 53 167)" />
      {waving ? (
        <rect x="180" y="118" width="26" height="54" rx="13" fill={DEEP_BLUE} className="stroke-ink" strokeWidth="4" transform="rotate(40 193 145)" />
      ) : (
        <rect x="176" y="140" width="26" height="54" rx="13" fill={DEEP_BLUE} className="stroke-ink" strokeWidth="4" transform="rotate(-20 189 167)" />
      )}

      {/* feet */}
      <rect x="71" y="206" width="41" height="20" rx="10" className="fill-ink" />
      <rect x="131" y="206" width="41" height="20" rx="10" className="fill-ink" />

      {/* body with a yellow heart */}
      <rect x="69" y="146" width="106" height="68" rx="26" className="fill-pip-blue stroke-ink" strokeWidth="4.5" />
      <path d={HEART} transform="translate(121 192) scale(0.78)" className="fill-sun stroke-ink" strokeWidth="3.5" {...line} />

      {/* ear pods */}
      <rect x="29" y="76" width="18" height="42" rx="9" fill={DEEP_BLUE} className="stroke-ink" strokeWidth="4" />
      <rect x="195" y="76" width="18" height="42" rx="9" fill={DEEP_BLUE} className="stroke-ink" strokeWidth="4" />

      {/* head and screen face */}
      <rect x="42" y="36" width="158" height="120" rx="56" className="fill-pip-blue stroke-ink" strokeWidth="4.5" />
      <rect x="63" y="58" width="116" height="79" rx="28" className="fill-white stroke-ink" strokeWidth="4" />

      {/* heart antenna, sitting right on top of the head */}
      <path d={HEART} transform="translate(121 22)" className="fill-coral stroke-ink" strokeWidth="3.5" {...line} />

      {mood === 'happy' && (
        <>
          <Eye cx={95} cy={93} />
          <Eye cx={147} cy={93} />
          <ellipse cx="79" cy="113" rx="9.5" ry="5.5" className="fill-coral/50" />
          <ellipse cx="163" cy="113" rx="9.5" ry="5.5" className="fill-coral/50" />
          <path d="M105 112 q16 12 32 0" fill="none" className="stroke-ink" strokeWidth="4" {...line} />
        </>
      )}
      {mood === 'excited' && (
        <>
          <Eye cx={95} cy={91} r={12} />
          <Eye cx={147} cy={91} r={12} />
          <ellipse cx="78" cy="113" rx="10" ry="6" className="fill-coral/55" />
          <ellipse cx="164" cy="113" rx="10" ry="6" className="fill-coral/55" />
          <path d="M106 109 q15 20 30 0 Z" className="fill-ink stroke-ink" strokeWidth="3" {...line} />
          <ellipse cx="121" cy="118.5" rx="6" ry="3" className="fill-coral" />
        </>
      )}
      {mood === 'worried' && (
        <>
          <path d="M84 80 l15 -6 M158 80 l-15 -6" fill="none" className="stroke-ink" strokeWidth="3.5" {...line} />
          <Eye cx={95} cy={95} r={9.5} />
          <Eye cx={147} cy={95} r={9.5} />
          <ellipse cx="79" cy="115" rx="9" ry="5" className="fill-coral/40" />
          <ellipse cx="163" cy="115" rx="9" ry="5" className="fill-coral/40" />
          <path d="M107 119 q3.5 -5 7 0 q3.5 5 7 0 q3.5 -5 7 0 q3.5 5 7 0" fill="none" className="stroke-ink" strokeWidth="3" {...line} />
          {/* sweat drop */}
          <path d="M184 52 q8 12 0 16 q-8 -4 0 -16 Z" className="fill-pip-blue-light stroke-ink" strokeWidth="2.5" {...line} />
        </>
      )}
    </svg>
  );
}
