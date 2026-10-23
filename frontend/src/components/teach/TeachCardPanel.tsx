import { useState } from 'react';
import type {
  PublicTeachCard,
  TeachAnswerResult,
  TeachChoiceLetter,
  TeachExample,
  TeachTrainResult,
} from '@shared/types';
import { Button } from '../Button';
import { PipMascot } from '../PipMascot';
import { ArrowRightIcon, PlusIcon, CrossIcon } from '../icons';
import { TeachMediaView } from './TeachMediaView';

const MAX_EXAMPLE_LENGTH = 40;

interface TeachCardPanelProps {
  card: PublicTeachCard;
  cardNumber: number;
  cardCount: number;
  picked: TeachChoiceLetter | null;
  /** Letters already tried and found wrong on this card. */
  wrong: TeachChoiceLetter[];
  result: TeachAnswerResult | null;
  /** The labeled examples the kid has typed for Pip so far. */
  given: TeachExample[];
  /** Set once Pip has trained on `given` and taken its test. */
  trainResult: TeachTrainResult | null;
  checking: boolean;
  error: string | null;
  onGive: (example: TeachExample) => void;
  onResetExamples: () => void;
  onTrain: () => void;
  onPick: (letter: TeachChoiceLetter) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onNext: () => void;
  isLast: boolean;
}

function ExampleTile({ example, highlight }: { example: TeachExample; highlight?: 'new' | 'fix' }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl px-3 py-3.5 ${
        highlight ? 'pop-in border-[2.5px] border-ink bg-mint-light' : 'bg-ground'
      }`}
    >
      <span className="font-heading text-lg font-extrabold leading-tight break-words">
        {example.label}
      </span>
      <span className={`text-[13px] font-bold ${highlight ? 'text-ink' : 'text-muted'}`}>
        {example.verdict}
        {highlight === 'new' && ' · new'}
      </span>
    </div>
  );
}

/** Text box + label picker for the kid's next training example. Nothing is pre-filled. */
function ExampleInput({
  card,
  slotNumber,
  given,
  onGive,
}: {
  card: PublicTeachCard;
  slotNumber: number;
  given: TeachExample[];
  onGive: (example: TeachExample) => void;
}) {
  const [text, setText] = useState('');
  const [verdict, setVerdict] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const inputId = `teach-example-${slotNumber}`;
  const [labelA, labelB] = card.labels;

  function add() {
    const label = text.trim().replace(/\s+/g, ' ');
    if (label.length < 2) {
      setProblem('Type an example first.');
      return;
    }
    if (given.some((g) => g.label.toLowerCase() === label.toLowerCase())) {
      setProblem('You already gave Ada that one. Try a different example.');
      return;
    }
    if (!verdict) {
      setProblem(`Tell Ada what it means: ${labelA} or ${labelB}?`);
      return;
    }
    onGive({ label, verdict });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="font-heading text-lg font-extrabold">
          Example {slotNumber} of {card.examples.length}
        </label>
        <span className="text-[15px] text-muted">{card.trainHelp}</span>
      </div>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        autoFocus={slotNumber > 1}
        maxLength={MAX_EXAMPLE_LENGTH}
        value={text}
        placeholder="Type your example"
        aria-describedby={problem ? `${inputId}-problem` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          setProblem(null);
        }}
        className="focus-ring w-full rounded-[18px] border-[2.5px] border-ink bg-white px-4 py-3.5 text-[17px] text-ink placeholder:text-muted/70"
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <span id={`${inputId}-means`} className="text-[15px] font-bold">
          This means:
        </span>
        <div role="radiogroup" aria-labelledby={`${inputId}-means`} className="flex gap-2">
          {card.labels.map((l) => {
            const on = verdict === l;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setVerdict(l);
                  setProblem(null);
                }}
                className={`focus-ring rounded-full border-2 border-ink px-4 py-2 font-heading text-base font-bold transition-colors ${
                  on ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ground'
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>
        <Button type="submit" variant="white" className="ml-auto py-2.5">
          <PlusIcon width={18} height={18} strokeWidth={2.4} />
          Add example
        </Button>
      </div>
      {problem && (
        <p id={`${inputId}-problem`} role="alert" className="text-sm font-bold text-coral-ink">
          {problem}
        </p>
      )}
    </form>
  );
}

