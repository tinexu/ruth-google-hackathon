import { useEffect, useState } from 'react';
import type { TeachMedia } from '@shared/types';

const CLIP_SECONDS = 15;

function formatTime(seconds: number): string {
  return `0:${String(Math.floor(seconds)).padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15l12-7.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </svg>
  );
}

/**
 * Illustrated "music video" for the Deepfakes card. It looks normal at a glance,
 * but the jaw edges blur and shimmer and the captions describe a flat, robotic
 * voice: the clues Pip misses until the kid teaches it.
 */
function DeepfakeSingerScene({ playing }: { playing: boolean }) {
  const state = playing ? 'running' : 'paused';
  return (
    <svg viewBox="0 0 480 270" className="block h-auto w-full" aria-hidden="true">
      <defs>
        <filter id="deepfake-jaw-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* stage */}
      <rect width="480" height="270" fill="#1B2140" />
      <polygon points="190,0 290,0 360,270 120,270" fill="#FFC93C" opacity="0.14" />
      <rect y="214" width="480" height="56" fill="#2A3157" />
      <circle cx="60" cy="40" r="3" fill="#FFFFFF" opacity="0.6" />
      <circle cx="420" cy="58" r="2.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="380" cy="24" r="2" fill="#FFFFFF" opacity="0.6" />
      <circle cx="96" cy="96" r="2" fill="#FFFFFF" opacity="0.6" />

      {/* singer */}
      <path d="M170 270 q0 -78 70 -84 q70 6 70 84 z" fill="#FF7A59" />
      <rect x="226" y="150" width="28" height="40" rx="12" fill="#F2C29B" />
      <path
        d="M182 118 q-6 -84 58 -88 q64 4 58 88 q-8 40 -20 54 l-76 0 q-12 -14 -20 -54 z"
        fill="#5A3A2E"
      />
      <ellipse cx="240" cy="112" rx="44" ry="52" fill="#F2C29B" />

      {/* the giveaway: a blurry, shimmering ghost of the jaw line */}
      <path
        d="M198 116 q4 50 42 50 q38 0 42 -50"
        fill="none"
        stroke="#F2C29B"
        strokeWidth="10"
        filter="url(#deepfake-jaw-blur)"
        className="deepfake-glitch"
        style={{ animationPlayState: state }}
      />
      <path
        d="M204 122 q6 40 36 42 q30 -2 36 -42"
        fill="none"
        stroke="#C98F6B"
        strokeWidth="3"
        opacity="0.55"
        filter="url(#deepfake-jaw-blur)"
        className="deepfake-glitch"
        style={{ animationPlayState: state, animationDelay: '-0.35s' }}
      />

      <path d="M196 88 q12 -30 44 -30 q34 0 46 30 q-30 -14 -90 0 z" fill="#5A3A2E" />
      <ellipse cx="224" cy="106" rx="5" ry="6" fill="#1B2140" />
      <ellipse cx="256" cy="106" rx="5" ry="6" fill="#1B2140" />
      <ellipse cx="214" cy="124" rx="8" ry="4" fill="#FF7A59" opacity="0.4" />
      <ellipse cx="266" cy="124" rx="8" ry="4" fill="#FF7A59" opacity="0.4" />

      {/* mouth with slightly too many teeth */}
      <g className="deepfake-mouth" style={{ animationPlayState: state }}>
        <ellipse cx="240" cy="138" rx="13" ry="8" fill="#1B2140" />
        <rect x="229" y="132" width="22" height="5" rx="1.5" fill="#FFFFFF" />
        <path
          d="M232.5 132v5M236 132v5M239.5 132v5M243 132v5M246.5 132v5"
          stroke="#DDE3F5"
          strokeWidth="1"
        />
      </g>

      {/* mic */}
      <rect x="292" y="150" width="6" height="120" fill="#A9B1D6" />
      <rect
        x="278"
        y="128"
        width="20"
        height="30"
        rx="10"
        fill="#5A6385"
        transform="rotate(-20 288 143)"
      />

      {/* captions */}
      <rect x="92" y="226" width="296" height="30" rx="6" fill="#0E1226" opacity="0.85" />
      <text
        x="240"
        y="246"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Atkinson Hyperlegible', system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        [singing in a flat, robotic voice]
      </text>
    </svg>
  );
}

function VideoPlayer({ media }: { media: TeachMedia }) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime((t) => (t + 0.25) % CLIP_SECONDS), 250);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <figure
      className="overflow-hidden rounded-[20px] border-[2.5px] border-ink bg-ink"
      aria-label={media.alt}
    >
      <DeepfakeSingerScene playing={playing} />
      <figcaption className="flex items-center gap-3 bg-nav px-3 py-2.5 text-white">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className="focus-ring flex size-10 shrink-0 items-center justify-center rounded-full bg-sun text-ink"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div
          role="progressbar"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={CLIP_SECONDS}
          aria-valuenow={Math.floor(time)}
          className="h-2 flex-1 overflow-hidden rounded-full bg-nav-chip"
        >
          <div className="h-full bg-coral" style={{ width: `${(time / CLIP_SECONDS) * 100}%` }} />
        </div>
        <span className="font-heading text-sm font-bold tabular-nums text-nav-muted">
          {formatTime(time)} / {formatTime(CLIP_SECONDS)}
        </span>
      </figcaption>
    </figure>
  );
}

/** Shows the picture or video a Teach card's question is about. */
export function TeachMediaView({ media }: { media: TeachMedia }) {
  if (media.kind === 'video') return <VideoPlayer media={media} />;
  return (
    <figure
      className="overflow-hidden rounded-[20px] border-[2.5px] border-ink bg-ink"
      aria-label={media.alt}
    >
      <DeepfakeSingerScene playing={false} />
    </figure>
  );
}
