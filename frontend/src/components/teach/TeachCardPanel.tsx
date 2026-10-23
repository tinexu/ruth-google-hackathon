import type {
  PublicTeachCard,
  TeachAnswerResult,
  TeachChoiceLetter,
  TeachExample,
} from '@shared/types';
import { Button } from '../Button';
import { PipMascot } from '../PipMascot';
import { ArrowRightIcon, PlusIcon, CrossIcon } from '../icons';

interface TeachCardPanelProps {
  card: PublicTeachCard;
  cardNumber: number;
  cardCount: number;
  picked: TeachChoiceLetter | null;
  /** Letters already tried and found wrong on this card. */
  wrong: TeachChoiceLetter[];
  result: TeachAnswerResult | null;
  /** Labels of the examples the kid has given Pip so far, in order. */
  given: string[];
  /** True once the kid pressed "Train Pip" and Pip took its test. */
  trained: boolean;
  checking: boolean;
  error: string | null;
  onGive: (label: string) => void;
  onResetExamples: () => void;
  onTrain: () => void;
  onPick: (letter: TeachChoiceLetter) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onNext: () => void;
  isLast: boolean;
}

function ExampleTile({ example, isNew }: { example: TeachExample; isNew?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl px-3 py-3.5 ${
        isNew ? 'pop-in border-[2.5px] border-ink bg-mint-light' : 'bg-ground'
      }`}
    >
      <span className="font-heading text-lg font-extrabold leading-tight">{example.label}</span>
      <span className={`text-[13px] font-bold ${isNew ? 'text-ink' : 'text-muted'}`}>
        {example.verdict}
        {isNew && ' · new'}
      </span>
    </div>
  );
}

/**
 * Right column of the Teach page. Each card has two steps: the kid trains Pip with
 * the card's examples (which hide a blind spot), then Pip fails a test and the kid
 * picks the example that fixes it.
 */
export function TeachCardPanel({
  card,
  cardNumber,
  cardCount,
  picked,
  wrong,
  result,
  given,
  trained,
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
  const solved = result?.correct === true;
  const pickedChoice = card.choices.find((c) => c.letter === picked);
  const lastWrong = result && !result.correct ? result : null;
  const needed = card.examples.length;
  const readyToTrain = given.length === needed;

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

      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-bold text-muted">Examples you gave Pip</span>
          {!trained && (
            <span className="text-sm font-bold text-muted tabular-nums">
              {given.length} of {needed}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {trained
            ? card.examples.map((ex) => <ExampleTile key={ex.label} example={ex} />)
            : card.examples.map((_, i) => {
                const ex = card.examples.find((e) => e.label === given[i]);
                return ex ? (
                  <ExampleTile key={ex.label} example={ex} />
                ) : (
                  <div
                    key={`slot-${i}`}
                    className="flex min-h-[76px] items-center justify-center rounded-2xl border-2 border-dashed border-nav-muted font-heading text-xl font-extrabold text-muted"
                  >
                    {i + 1}
                  </div>
                );
              })}
          {!trained ? (
            <div className="flex min-h-[76px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-dashed border-border px-2 py-2 text-center text-[13px] font-bold text-muted">
              <PlusIcon width={18} height={18} strokeWidth={2.4} />
              Add a fix later
            </div>
          ) : solved ? (
            <ExampleTile example={result.picked.example} isNew />
          ) : (
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
          )}
        </div>
      </div>

      {!trained ? (
        <>
          <div className="flex items-center gap-4 rounded-[20px] bg-ground px-4 py-4 sm:px-5">
            <PipMascot mood="happy" size={64} waving={false} className="shrink-0" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-heading text-[22px] font-extrabold leading-tight">
                Pip: "I don't know anything yet! Teach me."
              </span>
              <span className="text-[15px] leading-snug text-muted">
                Give Pip {needed} examples. Then we'll test what it learned.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-bold text-muted">Tap to give Pip an example</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {card.examples.map((ex) => {
                const used = given.includes(ex.label);
                return (
                  <button
                    key={ex.label}
                    type="button"
                    disabled={used}
                    onClick={() => onGive(ex.label)}
                    className={`focus-ring flex min-h-[72px] flex-col gap-1 rounded-2xl border-[2.5px] px-3.5 py-3 text-left transition-transform ${
                      used
                        ? 'cursor-default border-dashed border-nav-muted bg-ground opacity-60'
                        : 'border-ink bg-white shadow-[0_4px_0_#1B2140] hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="font-heading text-lg font-extrabold leading-tight">
                      {ex.label}
                    </span>
                    <span className="text-[13px] font-bold text-muted">
                      {used ? 'added' : ex.verdict}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onResetExamples}
              disabled={given.length === 0}
              className="focus-ring font-bold text-muted underline underline-offset-4 hover:text-ink disabled:no-underline disabled:opacity-50"
            >
              Start over
            </button>
            <Button
              type="button"
              variant="sun"
              onClick={onTrain}
              disabled={!readyToTrain}
              className="py-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Train Pip
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
                Pip: "{solved ? result.pipSays : card.pipMistake}"
              </span>
            </div>
          </div>

          {solved ? (
            <>
              <div className="pop-in flex flex-col gap-1.5">
                <h3 className="font-heading text-[26px] font-extrabold leading-tight">
                  You fixed Pip's blind spot{' '}
                  <span className="text-lg text-[#1F8A52]">+{result.xpEarned} XP</span>
                </h3>
                <p className="text-[17px] leading-relaxed">{result.explanation}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[15px] text-muted">
                  You picked{' '}
                  <b className="text-ink">
                    {result.picked.letter} · {result.picked.example.label} →{' '}
                    {result.picked.example.verdict}
                  </b>
                </span>
                <Button type="button" variant="sun" onClick={onNext} className="py-4">
                  {isLast ? 'See how Pip did' : 'Next card'}
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
                  Pip: "{lastWrong.pipSays}" {lastWrong.feedback}
                </p>
              )}
              {error && (
                <p
                  role="alert"
                  className="rounded-2xl bg-coral-soft px-4 py-3 text-sm font-bold text-coral-ink"
                >
                  {error}
                </p>
              )}

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
                  {checking ? 'Pip is learning…' : "Add to Pip's examples"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
