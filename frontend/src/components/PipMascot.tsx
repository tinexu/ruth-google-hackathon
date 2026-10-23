export type PipMood = 'happy' | 'worried';

interface PipMascotProps {
  mood?: PipMood;
  size?: number;
  waving?: boolean;
  className?: string;
}

/**
 * The Pip robot pet mascot. Pure inline SVG so it stays crisp at any
 * size and can be recolored/animated purely through CSS/props.
 */
export function PipMascot({
  mood = 'happy',
  size = 220,
  waving = true,
  className = '',
}: PipMascotProps) {
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
      <ellipse cx="120" cy="240" rx="62" ry="10" className="fill-ink/15" />

      {/* sparkles */}
      <path
        d="M34 76 L38 66 L42 76 L52 80 L42 84 L38 94 L34 84 L24 80 Z"
        className="fill-sun stroke-ink"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M196 56 L198 50 L200 56 L206 58 L200 60 L198 66 L196 60 L190 58 Z"
        className="fill-sun stroke-ink"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* resting left arm */}
      <rect
        x="48"
        y="150"
        width="26"
        height="62"
        rx="13"
        className="fill-pip-blue stroke-ink"
        strokeWidth="3"
        transform="rotate(8 61 150)"
      />

      {/* waving / resting right arm */}
      {waving ? (
        <rect
          x="162"
          y="108"
          width="24"
          height="58"
          rx="12"
          className="fill-pip-blue stroke-ink"
          strokeWidth="3"
          transform="rotate(-150 174 160)"
        />
      ) : (
        <rect
          x="166"
          y="150"
          width="26"
          height="62"
          rx="13"
          className="fill-pip-blue stroke-ink"
          strokeWidth="3"
          transform="rotate(-8 179 150)"
        />
      )}

      {/* body */}
      <rect
        x="68"
        y="150"
        width="104"
        height="82"
        rx="28"
        className="fill-pip-blue stroke-ink"
        strokeWidth="3"
      />
      {/* belly heart badge */}
      <path
        d="M120 196 c-10-12-26-4-26 8 c0 12 16 20 26 28 c10-8 26-16 26-28 c0-12-16-20-26-8 Z"
        className="fill-pip-blue-light stroke-ink"
        strokeWidth="2.5"
      />

      {/* feet */}
      <ellipse cx="95" cy="234" rx="16" ry="9" className="fill-ink" />
      <ellipse cx="145" cy="234" rx="16" ry="9" className="fill-ink" />

      {/* antenna stem + heart */}
      <line x1="120" y1="18" x2="120" y2="2" className="stroke-ink" strokeWidth="3" />
      <path
        d="M120 2 c-5-7-15-3-15 4 c0 7 9 11 15 16 c6-5 15-9 15-16 c0-7-10-11-15-4 Z"
        className="fill-coral stroke-ink"
        strokeWidth="2.5"
      />

      {/* head */}
      <rect
        x="40"
        y="18"
        width="160"
        height="130"
        rx="40"
        className="fill-pip-blue stroke-ink"
        strokeWidth="3.5"
      />
      {/* ear blocks */}
      <rect
        x="18"
        y="64"
        width="28"
        height="52"
        rx="14"
        className="fill-pip-blue stroke-ink"
        strokeWidth="3"
      />
      <rect
        x="194"
        y="64"
        width="28"
        height="52"
        rx="14"
        className="fill-pip-blue stroke-ink"
        strokeWidth="3"
      />

      {/* face plate */}
      <rect
        x="62"
        y="48"
        width="116"
        height="88"
        rx="32"
        className="fill-white stroke-ink"
        strokeWidth="3"
      />

      {mood === 'happy' ? (
        <>
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
        </>
      ) : (
        <>
          <path d="M92 80 l16 5" className="stroke-ink" strokeWidth="3" strokeLinecap="round" />
          <path d="M148 80 l-16 5" className="stroke-ink" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="94" r="7" className="fill-ink" />
          <circle cx="140" cy="94" r="7" className="fill-ink" />
          <ellipse cx="88" cy="112" rx="9" ry="5" className="fill-coral/60" />
          <ellipse cx="152" cy="112" rx="9" ry="5" className="fill-coral/60" />
          <ellipse cx="120" cy="120" rx="7" ry="6" className="fill-none stroke-ink" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}
