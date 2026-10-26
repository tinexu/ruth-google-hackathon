import { useState } from 'react';
import { hasSeenHint, markHintSeen } from '../../feed/storage';
import { PipMascot } from '../PipMascot';

/**
 * A one-time welcome note above the room, pointing down into it. Once the kid
 * taps "Got it" it stays gone for them (remembered on this device).
 */
export function RoomHint() {
  const [open, setOpen] = useState(() => !hasSeenHint('room'));
  if (!open) return null;

  const dismiss = () => {
    markHintSeen('room');
    setOpen(false);
  };

  return (
    <div role="note" className="pop-in relative w-full max-w-[640px]">
      <div className="flex items-center gap-3 rounded-[22px] border-4 border-room-ink bg-room-note-sun px-3 py-2.5 shadow-[0_4px_0_var(--color-room-ink)] sm:gap-4 sm:px-4">
        <PipMascot size={44} waving className="shrink-0" />
        <p className="min-w-0 flex-1 text-[15px] leading-snug">
          <b className="font-heading text-base">Welcome to your room!</b> Everything in it does something. Tap the{' '}
          <span className="whitespace-nowrap rounded-md bg-room-sun px-1 font-bold">glowing</span> one to start.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="focus-ring min-h-11 shrink-0 rounded-2xl border-4 border-room-ink bg-room-blue px-4 font-heading text-base font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),0_3px_0_var(--color-room-ink)] active:translate-y-0.5"
        >
          Got it
        </button>
      </div>
      {/* tail pointing down into the room */}
      <span
        aria-hidden="true"
        className="absolute -bottom-[11px] left-1/2 size-5 -translate-x-1/2 rotate-45 border-b-4 border-r-4 border-room-ink bg-room-note-sun"
      />
    </div>
  );
}