/**
 * Right column of the Teach page. Each card has two steps: the kid types and labels
 * examples to train Pip, then Pip takes a test. If the kid's examples missed the
 * card's blind spot, Pip fails and the kid picks the example that fixes it.
 */
export function TeachCardPanel({
  card,
  cardNumber,
  cardCount,
  picked,
  wrong,
  result,
  given,
  trainResult,
  checking,
  error,
  onGive,
  onResetExamples,
  onTrain,
  onPick,
  onSubmit,
  onSkip,
  onNext,
  isLast,
}: TeachCardPanelProps) {
  const trained = trainResult !== null;
  const coveredBy = trainResult?.coveredBy ?? null;
  const fixedByChoice = result?.correct === true ? result : null;
  const solved = Boolean(coveredBy || fixedByChoice);
  const pickedChoice = card.choices.find((c) => c.letter === picked);
  const lastWrong = result && !result.correct ? result : null;
  const needed = card.examples.length;
  const readyToTrain = given.length === needed;
  const pipLine = fixedByChoice?.pipSays ?? trainResult?.pipSays ?? card.pipMistake;

  const errorMessage = error && (
    <p
      role="alert"
      className="rounded-2xl bg-coral-soft px-4 py-3 text-sm font-bold text-coral-ink"
    >
      {error}
    </p>
  );

  return (
    <section
      aria-labelledby="teach-question"
      className="flex min-w-0 flex-1 flex-col gap-5 rounded-[28px] border-[2.5px] border-ink bg-white p-5 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-heading text-[13px] font-extrabold uppercase tracking-[0.08em] text-muted">
          {card.category}
        </span>
        <span className="text-sm font-bold text-muted">
          Card {cardNumber} of {cardCount}
        </span>
      </div>
      <h2
        id="teach-question"
        className="-mt-3 font-heading text-[26px] font-extrabold leading-tight sm:text-[30px]"
      >
        {card.question}
      </h2>

      {card.media && <TeachMediaView media={card.media} />}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-bold text-muted">Examples you gave Ada</span>
          {!trained && (
            <span className="text-sm font-bold text-muted tabular-nums">
              {given.length} of {needed}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: needed }, (_, i) =>
            given[i] ? (
              <ExampleTile
                key={`given-${i}`}
                example={given[i]}
                highlight={coveredBy && given[i].label === coveredBy.label ? 'fix' : undefined}
              />
            ) : (
              <div
                key={`slot-${i}`}
                className="flex min-h-[76px] items-center justify-center rounded-2xl border-2 border-dashed border-nav-muted font-heading text-xl font-extrabold text-muted"
              >
                {i + 1}
              </div>
            ),
          )}
          {fixedByChoice ? (
            <ExampleTile example={fixedByChoice.picked.example} highlight="new" />
          ) : trained && !coveredBy ? (
            <div className="flex min-h-[76px] items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-muted px-3 py-3 text-center font-bold text-muted">
              {pickedChoice ? (
                <span className="text-sm leading-snug text-ink">{pickedChoice.example.label}?</span>
              ) : (
                <>
                  <PlusIcon width={20} height={20} strokeWidth={2.4} />
                  Add
                </>
              )}
            </div>
          ) : !trained ? (
            <div className="flex min-h-[76px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-dashed border-border px-2 py-2 text-center text-[13px] font-bold text-muted">
              <PlusIcon width={18} height={18} strokeWidth={2.4} />
              Add a fix later
            </div>
          ) : null}
        </div>
      </div>

      {!trained ? (
        <>
          <div className="flex items-center gap-4 rounded-[20px] bg-ground px-4 py-4 sm:px-5">
            <PipMascot mood="happy" size={64} waving={false} className="shrink-0" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-heading text-[22px] font-extrabold leading-tight">
                Ada: "{card.trainPrompt}"
              </span>
              <span className="text-[15px] leading-snug text-muted">
                Give Ada {needed} examples. Then we'll test what it learned.
              </span>
            </div>
          </div>

          {!readyToTrain && (
            <ExampleInput
              key={given.length}
              card={card}
              slotNumber={given.length + 1}
              given={given}
              onGive={onGive}
            />
          )}
          {errorMessage}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onResetExamples}
              disabled={given.length === 0 || checking}
              className="focus-ring font-bold text-muted underline underline-offset-4 hover:text-ink disabled:no-underline disabled:opacity-50"
            >
              Start over
            </button>
            <Button
              type="button"
              variant="sun"
              onClick={onTrain}
              disabled={!readyToTrain || checking}
              className="py-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? 'Ada is learning…' : 'Train Ada'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div
            className={`flex items-center gap-4 rounded-[20px] px-4 py-4 sm:px-5 ${
              solved ? 'bg-mint-light' : 'bg-coral-soft'
            }`}
          >
            <PipMascot
              mood={solved ? 'happy' : 'worried'}
              size={64}
              waving={false}
              className="shrink-0"
            />
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[15px] leading-snug">{card.testCase}</span>
              <span
                className={`font-heading text-[22px] font-extrabold leading-tight ${
                  solved ? 'text-ink' : 'text-coral-ink'
                }`}
              >
                Ada: "{pipLine}"
              </span>
            </div>
          </div>

          {solved ? (
            <>
              <div className="pop-in flex flex-col gap-1.5">
                <h3 className="font-heading text-[26px] font-extrabold leading-tight">
                  {coveredBy ? 'Your examples already covered it' : "You fixed Ada's blind spot"}{' '}
                  <span className="text-lg text-[#1F8A52]">
                    +{coveredBy ? trainResult?.xpEarned : fixedByChoice?.xpEarned} XP
                  </span>
                </h3>
                <p className="text-[17px] leading-relaxed">
                  {coveredBy ? trainResult?.explanation : fixedByChoice?.explanation}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[15px] text-muted">
                  {coveredBy ? 'Ada learned it from ' : 'You picked '}
                  <b className="text-ink">
                    {coveredBy
                      ? `${coveredBy.label} → ${coveredBy.verdict}`
                      : `${fixedByChoice?.picked.letter} · ${fixedByChoice?.picked.example.label} → ${fixedByChoice?.picked.example.verdict}`}
                  </b>
                </span>
                <Button type="button" variant="sun" onClick={onNext} className="py-4">
                  {isLast ? 'See how Ada did' : 'Next card'}
                  <ArrowRightIcon width={20} height={20} strokeWidth={2.6} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[17px] leading-relaxed">{card.uhOh}</p>

              <div
                role="radiogroup"
                aria-label="Pick a card to add"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {card.choices.map((choice) => {
                  const isPicked = choice.letter === picked;
                  const isWrong = wrong.includes(choice.letter);
                  return (
                    <button
                      key={choice.letter}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      disabled={isWrong || checking}
                      onClick={() => onPick(choice.letter)}
                      className={`focus-ring flex min-h-[60px] items-center gap-3 rounded-[18px] border-[2.5px] border-ink px-4 py-3.5 text-left text-base leading-snug transition-transform ${
                        isWrong
                          ? 'cursor-not-allowed border-dashed border-muted bg-white text-muted shadow-none'
                          : isPicked
                            ? 'translate-y-0.5 bg-pip-blue-light shadow-[0_2px_0_#1B2140]'
                            : 'bg-white shadow-[0_4px_0_#1B2140] hover:-translate-y-0.5'
                      }`}
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] border-2 font-heading text-[17px] font-extrabold ${
                          isWrong
                            ? 'border-muted'
                            : isPicked
                              ? 'border-ink bg-pip-blue'
                              : 'border-ink bg-white'
                        }`}
                      >
                        {isWrong ? <CrossIcon width={16} height={16} strokeWidth={3} /> : choice.letter}
                      </span>
                      <span className={isWrong ? 'line-through decoration-2' : ''}>
                        {choice.example.label} → {choice.example.verdict}
                      </span>
                    </button>
                  );
                })}
              </div>

              {lastWrong && (
                <p
                  role="alert"
                  className="pop-in flex items-start gap-2 rounded-2xl bg-coral-soft px-4 py-3 text-[15px] font-bold leading-snug text-coral-ink"
                >
                  <CrossIcon width={18} height={18} strokeWidth={3} className="mt-0.5 shrink-0" />
                  Ada: "{lastWrong.pipSays}" {lastWrong.feedback}
                </p>
              )}
              {errorMessage}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onSkip}
                  className="focus-ring font-bold text-muted underline underline-offset-4 hover:text-ink"
                >
                  Skip this card
                </button>
                <Button
                  type="button"
                  variant="sun"
                  onClick={onSubmit}
                  disabled={!picked || checking}
                  className="py-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checking ? 'Ada is learning…' : "Add to Ada's examples"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
