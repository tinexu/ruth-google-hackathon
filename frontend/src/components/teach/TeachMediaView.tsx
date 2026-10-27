import { useEffect, useState } from 'react';
import type { TeachMedia } from '@shared/types';

const CLIP_SECONDS = 15;
const TICK = 0.1;

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

// What Maya "says", in seconds. The captions follow this; her mouth doesn't.
const LINES: { from: number; to: number; text: string }[] = [
  { from: 0, to: 4, text: 'Hi everyone, it’s Maya!' },
  { from: 4, to: 8, text: 'I’m quitting soccer forever.' },
  { from: 8, to: 12, text: 'Soccer is SO boring. Bye!' },
];
const LIP_LAG = 1.1;

const NECK_SKIN = '#BF845F';
const FACE_SKIN = '#F6D3B4';
const INK = '#1B2140';

const speaking = (t: number) => LINES.some((l) => t >= l.from + 0.2 && t <= l.to - 0.3);

/**
 * Illustrated clip for the Deepfakes card: a soccer star "announcing" she quits.
 * It looks like a normal video at a glance, but every clue is something a kid
 * can see for themselves, even on a paused frame:
 * - the face is a different skin tone from her neck and ears, with a smudged
 *   edge, and it slides a beat behind her head when she tilts (a face swap)
 * - her lips move a second late, and keep going after the words stop
 * - the waving hand has six fingers
 * - the account name is misspelled ("offical")
 */
