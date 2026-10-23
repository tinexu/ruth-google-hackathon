import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type {
  PublicTeachCard,
  TeachAnswerResult,
  TeachChoiceLetter,
  TeachExample,
  TeachTrainResult,
} from '@shared/types';
import {
  ServerUnavailableError,
  answerTeachCard,
  fetchTeachCards,
  trainTeachCard,
} from '../lib/api';
import type { AppOutletContext } from '../lib/outlet';
import { Button } from '../components/Button';
import { PipMascot } from '../components/PipMascot';
import { PipProgress } from '../components/teach/PipProgress';
import { TeachCardPanel } from '../components/teach/TeachCardPanel';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; cards: PublicTeachCard[] };

export function TeachPage() {
  const { pet, kid, addXp } = useOutletContext<AppOutletContext>();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchTeachCards()
      .then(({ cards }) => {
        if (!cancelled) setState({ status: 'ready', cards });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({ status: 'error', message: e instanceof Error ? e.message : 'Unknown error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 py-10 text-ink">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[40px] font-extrabold leading-tight text-ink">
          Teach Pip
        </h1>
        <p className="text-lg text-muted">
          Pip only knows what your examples show it. Find the blind spot and fix it.
        </p>
      </div>

      {state.status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <PipMascot mood="happy" size={100} waving={false} className="animate-pip-bounce" />
          <p className="font-heading text-lg font-bold text-ink">Pip is getting its notes out…</p>
        </div>
      )}
      {state.status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <PipMascot mood="worried" size={120} waving={false} />
          <h2 className="font-heading text-2xl font-extrabold text-ink">
            Pip couldn't load its lessons
          </h2>
          <p className="max-w-sm text-muted">
            Make sure the server is running, then refresh this page.
          </p>
          <p className="text-xs text-muted/70">{state.message}</p>
        </div>
      )}
      {state.status === 'ready' && (
        <TeachSession cards={state.cards} pet={pet} xp={kid.xp} onXpEarned={addXp} />
      )}
    </main>
  );
}

function TeachSession({
  cards,
  pet,
  xp,
  onXpEarned,
}: {
  cards: PublicTeachCard[];
  pet: AppOutletContext['pet'];
  xp: number;
  onXpEarned: (xp: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TeachChoiceLetter | null>(null);
  const [wrong, setWrong] = useState<TeachChoiceLetter[]>([]);
  const [result, setResult] = useState<TeachAnswerResult | null>(null);
  const [given, setGiven] = useState<TeachExample[]>([]);
  const [trainResult, setTrainResult] = useState<TeachTrainResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixed, setFixed] = useState<string[]>([]);
  // XP only counts the first time a card is fixed, even after "Teach again".
  const awarded = useRef(new Set<string>());

  const done = index >= cards.length;
  const card = cards[Math.min(index, cards.length - 1)];
  const trained = trainResult !== null;
  const solved = result?.correct === true || Boolean(trainResult?.coveredBy);

  function markFixed(xpEarned: number) {
    setFixed((f) => (f.includes(card.id) ? f : [...f, card.id]));
    if (!awarded.current.has(card.id)) {
      awarded.current.add(card.id);
      onXpEarned(xpEarned);
    }
  }

  function showError(e: unknown) {
    setError(
      e instanceof ServerUnavailableError
        ? "Pip can't reach the server right now. Is it running?"
        : e instanceof Error
          ? e.message
          : 'Something went wrong.',
    );
  }

  async function train() {
    setChecking(true);
    setError(null);
    try {
      const r = await trainTeachCard(card.id, given);
      setTrainResult(r);
      if (r.coveredBy) markFixed(r.xpEarned);
    } catch (e) {
      showError(e);
    } finally {
      setChecking(false);
    }
  }

  function goTo(next: number) {
    setIndex(next);
    setPicked(null);
    setWrong([]);
    setResult(null);
    setError(null);
    setGiven([]);
    setTrainResult(null);
  }

  async function submit() {
    if (!picked) return;
    setChecking(true);
    setError(null);
    try {
      const r = await answerTeachCard(card.id, picked);
      setResult(r);
      if (r.correct) {
        markFixed(r.xpEarned);
      } else {
        setWrong((w) => [...w, picked]);
        setPicked(null);
      }
    } catch (e) {
      showError(e);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-10 lg:flex-row">
      <PipProgress
        pet={pet}
        xp={xp}
        mood={solved || done || !trained ? 'happy' : 'worried'}
        celebrating={solved}
      />

      {done ? (
        <section
          aria-labelledby="teach-done"
          className="pop-in flex min-w-0 flex-1 flex-col gap-4 rounded-[28px] border-[2.5px] border-ink bg-white p-5 sm:p-7"
        >
          <h2 id="teach-done" className="font-heading text-[30px] font-extrabold leading-tight">
            You fixed {fixed.length} of {cards.length} blind spots
          </h2>
          <p className="text-[17px] leading-relaxed">
            AI only knows what it's trained on. Every blind spot you found was a missing example,
            and adding it is how real AI gets fairer and safer too.
          </p>
          <ul className="flex flex-col gap-2">
            {cards.map((c) => {
              const ok = fixed.includes(c.id);
              return (
                <li
                  key={c.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 font-bold ${
                    ok ? 'bg-mint-light' : 'bg-ground text-muted'
                  }`}
                >
                  <span>{c.category}</span>
                  <span className="text-sm">{ok ? 'Fixed' : 'Skipped'}</span>
                </li>
              );
            })}
          </ul>
          <Button type="button" variant="sun" onClick={() => goTo(0)} className="self-start py-4">
            Teach again
          </Button>
        </section>
      ) : (
        <TeachCardPanel
          card={card}
          cardNumber={index + 1}
          cardCount={cards.length}
          picked={picked}
          wrong={wrong}
          result={result}
          given={given}
          trainResult={trainResult}
          onGive={(example) => setGiven((g) => [...g, example])}
          onResetExamples={() => setGiven([])}
          onTrain={train}
          checking={checking}
          error={error}
          onPick={(letter) => {
            setPicked(letter);
            setResult((r) => (r && !r.correct ? null : r));
          }}
          onSubmit={submit}
          onSkip={() => goTo(index + 1)}
          onNext={() => goTo(index + 1)}
          isLast={index === cards.length - 1}
        />
      )}
    </div>
  );
}
