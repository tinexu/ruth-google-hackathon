interface ToggleGroupProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** A two-way segmented pill control, e.g. "This week / All time". */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: ToggleGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-full border-2 border-ink/10 bg-white p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`focus-ring rounded-full px-4 py-1.5 font-heading text-sm font-bold transition-colors ${
              active ? 'bg-nav text-white' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
