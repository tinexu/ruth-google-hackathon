import { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import type { AuthUser, HomeData } from '@shared/types';
import { fetchHomeData, fetchMe, logOut, setUnauthorizedHandler } from './lib/api';
import { setStorageUser } from './feed/storage';
import { TopNav } from './components/TopNav';
import { PipMascot } from './components/PipMascot';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { SettingsPage } from './pages/SettingsPage';
import { BattlePage } from './pages/BattlePage';
import { TeachPage } from './pages/TeachPage';
import { CommunityPage } from './pages/CommunityPage';
import { AuthPage } from './pages/AuthPage';
import type { AppOutletContext } from './lib/outlet';

function Layout({ data, addXp, logOut }: { data: HomeData; addXp: (xp: number) => void; logOut: () => void }) {
  const context: AppOutletContext = useMemo(() => ({ ...data, addXp, logOut }), [data, addXp, logOut]);
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

type Session = { status: 'checking' } | { status: 'signed-out' } | { status: 'signed-in'; user: AuthUser };

export default function App() {
  const [session, setSession] = useState<Session>({ status: 'checking' });
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signedOut = useCallback(() => {
    setStorageUser(null);
    setData(null);
    setSession({ status: 'signed-out' });
  }, []);

  // Any API call that comes back 401 (e.g. the session ran out) lands here.
  useEffect(() => {
    setUnauthorizedHandler(signedOut);
    return () => setUnauthorizedHandler(null);
  }, [signedOut]);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((user) => {
        if (cancelled) return;
        if (user) {
          setStorageUser(user.username);
          setSession({ status: 'signed-in', user });
        } else {
          setSession({ status: 'signed-out' });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadHome = useCallback(() => {
    fetchHomeData()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unknown error'));
  }, []);

  const signedInUser = session.status === 'signed-in' ? session.user.username : null;
  useEffect(() => {
    if (signedInUser) loadHome();
  }, [signedInUser, loadHome]);

  // The server has already saved the XP; show it now and reload level, streak and stats.
  const addXp = useCallback(
    (xp: number) => {
      if (xp > 0) setData((d) => (d ? { ...d, kid: { ...d.kid, xp: d.kid.xp + xp } } : d));
      loadHome();
    },
    [loadHome],
  );

  const handleLogOut = useCallback(() => {
    void logOut().finally(signedOut);
  }, [signedOut]);

  if (error && !data) return <ErrorState message={error} />;
  if (session.status === 'checking') return <LoadingState />;
  if (session.status === 'signed-out') {
    return (
      <AuthPage
        onSignedIn={(user) => {
          setStorageUser(user.username);
          setSession({ status: 'signed-in', user });
        }}
      />
    );
  }
  if (!data) return <LoadingState />;

  return (
    <Routes>
      <Route element={<Layout data={data} addXp={addXp} logOut={handleLogOut} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/train" element={<TeachPage />} />
        <Route path="/teach" element={<Navigate to="/train" replace />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