function DeepfakeAthleteScene({ time }: { time: number }) {
  const caption = LINES.find((l) => time >= l.from && time < l.to)?.text ?? '';
  const mouthOpen = speaking(time - LIP_LAG) && Math.sin(time * 16) > -0.2;

  // The head tilts; the swapped face follows late and a little off-center.
  const tilt = Math.sin(time * 1.3) * 7;
  const faceTilt = Math.sin((time - 0.55) * 1.3) * 7;
  const faceShift = 2 + Math.sin((time - 0.55) * 1.3) * 3;
  const wave = Math.sin(time * 7) * 12;

  return (
    <svg viewBox="0 0 480 270" className="block h-auto w-full" aria-hidden="true">
      <defs>
        <filter id="deepfake-seam" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <clipPath id="deepfake-frame">
          <rect width="480" height="270" />
        </clipPath>
      </defs>

      <g clipPath="url(#deepfake-frame)">
        {/* stadium at dusk */}
        <rect width="480" height="270" fill="#6E9BEF" />
        <rect y="120" width="480" height="70" fill="#2A3157" />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={20 + i * 34} cy={150 + (i % 2) * 14} r="5" fill="#3D4774" />
        ))}
        <rect y="186" width="480" height="84" fill="#2FBF71" />
        <path d="M0 230 H480" stroke="#7BE0A8" strokeWidth="3" opacity="0.7" />
        <g fill="#FFF6C9">
          <rect x="34" y="34" width="34" height="18" rx="3" />
          <rect x="412" y="34" width="34" height="18" rx="3" />
        </g>
        <path d="M51 52 V120 M429 52 V120" stroke="#A9B1D6" strokeWidth="4" />

        {/* jersey */}
        <path d="M150 270 q4 -70 90 -78 q86 8 90 78 z" fill="#FF5A4E" stroke={INK} strokeWidth="3" />
        <path d="M214 194 l26 22 l26 -22" fill="none" stroke="#FFFFFF" strokeWidth="5" />
        <text x="240" y="256" textAnchor="middle" fill="#FFFFFF" fontFamily="'Baloo 2', system-ui, sans-serif" fontSize="30" fontWeight="800">
          10
        </text>

        {/* waving arm with a six-fingered hand, fingers spread so they're easy to count */}
        <path d="M312 226 q24 -30 34 -74" fill="none" stroke={INK} strokeWidth="25" strokeLinecap="round" />
        <path d="M312 226 q24 -30 34 -74" fill="none" stroke="#FF5A4E" strokeWidth="19" strokeLinecap="round" />
        <g transform={`rotate(${wave} 348 150)`}>
          <rect x="340" y="134" width="16" height="24" rx="6" fill={NECK_SKIN} stroke={INK} strokeWidth="2.5" />
          {[-75, -45, -15, 15, 45, 75].map((a, i) => (
            <rect
              key={i}
              x="343.5"
              y="88"
              width="9"
              height="38"
              rx="4.5"
              fill={NECK_SKIN}
              stroke={INK}
              strokeWidth="2.5"
              transform={`rotate(${a} 348 124)`}
            />
          ))}
          <circle cx="348" cy="126" r="16" fill={NECK_SKIN} stroke={INK} strokeWidth="2.5" />
        </g>

        {/* neck */}
        <rect x="226" y="150" width="28" height="46" rx="10" fill={NECK_SKIN} stroke={INK} strokeWidth="2.5" />

        <g transform={`rotate(${tilt} 240 168)`}>
          {/* ponytail and ears, in her real skin tone */}
          <path d="M282 80 q34 10 30 64 q-10 -18 -26 -26 z" fill="#3A2418" stroke={INK} strokeWidth="2.5" />
          <ellipse cx="193" cy="116" rx="9" ry="13" fill={NECK_SKIN} stroke={INK} strokeWidth="2.5" />
          <ellipse cx="287" cy="116" rx="9" ry="13" fill={NECK_SKIN} stroke={INK} strokeWidth="2.5" />
          <ellipse cx="240" cy="112" rx="46" ry="54" fill={NECK_SKIN} stroke={INK} strokeWidth="2.5" />
          <path d="M194 98 q-2 -52 46 -54 q48 2 46 54 q-14 -26 -46 -26 q-32 0 -46 26 z" fill="#3A2418" stroke={INK} strokeWidth="2.5" />
        </g>

        {/* the swapped-in face: lighter skin, smudged edge, a beat behind the head */}
        <g transform={`translate(${faceShift} 0) rotate(${faceTilt} 240 168)`}>
          <ellipse cx="240" cy="122" rx="38" ry="40" fill={FACE_SKIN} stroke={FACE_SKIN} strokeWidth="7" filter="url(#deepfake-seam)" />
          <ellipse cx="240" cy="122" rx="36" ry="38" fill={FACE_SKIN} />
          <path d="M218 102 q8 -6 16 0 M246 102 q8 -6 16 0" fill="none" stroke="#3A2418" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="226" cy="114" rx="5" ry="6.5" fill={INK} />
          <ellipse cx="254" cy="114" rx="5" ry="6.5" fill={INK} />
          <circle cx="227.5" cy="112" r="1.6" fill="#FFFFFF" />
          <circle cx="255.5" cy="112" r="1.6" fill="#FFFFFF" />
          <ellipse cx="214" cy="130" rx="7" ry="4" fill="#FF7A59" opacity="0.35" />
          <ellipse cx="266" cy="130" rx="7" ry="4" fill="#FF7A59" opacity="0.35" />
          {mouthOpen ? (
            <ellipse cx="240" cy="142" rx="9" ry="7" fill={INK} />
          ) : (
            <path d="M231 142 q9 4 18 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* the account that posted it */}
        <g>
          <rect x="12" y="12" width="168" height="26" rx="13" fill="#0E1226" opacity="0.8" />
          <circle cx="26" cy="25" r="7" fill="#FF5A4E" />
          <text x="40" y="30" fill="#FFFFFF" fontFamily="'Atkinson Hyperlegible', system-ui, sans-serif" fontSize="13" fontWeight="700">
            @maya.stone.offical
          </text>
        </g>

        {/* captions: what she says (her lips don't keep up) */}
        {caption && (
          <>
            <rect x="96" y="222" width="288" height="32" rx="8" fill="#0E1226" opacity="0.85" />
            <text
              x="240"
              y="243"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="'Atkinson Hyperlegible', system-ui, sans-serif"
              fontSize="15"
              fontWeight="700"
            >
              {caption}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

function VideoPlayer({ media }: { media: TeachMedia }) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime((t) => (t + TICK) % CLIP_SECONDS), TICK * 1000);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <figure
      className="overflow-hidden rounded-[20px] border-[2.5px] border-ink bg-ink"
      aria-label={media.alt}
    >
      <DeepfakeAthleteScene time={time} />
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
      <DeepfakeAthleteScene time={0} />
    </figure>
  );
}
