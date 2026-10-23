// Simple stroke icons from the design kit (currentColor, round caps). Never emoji.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, strokeWidth = 2.2, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest
  };
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6" /><line x1="20" y1="20" x2="15.5" y2="15.5" /></svg>
);
export const BulbIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3Z" />
  </svg>
);
export const PencilIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 5 4 4" />
    <path d="M13 7 5 15v4h4l8-8Z" />
    <path d="m17 3 4 4-2 2-4-4Z" />
  </svg>
);
export const ShieldIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6Z" />
    <path d="m9.5 12 1.8 1.8L15 10" />
  </svg>
);
export const ScaleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v15" />
    <path d="M8 21h8" />
    <path d="M5 7h5M14 7h5" />
    <path d="m5 7-2.5 5a2.5 2.5 0 0 0 5 0Z" />
    <path d="m19 7-2.5 5a2.5 2.5 0 0 0 5 0Z" />
  </svg>
);
export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
export const FeedIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M10 9l5 3-5 3z" /></svg>
);
export const ZapIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M13 2 4 14h6l-1 8 9-12h-6Z" /></svg>
);
export const PawIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="11" width="12" height="9" rx="4" />
    <circle cx="7" cy="7" r="1.8" />
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="17" cy="7" r="1.8" />
  </svg>
);
export const UsersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M21 20c0-2.5-1.8-4.6-4.2-5.4" />
  </svg>
);
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>
);
export const BattleIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
);
export const PipIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="7" width="16" height="13" rx="5" /><path d="M12 3v4" /><circle cx="9" cy="13.5" r="1" /><circle cx="15" cy="13.5" r="1" /></svg>
);
export const MeIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
);
export const FlameIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" /></svg>
);
export const QuestionIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.4M12 17v.2" /></svg>
);
export const InfoIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 3, ...p })}><path d="M5 12l5 5 9-10" /></svg>
);
export const CrossIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 3, ...p })}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 2.6, ...p })}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const DumbbellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 10v4" />
    <path d="M5 8v8" />
    <path d="M19 8v8" />
    <path d="M22 10v4" />
    <path d="M7 12h10" />
    <rect x="4" y="9.5" width="3" height="5" rx="1" fill="currentColor" stroke="none" />
    <rect x="17" y="9.5" width="3" height="5" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);
export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></svg>
);
export const StepsIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.5M4 12h.5M4 18h.5" /></svg>
);
export const TabooIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 5h16v11H9l-5 4z" /><path d="M9 8.5l6 4M15 8.5l-6 4" /></svg>
);
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M10 2h4" /></svg>
);
export const GradCapIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 8l9-4 9 4-9 4z" /><path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" /></svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
