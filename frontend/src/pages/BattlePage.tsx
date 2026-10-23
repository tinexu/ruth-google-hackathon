import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type {
  BattleResult,
  BattlesResponse,
  Kid,
  LiteralRobotResult,
  PictureTwinResult,
  PublicChallenge,
  TabooResult,
} from '@shared/types';
import { ServerUnavailableError, fetchBattles, submitBattlePrompt } from '../lib/api';
import type { AppOutletContext } from '../lib/outlet';
import { Button } from '../components/Button';
import { PipMascot } from '../components/PipMascot';
import { ClockIcon } from '../components/icons';
import { PipSays } from '../components/battle/PipSays';
import { LiteralRobotArena } from '../components/battle/LiteralRobotArena';
import { MODE_STYLE } from '../components/battle/modes';
import { PictureTwinArena } from '../components/battle/PictureTwinArena';
import { TabooArena } from '../components/battle/TabooArena';
import type { ArenaProps } from '../components/battle/types';
import { VersusBanner } from '../components/battle/VersusBanner';

const ROUND_SECONDS = 30;

function usesBannedWord(challenge: PublicChallenge, prompt: string): boolean {
  if (challenge.mode !== 'secret-word-taboo') return false;
  return prompt
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .some((w) => w && challenge.bannedStems.some((s) => w.startsWith(s)));
}

function TimerPill({ seconds }: { seconds: number }) {
  const low = seconds <= 10;
  return (
    <span
      role="timer"
      aria-label={`${seconds} seconds left`}
      className={`flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-[15px] font-bold tabular-nums ${
        low ? 'animate-pulse bg-coral' : 'bg-white'
      }`}
    >
      <ClockIcon width={16} height={16} strokeWidth={2.4} className="shrink-0" />
      0:{String(seconds).padStart(2, '0')}
    </span>
  );
}

