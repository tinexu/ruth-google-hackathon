import { Link, NavLink } from 'react-router-dom';
import { activeStreak, useStats } from '../feed/storage';
import { BattleIcon, FeedIcon, FlameIcon, MeIcon, PipIcon } from './icons';
import { PipMascot } from './PipMascot';

// Shared top bar on every page. Routes live in src/App.tsx.
export function TopBar() {
  const stats = useStats();
  const streak = activeStreak(stats);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Logo -> /feed (src/pages/FeedPage.tsx) */}
        <Link className="brand" to="/feed" aria-label="Pip home">
          <PipMascot size={44} />
          <span>Pip</span>
        </Link>

        <nav className="main-nav" aria-label="Main">
          {/* Feed tab -> /feed -> src/pages/FeedPage.tsx (daily AI-literacy challenge cards) */}
          <NavLink to="/feed"><FeedIcon />Feed</NavLink>

          {/* Battle tab -> /battle -> src/pages/BattlePage.tsx (Prompt Battle: write the prompt that gets
              Pip to draw the target). Its result screen -> /battle/result -> src/pages/BattleResultPage.tsx */}
          <NavLink to="/battle"><BattleIcon />Battle</NavLink>

          {/* My Pip tab -> /pip -> src/pages/PipPage.tsx (the pet: adopt, train, health,
              inventory/rewards, unlocked features) */}
          <NavLink to="/pip"><PipIcon />My Pip</NavLink>

          {/* Me tab -> /me -> src/pages/MePage.tsx (profile, XP, streak, friends' scorecard,
              settings, language). Link the grown-ups' dashboard (/dashboard ->
              src/pages/DashboardPage.tsx) from there, not as a kid tab. */}
          <NavLink to="/me"><MeIcon />Me</NavLink>
        </nav>

        <div className="stat-pills">
          <div className="pill pill-streak" title="Days in a row you've played">
            <FlameIcon size={18} />
            <span>{streak === 0 ? 'Start a streak' : `${streak} ${streak === 1 ? 'day' : 'days'}`}</span>
          </div>
          <div className="pill pill-xp">{stats.xp} XP</div>
        </div>
      </div>
    </header>
  );
}
