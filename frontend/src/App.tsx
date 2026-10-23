import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import type { HomeData } from '@shared/types';
import { fetchHomeData } from './lib/api';
import { TopNav } from './components/TopNav';
import { PipMascot } from './components/PipMascot';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { BattlePage } from './pages/BattlePage';
import type { AppOutletContext } from './lib/outlet';

function Layout({ data, addXp }: { data: HomeData; addXp: (xp: number) => void }) {
  const context: AppOutletContext = { ...data, addXp };
  return (
    <div className="min-h-screen bg-ground">
      <TopNav streakDays={data.kid.streakDays} xp={data.kid.xp} />
      <Outlet context={context} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ground">
      <PipMascot mood="happy" size={100} waving={false} className="animate-pip-bounce" />
      <p className="font-heading text-lg font-bold text-ink">Waking Pip up…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ground px-6 text-center">
      <PipMascot mood="worried" size={120} waving={false} />
      <h1 className="font-heading text-2xl font-extrabold text-ink">
        Pip couldn't wake up
      </h1>
      <p className="max-w-sm text-muted">
        We couldn't reach the Pip server. Make sure it's running (<code>npm run dev</code> in
        the project root starts both the server and the app), then refresh this page.
      </p>
      <p className="text-xs text-muted/70">{message}</p>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchHomeData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addXp = useCallback((xp: number) => {
    setData((d) => (d ? { ...d, kid: { ...d.kid, xp: d.kid.xp + xp } } : d));
  }, []);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'No data returned.'} />;

  return (
    <Routes>
      <Route element={<Layout data={data} addXp={addXp} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/community" element={<PlaceholderPage title="Community" file="src/pages/CommunityPage.tsx" />} />
        <Route path="/me" element={<PlaceholderPage title="Me" file="src/pages/MePage.tsx" />} />
      </Route>
    </Routes>
  );
}
