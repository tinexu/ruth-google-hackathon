import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 'solid' = 2.5px ink border. 'dashed' = dashed border, no hard shadow. */
  border?: 'solid' | 'dashed';
  rounded?: string;
}

export function Card({
  children,
  border = 'solid',
  rounded = 'rounded-[32px]',
  className = '',
  ...rest
}: CardProps) {
  const borderClass =
    border === 'dashed' ? 'border-2 border-dashed border-ink/40' : 'border-[2.5px] border-ink';

  return (
    <div {...rest} className={`${rounded} ${borderClass} ${className}`}>
      {children}
    </div>
  );
}
