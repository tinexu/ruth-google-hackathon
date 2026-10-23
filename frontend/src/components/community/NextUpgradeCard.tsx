import { useNavigate } from 'react-router-dom';
import type { NextUpgrade } from '@shared/types';
import { Button } from '../Button';

interface NextUpgradeCardProps {
  upgrade: NextUpgrade;
}

export function NextUpgradeCard({ upgrade }: NextUpgradeCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[28px] border-[2.5px] border-ink bg-nav p-6">
      <h3 className="font-heading text-lg font-extrabold text-sun">Ada's next upgrade</h3>
      <p className="mt-2 text-sm text-white/90">{upgrade.description}</p>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-sun" style={{ width: `${upgrade.progressPercent}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-white/70">
        {upgrade.xpToGo} XP to go · about {upgrade.feedCardsEstimate} feed cards
      </p>

      <Button
        variant="sun"
        className="mt-4 w-full justify-center"
        onClick={() => navigate('/feed')}
      >
        Earn XP in the Feed
      </Button>
    </div>
  );
}
