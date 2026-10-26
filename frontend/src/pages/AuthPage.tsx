import { useState } from 'react';
import type { AuthUser } from '@shared/types';
import { ServerUnavailableError, logIn, signUp } from '../lib/api';
import { Button } from '../components/Button';
import { PipMascot } from '../components/PipMascot';

type Mode = 'signup' | 'login';

/** Shown instead of the app whenever nobody is signed in. */
export function AuthPage({ onSignedIn }: { onSignedIn: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<Mode>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const user = isSignup ? await signUp(username.trim(), password) : await logIn(username.trim(), password);
      onSignedIn(user);
    } catch (e) {
      setError(
        e instanceof ServerUnavailableError
          ? "Pip can't reach the server right now. Is it running?"
          : e instanceof Error
            ? e.message
            : 'Something went wrong.',
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-ground text-ink">
      <header className="w-full border-b border-nav-border bg-nav">
        <div className="mx-auto flex max-w-[1360px] items-center gap-2 px-6 py-3">
          <PipMascot size={30} waving={false} className="shrink-0" />
          <span className="font-heading text-xl font-extrabold text-white">Pip</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <div className="rounded-[6px_20px_20px_20px] border-[2.5px] border-ink bg-white px-4 py-3 font-heading text-lg font-semibold leading-snug">
            {isSignup
              ? "Hi, I'm Pip! I'm an AI. Want to learn how I really work?"
              : 'Welcome back! I missed you.'}
          </div>
          <PipMascot mood="happy" size={200} className="animate-pip-bounce" />
        </div>

        <section
          aria-labelledby="auth-title"
          className="flex w-full max-w-md flex-col gap-5 rounded-[28px] border-[2.5px] border-ink bg-white p-6 sm:p-8"
        >
          <h1 id="auth-title" className="font-heading text-[32px] font-extrabold leading-tight">
            {isSignup ? 'Make your account' : 'Log in'}
          </h1>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) void submit();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-username" className="font-heading text-lg font-extrabold">
                Nickname
              </label>
              <input
                id="auth-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-describedby={isSignup ? 'auth-username-help' : undefined}
                className="focus-ring w-full rounded-[18px] border-[2.5px] border-ink bg-white px-4 py-3.5 text-[17px]"
              />
              {isSignup && (
                <p id="auth-username-help" className="text-sm text-muted">
                  Pick a fun nickname, <b className="text-ink">not your real name</b>. Other players
                  see it on the leaderboard.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-password" className="font-heading text-lg font-extrabold">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
                minLength={isSignup ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={isSignup ? 'auth-password-help' : undefined}
                className="focus-ring w-full rounded-[18px] border-[2.5px] border-ink bg-white px-4 py-3.5 text-[17px]"
              />
              {isSignup && (
                <p id="auth-password-help" className="text-sm text-muted">
                  At least 8 characters. Ask a grown-up to help you remember it. There's no way to
                  reset it yet.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-2xl bg-coral-soft px-4 py-3 text-sm font-bold text-coral-ink">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="sun"
              disabled={busy}
              className="mt-1 py-4 text-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'One sec…' : isSignup ? 'Start playing' : 'Log in'}
            </Button>
          </form>

          <p className="text-center text-[15px] text-muted">
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? 'login' : 'signup')}
              className="focus-ring font-bold text-ink underline underline-offset-4"
            >
              {isSignup ? 'Log in' : 'Make an account'}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
