import type { LiteralRobotResult, PublicLiteralRobot } from '@shared/types';
import { CheckIcon, InfoIcon } from '../icons';
import { CoachCard, OpponentReveal, PromptBox, ResultActions, ResultHeadline } from './ResultParts';
import type { ArenaProps } from './types';

/** Bolt, the hyper-literal robot. Boxy on purpose: it has no common sense. */
function Bolt({ size = 96, dizzy = false }: { size?: number; dizzy?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="flex-none">
      <line x1="50" y1="4" x2="50" y2="18" stroke="#1B2140" strokeWidth="4" />
      <rect
        x="44"
        y="2"
        width="12"
        height="8"
        rx="2"
        fill="#FFC93C"
        stroke="#1B2140"
        strokeWidth="3"
      />
      <rect
        x="18"
        y="18"
        width="64"
        height="44"
        rx="8"
        fill="#FF7A59"
        stroke="#1B2140"
        strokeWidth="3"
      />
      <rect x="27" y="28" width="46" height="22" rx="4" fill="#1B2140" />
      {dizzy ? (
        <path
          d="M34 34l8 8M42 34l-8 8M58 34l8 8M66 34l-8 8"
          stroke="#FFC93C"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <rect x="35" y="35" width="8" height="8" fill="#FFC93C" />
          <rect x="57" y="35" width="8" height="8" fill="#FFC93C" />
        </>
      )}
      <rect
        x="30"
        y="66"
        width="40"
        height="26"
        rx="6"
        fill="#FF7A59"
        stroke="#1B2140"
        strokeWidth="3"
      />
      <rect
        x="40"
        y="72"
        width="20"
        height="6"
        rx="2"
        fill="#FFFFFF"
        stroke="#1B2140"
        strokeWidth="2"
      />
      <rect
        x="10"
        y="68"
        width="16"
        height="8"
        rx="4"
        fill="#FFC93C"
        stroke="#1B2140"
        strokeWidth="3"
      />
      <rect
        x="74"
        y="68"
        width="16"
        height="8"
        rx="4"
        fill="#FFC93C"
        stroke="#1B2140"
        strokeWidth="3"
      />
    </svg>
  );
}

function stepCount(text: string): number {
  return text.split(/\n|(?:^|\s)\d+[.)]\s/).filter((line) => line.trim().length > 2).length;
}

export function LiteralRobotArena(props: ArenaProps<PublicLiteralRobot, LiteralRobotResult>) {
  const { challenge, result } = props;

  if (result) {
    const missed = result.steps.filter((s) => !s.done).length;
    return (
      <div className="pop-in flex flex-col gap-4">
        <ResultHeadline result={result} />

        <section aria-labelledby="bolt-run" className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Bolt size={52} dizzy={missed > 0} />
            <div className="flex flex-col">
              <h4 id="bolt-run" className="m-0 font-heading text-[20px] font-extrabold">
                Bolt's run
              </h4>
              <span className="text-[13px] font-bold text-muted">
                {missed === 0
                  ? 'Perfect! Not a single mess!'
                  : `${missed} robot disaster${missed > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {result.steps.map((step, i) =>
              step.done ? (
                <li
                  key={step.id}
                  className="flex items-center gap-2.5 rounded-[14px] bg-mint-light px-3 py-2.5 text-[15px] font-bold"
                >
                  <span className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-ink bg-mint">
                    <CheckIcon width={14} height={14} strokeWidth={3} className="shrink-0" />
                  </span>
                  <span className="min-w-0 flex-1">{step.label}</span>
                  <span className="font-heading font-extrabold">+{step.points}</span>
                </li>
              ) : (
                <li
                  key={step.id}
                  className="flex items-start gap-2.5 rounded-[14px] bg-coral-soft px-3 py-2.5"
                >
                  <span className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-ink bg-coral font-bold">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-coral-ink">
                      You skipped: {step.label.toLowerCase()}
                    </span>
                    <span className="text-[15px] leading-[1.4]">{step.disaster}</span>
                  </div>
                  <span className="font-heading font-extrabold text-coral-ink">+0</span>
                </li>
              ),
            )}
          </ol>
        </section>

        <CoachCard>{result.coaching}</CoachCard>
        <OpponentReveal opponent={props.opponent} result={result} />
        <ResultActions
          onRewrite={props.onRewrite}
          onNext={props.onNext}
          nextLabel={props.nextLabel}
        />
      </div>
    );
  }

  const written = stepCount(props.draft);
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-[22px] bg-sun p-4">
          <span className="font-heading text-[13px] font-extrabold tracking-[0.08em] text-sun-ink">
            BOLT'S TASK
          </span>
          <div className="flex items-center gap-3">
            <Bolt size={84} />
            <p className="m-0 font-heading text-[24px] leading-[1.1] font-extrabold">
              {challenge.task}
            </p>
          </div>
        </div>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px]">
          {[
            'Bolt follows your words exactly, in order.',
            'Bolt has zero common sense. If you skip it, Bolt skips it.',
            `The judge looks for ${challenge.stepCount} must-have steps (${Math.round(100 / challenge.stepCount)} pts each).`,
          ].map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <span className="mt-0.5 text-pip-blue">
                <InfoIcon width={18} height={18} className="shrink-0" />
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <PromptBox
        id="prompt-robot"
        label="Your steps for Bolt"
        value={props.draft}
        onChange={props.onDraft}
        onSubmit={props.onSubmit}
        placeholder={'1. ...\n2. ...\n3. ...'}
        rows={7}
        submitting={props.submitting}
        error={props.error}
        sendLabel="Send to Bolt"
        helper={
          <div className="flex items-center justify-between gap-2 text-[13px] text-muted">
            <span className="font-bold">One step per line works best.</span>
            <span className="font-bold text-ink tabular-nums">
              {written} step{written === 1 ? '' : 's'} written
            </span>
          </div>
        }
      />
    </div>
  );
}
