import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'sun' | 'coral' | 'white';

const variantClasses: Record<ButtonVariant, string> = {
  sun: 'bg-sun hover:bg-sun active:bg-sun',
  coral: 'bg-coral hover:bg-coral active:bg-coral',
  white: 'bg-white hover:bg-white active:bg-white',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

/**
 * The kit's signature "hard drop-shadow" button: a flat ink shadow that
 * tucks in on press, with the button nudging up slightly on hover.
 */
export function Button({
  variant = 'sun',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`focus-ring group inline-flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink px-5 py-3 font-heading text-base font-bold text-ink shadow-[0_5px_0_#1B2140] transition-transform duration-100 ease-out hover:-translate-y-0.5 hover:shadow-[0_7px_0_#1B2140] active:translate-y-[3px] active:shadow-[0_1px_0_#1B2140] ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
