import { NavLink } from 'react-router-dom';
import { PipMascot } from './PipMascot';
import { Pill } from './Pill';
import {
  FeedIcon,
  ZapIcon,
  PawIcon,
  UsersIcon,
  DumbbellIcon,
  SettingsIcon,
  FlameIcon,
} from './icons';

const TABS = [
  { to: '/feed', label: 'Feed', icon: FeedIcon },
  { to: '/train', label: 'Train', icon: DumbbellIcon },
  { to: '/battle', label: 'Battle', icon: ZapIcon },
  { to: '/', label: 'My Pip', icon: PawIcon, end: true },
  { to: '/community', label: 'Community', icon: UsersIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

interface TopNavProps {
  streakDays: number;
  xp: number;
}

export function TopNav({ streakDays, xp }: TopNavProps) {
  return (
    <header className="w-full border-b border-nav-border bg-nav">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-2">
          <PipMascot size={30} waving={false} className="shrink-0" />
          <span className="hidden font-heading text-xl font-extrabold text-white sm:inline">Pip</span>
        </div>

        {/* Icons only on narrow screens so the bar never runs off the edge; labels stay for screen readers. */}
        <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1" aria-label="Main">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 py-2 font-heading text-sm font-bold transition-colors lg:px-4 ${
                  isActive
                    ? 'bg-sun text-ink'
                    : 'text-nav-muted hover:bg-nav-chip hover:text-white'
                }`
              }
            >
              <Icon width={16} height={16} />
              <span className="sr-only lg:not-sr-only">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <Pill tone="navChip" icon={<FlameIcon width={14} height={14} className="stroke-sun" />}>
              {streakDays} {streakDays === 1 ? 'day' : 'days'}
            </Pill>
          </span>
          <Pill tone="navChip">{xp}XP</Pill>
        </div>
      </div>
    </header>
  );
}
