import { useState } from 'react';
import roomArt from '../../assets/room.webp';
import { ROOM_HEIGHT, ROOM_SPOTS, ROOM_WIDTH, type RoomAction } from './roomSpots';

const pct = (v: number, total: number) => `${(v / total) * 100}%`;
// Room-frame pixels to container-width units, so text and outlines scale with the picture.
const cq = (px: number) => `${(px / ROOM_WIDTH) * 100}cqw`;

// The art is a little taller than the room frame, so it is scaled to the frame's
// width and trimmed evenly top and bottom (wall above, floor below).
const ART_HEIGHT = 805;
const ART_OFFSET = -22;

// Where the art's own speech bubble sits. Pip's live bubble is drawn over it,
// at least this big, so the painted one never shows through.
const BUBBLE = { x: 678, y: 287, w: 282, h: 88 };

export interface PipBubble {
  /** What Pip says, e.g. "Let's play Feed cards!" */
  line: string;
  /** Where to tap, e.g. "Tap the computer!" Shown alone when the room is small. */
  hint: string;
}

/**
 * Pip's room: one illustration with a tap area over each object. Hovering or
 * focusing an object outlines it and shows what it does. The suggested object
 * glows and keeps its label up, and Pip's speech bubble says why.
 */
export function RoomScene({
  onAction,
  suggested,
  bubble,
}: {
  onAction: (action: RoomAction) => void;
  suggested?: string;
  bubble: PipBubble;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="@container absolute inset-0 bg-[#bc8a63]">
      <img
        src={roomArt}
        alt=""
        draggable={false}
        fetchPriority="high"
        className="pointer-events-none absolute left-0 block w-full select-none [filter:saturate(0.65)]"
        style={{ top: pct(ART_OFFSET, ROOM_HEIGHT), height: pct(ART_HEIGHT, ROOM_HEIGHT) }}
      />

      {/* Pip's speech bubble, tail pointing down at Pip */}
      <div
        aria-live="polite"
        className="absolute flex flex-col justify-center rounded-[1.8cqw] border-room-ink bg-white font-heading font-bold leading-[1.2] text-room-ink"
        style={{
          left: pct(BUBBLE.x, ROOM_WIDTH),
          top: pct(BUBBLE.y, ROOM_HEIGHT),
          minWidth: pct(BUBBLE.w, ROOM_WIDTH),
          maxWidth: pct(BUBBLE.w + 90, ROOM_WIDTH),
          minHeight: pct(BUBBLE.h, ROOM_HEIGHT),
          borderWidth: `max(2px, ${cq(4)})`,
          padding: `${cq(8)} ${cq(18)}`,
          fontSize: `max(9px, ${cq(19)})`,
        }}
      >
        <span className="hidden @min-[560px]:block">{bubble.line}</span>
        <span className="text-[#2f6b44]">{bubble.hint}</span>
      </div>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${ROOM_WIDTH} ${ROOM_HEIGHT}`}
        className="pointer-events-none absolute inset-0 size-full"
        preserveAspectRatio="none"
      >
        <path
          d={`M${BUBBLE.x + 18} ${BUBBLE.y + BUBBLE.h - 6} L${BUBBLE.x - 6} ${BUBBLE.y + BUBBLE.h + 18} L${BUBBLE.x + 46} ${BUBBLE.y + BUBBLE.h - 6}`}
          fill="#fff"
          stroke="var(--color-room-ink)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x={BUBBLE.x + 14} y={BUBBLE.y + BUBBLE.h - 12} width="36" height="8" fill="#fff" />
      </svg>

      {ROOM_SPOTS.map((spot) => {
        const hover = hovered === spot.id;
        const glow = spot.id === suggested && !hover;
        const showLabel = hover || (glow && hovered === null);
        return (
          <div key={spot.id}>
            <button
              type="button"
              aria-label={`${spot.object}: ${spot.label}${spot.id === suggested ? ' (suggested next)' : ''}`}
              onClick={() => onAction(spot.action)}
              onMouseEnter={() => setHovered(spot.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(spot.id)}
              onBlur={() => setHovered(null)}
              className={`absolute cursor-pointer rounded-[4%] outline-none transition-[transform,background-color] active:scale-[0.97] ${
                hover
                  ? 'bg-room-sun/15 shadow-[inset_0_0_0_5px_var(--color-room-sun),0_0_0_4px_var(--color-room-ink)]'
                  : glow
                    ? 'room-glow bg-room-sun/10'
                    : ''
              }`}
              style={{
                left: pct(spot.x, ROOM_WIDTH),
                top: pct(spot.y, ROOM_HEIGHT),
                width: pct(spot.w, ROOM_WIDTH),
                height: pct(spot.h, ROOM_HEIGHT),
              }}
            />
            {showLabel && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute z-10 hidden flex-col items-center whitespace-nowrap rounded-2xl border-4 border-room-ink px-4 pb-1.5 pt-2 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_var(--color-room-ink)] @min-[700px]:flex ${
                  glow ? 'room-bob bg-room-sun' : '-translate-x-1/2 bg-room-blue'
                }`}
                style={{
                  left: pct(spot.x + spot.w / 2, ROOM_WIDTH),
                  top: `max(8px, ${pct(spot.y - 64, ROOM_HEIGHT)})`,
                }}
              >
                <span
                  className={`font-heading text-lg font-extrabold leading-none ${glow ? 'text-room-ink' : 'room-label'}`}
                >
                  {glow ? `Start here: ${spot.label}` : spot.label}
                </span>
                <span className={`text-xs font-bold ${glow ? 'text-room-ink/75' : 'text-white/85'}`}>{spot.object}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
