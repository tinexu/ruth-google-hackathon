import { useState } from 'react';
import roomArt from '../../assets/room.webp';
import { ROOM_HEIGHT, ROOM_SPOTS, ROOM_WIDTH, type RoomAction } from './roomSpots';

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

// The art is a little taller than the room frame, so it is scaled to the frame's
// width and trimmed evenly top and bottom (wall above, floor below).
const ART_HEIGHT = 805;
const ART_OFFSET = -22;

/**
 * Pip's room: one illustration with a tap area over each object. Hovering or
 * focusing an object outlines it and shows what it does; the tap areas scale
 * with the picture, so they line up at every width.
 */
export function RoomScene({ onAction }: { onAction: (action: RoomAction) => void }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 bg-[#bc8a63]">
      <img
        src={roomArt}
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-0 block w-full select-none [filter:saturate(0.65)]"
        style={{ top: pct(ART_OFFSET, ROOM_HEIGHT), height: pct(ART_HEIGHT, ROOM_HEIGHT) }}
      />

      {ROOM_SPOTS.map((spot) => {
        const on = active === spot.id;
        return (
          <div key={spot.id}>
            <button
              type="button"
              aria-label={`${spot.object}: ${spot.label}`}
              onClick={() => onAction(spot.action)}
              onMouseEnter={() => setActive(spot.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(spot.id)}
              onBlur={() => setActive(null)}
              className={`absolute cursor-pointer rounded-[4%] outline-none transition-shadow ${
                on ? 'bg-room-sun/15 shadow-[inset_0_0_0_5px_var(--color-room-sun),0_0_0_4px_var(--color-room-ink)]' : ''
              }`}
              style={{
                left: pct(spot.x, ROOM_WIDTH),
                top: pct(spot.y, ROOM_HEIGHT),
                width: pct(spot.w, ROOM_WIDTH),
                height: pct(spot.h, ROOM_HEIGHT),
              }}
            />
            {on && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-2xl border-4 border-room-ink bg-room-blue px-4 pb-1.5 pt-2 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_var(--color-room-ink)]"
                style={{
                  left: pct(spot.x + spot.w / 2, ROOM_WIDTH),
                  top: `max(8px, ${pct(spot.y - 64, ROOM_HEIGHT)})`,
                }}
              >
                <span className="room-label font-heading text-lg font-extrabold leading-none">{spot.label}</span>
                <span className="text-xs font-bold text-white/85">{spot.object}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
