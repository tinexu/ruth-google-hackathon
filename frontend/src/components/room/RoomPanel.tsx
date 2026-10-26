import { useEffect, useRef, type ReactNode } from 'react';
import { CrossIcon } from '../icons';

/**
 * A blue game-style window over the room. Built on <dialog>, so focus stays
 * inside while it's open and Escape closes it; clicking the dimmed room
 * around it closes it too.
 */
export function RoomPanel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(660px,calc(100%-32px))] max-h-[calc(100%-32px)] overflow-visible bg-transparent p-0 text-ink backdrop:bg-[rgba(14,18,38,0.55)]"
    >
      <div className="pop-in relative flex max-h-[calc(100dvh-48px)] flex-col rounded-[34px] border-[5px] border-room-ink bg-room-blue p-3 shadow-[inset_0_-6px_0_rgba(0,0,0,0.2),0_10px_0_var(--color-room-ink)]">
        <h2 className="room-title px-14 pb-3 pt-0.5 text-center font-heading text-[30px] font-extrabold leading-none sm:text-[34px]">
          {title}
        </h2>
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="focus-ring absolute -right-3 -top-3 flex size-[52px] items-center justify-center rounded-full border-[5px] border-room-ink bg-room-red text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.2),0_4px_0_var(--color-room-ink)] sm:-right-4 sm:-top-4"
        >
          <CrossIcon size={22} strokeWidth={3.5} />
        </button>
        <div className="min-h-0 overflow-y-auto rounded-[22px]">{children}</div>
      </div>
    </dialog>
  );
}
