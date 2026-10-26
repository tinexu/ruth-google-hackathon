import { ROOM_TOOLS, type RoomAction } from './roomSpots';

/**
 * The round buttons for everything in the room. `highlight` marks the one we
 * suggest next in yellow. "bar" sits over the bottom of the room on wide
 * screens; "grid" sits below the room on phones with bigger tap targets.
 */
export function RoomToolbar({
  variant,
  highlight,
  onAction,
}: {
  variant: 'bar' | 'grid';
  highlight?: string;
  onAction: (action: RoomAction) => void;
}) {
  const bar = variant === 'bar';
  return (
    <nav
      aria-label="Room buttons"
      className={
        bar
          ? 'flex gap-2 rounded-[28px] border-[5px] border-room-ink bg-room-blue px-3.5 pb-2 pt-2.5 shadow-[inset_0_-5px_0_rgba(0,0,0,0.2),0_5px_0_var(--color-room-ink)]'
          : 'grid w-full grid-cols-4 gap-x-1.5 gap-y-3'
      }
    >
      {ROOM_TOOLS.map((tool) => {
        const Icon = tool.icon;
        const on = tool.id === highlight;
        return (
          <button
            key={tool.id}
            type="button"
            aria-label={tool.aria}
            onClick={() => onAction(tool.action)}
            className={`focus-ring group flex flex-col items-center gap-1 ${bar ? 'w-16' : ''}`}
          >
            <span
              className={`flex items-center justify-center rounded-full border-4 border-room-ink shadow-[inset_0_-5px_0_rgba(0,0,0,0.2),0_3px_0_var(--color-room-ink)] transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5 ${
                bar ? 'size-[50px]' : 'size-[62px]'
              } ${on ? 'bg-room-sun text-room-ink' : 'bg-room-blue text-white'}`}
            >
              <Icon size={bar ? 24 : 28} strokeWidth={2.6} />
            </span>
            <span className={`room-label font-heading font-extrabold leading-none ${bar ? 'text-[13px]' : 'text-sm'}`}>
              {tool.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
