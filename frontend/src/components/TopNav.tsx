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
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-2">
          <PipMascot size={30} waving={false} className="shrink-0" />
          <span className="font-heading text-xl font-extrabold text-white">Pip</span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Main">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-heading text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-sun text-ink'
                    : 'text-nav-muted hover:bg-nav-chip hover:text-white'
                }`
              }
            >
              <Icon width={16} height={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Pill tone="navChip" icon={<FlameIcon width={14} height={14} className="stroke-sun" />}>
            {streakDays} days
          </Pill>
          <Pill tone="navChip">{xp}XP</Pill>
        </div>
      </div>
    </header>
  );
}
