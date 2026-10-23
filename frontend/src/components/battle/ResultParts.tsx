import type { ReactNode } from 'react';
import type { BattleResult, Opponent } from '@shared/types';
import { ArrowRightIcon, PencilIcon, ZapIcon } from '../icons';
import { Button } from '../Button';
import { PipMascot } from '../PipMascot';

export function ScoreRing({ score, size = 110 }: { score: number; size?: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const color = score >= 80 ? '#2FBF71' : score >= 50 ? '#5B86FF' : '#FF7A59';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      role="img"
      aria-label={`Prompt score ${score} out of 100`}
      className="flex-none"
    >
      <circle cx="55" cy="55" r={r} fill="#FFFFFF" stroke="#DDE3F5" strokeWidth="12" />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
        transform="rotate(-90 55 55)"
      />
      <text
        x="55"
        y="64"
        textAnchor="middle"
        fontFamily="Baloo 2, system-ui, sans-serif"
        fontWeight="800"
        fontSize="32"
        fill="#1B2140"
      >
        {score}
      </text>
    </svg>
  );
}

const HEADLINES = {
  win: 'You win this round!',
  tie: "It's a tie!",
  lose: 'So close!',
} as const;

export function ResultHeadline({ result }: { result: BattleResult }) {
  const { outcome, opponent, xpEarned } = result;
  const sub =
    outcome === 'win'
      ? `${opponent.name} scored ${opponent.score}. Your prompt was clearer.`
      : outcome === 'tie'
        ? `You and ${opponent.name} both scored ${opponent.score}. One more detail breaks the tie.`
        : `${opponent.name} scored ${opponent.score} this round. Rewrite and try to beat it.`;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ScoreRing score={result.score} />
      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 font-heading text-[30px] leading-none font-extrabold">
            {HEADLINES[outcome]}
          </h3>
          <span className="rounded-full border-2 border-ink bg-mint px-3 py-1 text-[14px] font-bold">
            +{xpEarned} XP
          </span>
        </div>
        <p className="m-0 text-[15px] text-muted">{sub}</p>
      </div>
    </div>
  );
}

export function CoachCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-t-2 border-border pt-4">
      <PipMascot waving={false} size={46} />
      <div className="flex flex-col gap-1">
        <span className="font-heading text-[17px] font-extrabold">Pip's coaching</span>
        <p className="m-0 text-[15px] leading-[1.45]">{children}</p>
      </div>
    </div>
  );
}

export function PromptReveal({
  who,
  initial,
  color,
  prompt,
  score,
}: {
  who: string;
  initial: string;
  color: string;
  prompt: string;
  score?: number;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex size-[34px] flex-none items-center justify-center rounded-full border-2 border-ink font-bold"
        style={{ background: color }}
      >
        {initial}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2 text-[13px] font-bold text-muted">
          {who}
          {score !== undefined && <span className="tabular-nums">{score} pts</span>}
        </span>
        <p className="m-0 text-[15px] leading-[1.4] break-words">"{prompt}"</p>
      </div>
    </div>
  );
}

export function OpponentReveal({ opponent, result }: { opponent: Opponent; result: BattleResult }) {
  return (
    <PromptReveal
      who={`${opponent.name}'s prompt`}
      initial={opponent.initial}
      color="#2FBF71"
      prompt={result.opponent.prompt}
      score={result.opponent.score}
    />
  );
}

export function ResultActions({
  onRewrite,
  onNext,
  nextLabel,
}: {
  onRewrite: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button
        type="button"
        variant="white"
        onClick={onRewrite}
        icon={<PencilIcon width={18} height={18} strokeWidth={2.4} className="shrink-0" />}
      >
        Rewrite
      </Button>
      <Button type="button" variant="coral" onClick={onNext}>
        {nextLabel}
        <ArrowRightIcon width={18} height={18} strokeWidth={2.6} className="shrink-0" />
      </Button>
    </div>
  );
}

/** Shared "write your prompt" box: label, textarea, helper row, send button. */
export function PromptBox({
  id,
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  rows = 3,
  submitting,
  error,
  blocked,
  helper,
  sendLabel = 'Send to Pip',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  rows?: number;
  submitting: boolean;
  error: string | null;
  blocked?: boolean;
  helper?: ReactNode;
  sendLabel?: string;
}) {
  const disabled = submitting || blocked || !value.trim();
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSubmit();
      }}
    >
      <label htmlFor={id} className="font-heading text-[18px] font-extrabold">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={1000}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !disabled) onSubmit();
        }}
        className={`box-border w-full resize-y rounded-[18px] border-[2.5px] bg-white px-3.5 py-3 text-[17px] leading-[1.4] text-ink placeholder:text-muted/70 ${
          blocked ? 'border-coral' : 'border-ink'
        }`}
      />
      {helper}
      {error && (
        <p
          role="alert"
          className="m-0 rounded-[14px] bg-coral-soft px-3 py-2 text-[14px] font-bold text-coral-ink"
        >
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="coral"
        className="mt-1 py-4 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        icon={<ZapIcon width={20} height={20} strokeWidth={2.6} className="shrink-0" />}
      >
        {submitting ? 'Pip is thinking...' : sendLabel}
      </Button>
    </form>
  );
}
