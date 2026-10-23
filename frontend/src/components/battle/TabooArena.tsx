import type { PublicTaboo, TabooResult } from '@shared/types';
import { CrossIcon } from '../icons';
import { PipMascot } from '../PipMascot';
import {
  CoachCard,
  OpponentReveal,
  PromptBox,
  PromptReveal,
  ResultActions,
  ResultHeadline,
} from './ResultParts';
import type { ArenaProps } from './types';

function tokens(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);
}

function SecretCard({ challenge }: { challenge: PublicTaboo }) {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-sun p-5">
      <span className="font-heading text-[13px] font-extrabold tracking-[0.08em] text-sun-ink">
        SECRET WORD
      </span>
      <span className="font-heading text-[44px] leading-none font-extrabold">
        {challenge.secretWord}
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="text-[14px] font-bold text-sun-ink">
          Don't type it. Don't type these either:
        </span>
        <ul
          className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-0.5 p-0 text-[18px] font-bold"
          aria-label="Banned words"
        >
          {challenge.bannedWords.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TabooArena(props: ArenaProps<PublicTaboo, TabooResult>) {
  const { challenge, result } = props;

  if (result) {
    return (
      <div className="pop-in flex flex-col gap-4">
        <ResultHeadline result={result} />

        <section aria-label="What happened" className="flex flex-col gap-2.5">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-[20px_6px_20px_20px] border-[2.5px] border-ink bg-pip-blue px-3.5 py-2.5 text-[16px] font-bold">
              {result.usedBanned.length > 0 ? (
                <BannedHighlight text={props.draft} stems={challenge.bannedStems} />
              ) : (
                props.draft
              )}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <PipMascot waving={false} size={46} mood={result.success ? 'happy' : 'worried'} />
            <div
              className={`rounded-[6px_20px_20px_20px] border-[2.5px] border-ink px-3.5 py-2.5 font-heading text-[22px] leading-tight font-extrabold ${
                result.success ? 'bg-mint-light' : 'bg-coral-light'
              }`}
            >
              {result.aiReply}
            </div>
          </div>
          <p className="m-0 text-[14px] text-muted">
            <span className="font-bold text-ink">
              {result.success
                ? `Pip said "${result.secretWord}"`
                : `Pip didn't say "${result.secretWord}"`}
            </span>{' '}
            in a {result.wordCount}-word prompt.
            {result.success && ' Fewer words means more points.'}
          </p>
        </section>

        <CoachCard>{result.coaching}</CoachCard>
        <div className="grid gap-2.5 md:grid-cols-2">
          <OpponentReveal opponent={props.opponent} result={result} />
          <PromptReveal
            who="Pip's sample winning prompt"
            initial="P"
            color="#5B86FF"
            prompt={result.samplePrompt}
          />
        </div>
        <ResultActions
          onRewrite={props.onRewrite}
          onNext={props.onNext}
          nextLabel={props.nextLabel}
        />
      </div>
    );
  }

  const words = tokens(props.draft);
  const banned = [
    ...new Set(
      words.filter((w) => challenge.bannedStems.some((s) => w.toLowerCase().startsWith(s))),
    ),
  ];
  const projected = Math.max(40, 100 - 5 * Math.max(0, words.length - 5));

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <SecretCard challenge={challenge} />
      <PromptBox
        id="prompt-taboo"
        label="Your prompt"
        value={props.draft}
        onChange={props.onDraft}
        onSubmit={props.onSubmit}
        placeholder="Describe it without the banned words..."
        rows={3}
        submitting={props.submitting}
        error={props.error}
        blocked={banned.length > 0}
        sendLabel="Ask Pip"
        helper={
          <div className="flex flex-col gap-1.5" aria-live="polite">
            {banned.length > 0 && (
              <p className="m-0 flex items-center gap-1.5 rounded-[14px] bg-coral-soft px-3 py-2 text-[14px] font-bold text-coral-ink">
                <CrossIcon width={16} height={16} strokeWidth={3} className="shrink-0" />
                Buzz! "{banned.join('", "')}" is off limits. Try another way to say it.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
              <span className="font-bold text-ink tabular-nums">{words.length} words</span>
              {words.length > 0 && banned.length === 0 && (
                <span>· up to {projected} points if Pip gets it</span>
              )}
              {words.length === 0 && (
                <span className="font-bold">
                  Pip tip: name a famous example instead of describing it.
                </span>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}

function BannedHighlight({ text, stems }: { text: string; stems: string[] }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) => {
        const bare = part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();
        const isBanned = bare && stems.some((s) => bare.startsWith(s));
        return isBanned ? (
          <mark key={i} className="rounded bg-coral px-1 text-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
