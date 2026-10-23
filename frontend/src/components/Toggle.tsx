import { LockIcon } from './icons';

interface ToggleProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  /** When true, the switch always renders on and ignores clicks/keypresses. */
  locked?: boolean;
  /** Accessible name — the row's own label usually already describes it visually. */
  label: string;
}

/**
 * The kit's pill switch. When `locked`, it stays focusable and announces
 * itself as disabled/checked to assistive tech, but nothing can change it —
 * used for settings a kid shouldn't be able to turn off themselves.
 */
export function Toggle({ checked, onChange, locked = false, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={locked}
      aria-label={label}
      onClick={() => {
        if (!locked) onChange?.(!checked);
      }}
      className={`focus-ring relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-[2.5px] border-ink transition-colors ${
        checked ? 'bg-mint' : 'bg-white'
      } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-[0_2px_0_#1B2140] transition-transform ${
          checked ? 'translate-x-[26px]' : 'translate-x-[2px]'
        }`}
      >
        {locked && <LockIcon size={12} strokeWidth={3} />}
      </span>
    </button>
  );
}