function BattleArena({
  kid,
  battles,
  onXpEarned,
}: {
  kid: Kid;
  battles: BattlesResponse;
  onXpEarned: (xp: number) => void;
}) {
  const { challenges, opponent } = battles;
  const [activeId, setActiveId] = useState(challenges[0]?.id ?? '');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, BattleResult>>({});
  const [rewriting, setRewriting] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // XP only counts the first time you play a round, even across "Play again".
  const awarded = useRef(new Set<string>());

  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [timerRun, setTimerRun] = useState(0);

  const active = challenges.find((c) => c.id === activeId);
  const showResult =
    active && results[active.id] && !rewriting[active.id] ? results[active.id] : null;
  const timerActive = Boolean(active) && !showResult && !submitting && !timedOut;

  // Refs let the interval read the latest values without restarting every second.
  const timeLeftRef = useRef(ROUND_SECONDS);
  const onTimeUpRef = useRef<() => void>(() => {});

  function restartTimer() {
    timeLeftRef.current = ROUND_SECONDS;
    setTimeLeft(ROUND_SECONDS);
    setTimedOut(false);
    setTimerRun((n) => n + 1);
  }

  // Time's up: send whatever the kid wrote, if it's allowed.
  useEffect(() => {
    onTimeUpRef.current = () => {
      if (!active) return;
      setTimedOut(true);
      const prompt = drafts[active.id] ?? '';
      if (prompt.trim() && !usesBannedWord(active, prompt)) void submit(active);
    };
  });

  useEffect(() => {
    if (!timerActive) return;
    const deadline = Date.now() + timeLeftRef.current * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      timeLeftRef.current = left;
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(id);
        onTimeUpRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [timerActive, timerRun]);

  if (!active) return null;

  const activeIndex = challenges.indexOf(active);
  const nextUnplayed =
    challenges.slice(activeIndex + 1).find((c) => !results[c.id]) ??
    challenges.find((c) => c.id !== activeId && !results[c.id]);

  function goTo(id: string) {
    setActiveId(id);
    setError(null);
    restartTimer();
    document.getElementById('arena')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function playAgain() {
    setResults({});
    setDrafts({});
    setRewriting({});
    goTo(challenges[0].id);
  }

  async function submit(challenge: PublicChallenge) {
    const prompt = drafts[challenge.id] ?? '';
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitBattlePrompt(challenge.id, prompt);
      if (!awarded.current.has(challenge.id)) {
        awarded.current.add(challenge.id);
        onXpEarned(result.xpEarned);
      }
      setResults((r) => ({ ...r, [challenge.id]: result }));
      setRewriting((w) => ({ ...w, [challenge.id]: false }));
    } catch (e) {
      setError(
        e instanceof ServerUnavailableError
          ? "Pip can't reach the server right now. Is it running? Try again in a moment."
          : e instanceof Error
            ? e.message
            : 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const common = {
    opponent,
    playerInitial: kid.name.charAt(0).toUpperCase(),
    draft: drafts[active.id] ?? '',
    onDraft: (v: string) => setDrafts((d) => ({ ...d, [active.id]: v })),
    onSubmit: () => submit(active),
    submitting,
    error,
    onRewrite: () => {
      setRewriting((w) => ({ ...w, [active.id]: true }));
      restartTimer();
    },
    onNext: () => (nextUnplayed ? goTo(nextUnplayed.id) : playAgain()),
    nextLabel: nextUnplayed ? 'Next round' : 'Play again',
  } satisfies Omit<ArenaProps<unknown, unknown>, 'challenge' | 'result'>;

  let arena;
  if (timedOut && !showResult && !submitting) {
    const draft = common.draft;
    arena = (
      <div className="pop-in flex flex-col gap-4">
        <PipSays mood="worried">
          {!draft.trim()
            ? "Time's up! You didn't send me a prompt in 30 seconds."
            : usesBannedWord(active, draft)
              ? "Time's up, and your prompt still had a banned word, so I couldn't send it."
              : "Time's up! I tried to send your prompt, but something went wrong."}
        </PipSays>
        {error && (
          <p
            role="alert"
            className="m-0 rounded-[14px] bg-coral-soft px-3 py-2 text-[14px] font-bold text-coral-ink"
          >
            {error}
          </p>
        )}
        <p className="m-0 text-[15px] text-muted">
          Tip: write the most important details first, then add more if you have time.
        </p>
        <Button
          type="button"
          variant="coral"
          className="py-4"
          onClick={restartTimer}
          icon={<ClockIcon width={20} height={20} strokeWidth={2.6} className="shrink-0" />}
        >
          Try again ({ROUND_SECONDS} seconds)
        </Button>
      </div>
    );
  } else {
    switch (active.mode) {
      case 'picture-twin':
        arena = (
          <PictureTwinArena
            {...common}
            challenge={active}
            result={showResult as PictureTwinResult | null}
          />
        );
        break;
      case 'literal-robot':
        arena = (
          <LiteralRobotArena
            {...common}
            challenge={active}
            result={showResult as LiteralRobotResult | null}
          />
        );
        break;
      case 'secret-word-taboo':
        arena = (
          <TabooArena {...common} challenge={active} result={showResult as TabooResult | null} />
        );
        break;
    }
  }

  const style = MODE_STYLE[active.mode];
  const ModeIcon = style.icon;

  return (
    <main className="mx-auto flex max-w-[920px] flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-[40px] font-extrabold leading-tight text-ink">
          Prompt Battles
        </h1>
        <p className="text-lg text-muted">
          Beat {opponent.name} in 3 rounds. You get {ROUND_SECONDS} seconds to write each prompt.
        </p>
      </header>

      <section
        id="arena"
        aria-labelledby="arena-h"
        className="scroll-mt-20 overflow-hidden rounded-[22px] border-[2.5px] border-ink bg-pip-blue-light"
      >
        <VersusBanner
          kid={kid}
          opponent={opponent}
          challenges={challenges}
          results={results}
          activeId={activeId}
        />

        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`flex size-12 items-center justify-center rounded-[14px] border-2 border-ink ${style.tile}`}
              >
                <ModeIcon width={24} height={24} />
              </span>
              <div className="flex flex-col">
                <h2
                  id="arena-h"
                  className="m-0 font-heading text-[26px] leading-tight font-extrabold"
                >
                  {active.title}
                </h2>
                <span className="text-[13px] font-bold text-muted">
                  Round {active.round} of {challenges.length}
                </span>
              </div>
            </div>
            {!showResult && <TimerPill seconds={timeLeft} />}
          </div>

          {!showResult && !timedOut && <PipSays mood="happy">{active.pipIntro}</PipSays>}

          {arena}
        </div>
      </section>
    </main>
  );
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; battles: BattlesResponse };

export function BattlePage() {
  const { kid, addXp } = useOutletContext<AppOutletContext>();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchBattles()
      .then((battles) => {
        if (!cancelled) setState({ status: 'ready', battles });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({ status: 'error', message: e instanceof Error ? e.message : 'Unknown error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <main className="flex flex-col items-center gap-4 px-6 py-24">
        <PipMascot mood="happy" size={100} waving={false} className="animate-pip-bounce" />
        <p className="font-heading text-lg font-bold text-ink">Pip is setting up the arena…</p>
      </main>
    );
  }
  if (state.status === 'error') {
    return (
      <main className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <PipMascot mood="worried" size={120} waving={false} />
        <h1 className="font-heading text-2xl font-extrabold text-ink">
          Pip couldn't load the battles
        </h1>
        <p className="max-w-sm text-muted">
          Make sure the server is running, then refresh this page.
        </p>
        <p className="text-xs text-muted/70">{state.message}</p>
      </main>
    );
  }
  return <BattleArena kid={kid} battles={state.battles} onXpEarned={addXp} />;
}
