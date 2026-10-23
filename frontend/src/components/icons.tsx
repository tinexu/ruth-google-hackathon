import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </svg>
  );
}

export function BulbIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15 5 4 4" />
      <path d="M13 7 5 15v4h4l8-8Z" />
      <path d="m17 3 4 4-2 2-4-4Z" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6Z" />
      <path d="m9.5 12 1.8 1.8L15 10" />
    </svg>
  );
}

export function ScaleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v15" />
      <path d="M8 21h8" />
      <path d="M5 7h5M14 7h5" />
      <path d="m5 7-2.5 5a2.5 2.5 0 0 0 5 0Z" />
      <path d="m19 7-2.5 5a2.5 2.5 0 0 0 5 0Z" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function FeedIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m10 9 5 3-5 3Z" />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6Z" />
    </svg>
  );
}

export function PawIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="11" width="12" height="9" rx="4" />
      <circle cx="7" cy="7" r="1.8" />
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="17" cy="7" r="1.8" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 20c0-2.5-1.8-4.6-4.2-5.4" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} {...props} strokeWidth={1.8}>
      <path d="M12 2c1 3-2 4-2 7a3 3 0 1 0 6 1c0-1-1-2-1-2 2 1 3 3 3 5a6 6 0 1 1-12 0c0-5 4-6 6-11Z" />
    </svg>
  );
}
