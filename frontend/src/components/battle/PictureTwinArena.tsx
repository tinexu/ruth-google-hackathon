import type { PictureTwinResult, PublicPictureTwin } from '@shared/types';
import { CheckIcon, CrossIcon } from '../icons';
import { HamsterScene } from './HamsterScene';
import { FULL_SCENE, type SceneParts } from './scene';
import {
  CoachCard,
  OpponentReveal,
  PromptBox,
  PromptReveal,
  ResultActions,
  ResultHeadline,
} from './ResultParts';
import type { ArenaProps } from './types';

const TIP_FOR: Record<PublicPictureTwin['categories'][number]['id'], string> = {
  subject: 'who it is',
  action: "what it's doing",
  setting: 'where it is',
  background: "what's behind it",
  style: 'the art style',
};

/** "say who it is, what it's doing, and where it is", built from what this round grades. */
function pipTip(challenge: PublicPictureTwin): string {
  const parts = challenge.categories.map((c) =>
    c.id === 'subject' && challenge.difficulty !== 'easy' ? 'who it is and what it wears' : TIP_FOR[c.id],
  );
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}` : parts[0];
}

/**
 * Turn the judge's checklist into what Pip "drew". Details an easier round
 * doesn't grade (no group for them) are drawn just like the target.
 */
function sceneFromResult(result: PictureTwinResult): SceneParts {
  const groups = Object.fromEntries(result.elements.map((e) => [e.id, e.matchedGroups]));
  return {
    hamster: groups.subject?.[0] ?? true,
    hat: groups.subject?.[1] ?? true,
    flipping: groups.action?.[0] ?? true,
    pancake: groups.action?.[1] ?? true,
    cafeteria: groups.setting?.[0] ?? true,
    board: groups.background?.[0] ?? true,
    boardText: groups.background?.[1] ?? true,
    pixel: groups.style?.[0] ?? true,
  };
}

export function PictureTwinArena(props: ArenaProps<PublicPictureTwin, PictureTwinResult>) {
  const { challenge, result } = props;

  if (result) {
    return (
      <div className="pop-in flex flex-col gap-4">
        <ResultHeadline result={result} />
        <div className="grid grid-cols-2 gap-3">
          <figure className="m-0 flex flex-col gap-1.5">
            <HamsterScene parts={FULL_SCENE} label="Target picture" />
            <figcaption className="text-[13px] font-bold text-muted">Target</figcaption>
          </figure>
          <figure className="m-0 flex flex-col gap-1.5">
            <HamsterScene parts={sceneFromResult(result)} label="Pip's drawing from your prompt" />
            <figcaption className="text-[13px] font-bold text-muted">Pip drew</figcaption>
          </figure>
        </div>

        <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Judge checklist">
          {result.elements.map((el) => {
            const tone =
              el.points === el.maxPoints
                ? 'bg-mint-light'
                : el.points > 0
                  ? 'bg-pip-blue-light'
                  : 'bg-coral-light';
            return (
              <li
                key={el.id}
                className={`flex items-center gap-2 rounded-[14px] px-3 py-2 text-[14px] ${tone}`}
              >
                {el.points === el.maxPoints ? (
                  <CheckIcon width={14} height={14} strokeWidth={3} className="shrink-0" />
                ) : (
                  <CrossIcon width={14} height={14} strokeWidth={3} className="shrink-0" />
                )}
                <span className="w-32 flex-none font-bold text-muted">{el.category}</span>
                <span className="min-w-0 flex-1 font-bold">{el.label}</span>
                <span className="font-heading font-extrabold tabular-nums">{el.points}/{el.maxPoints}</span>
              </li>
            );
          })}
        </ul>

        <CoachCard>{result.coaching}</CoachCard>
        <div className="grid gap-2.5 md:grid-cols-2">
          <PromptReveal
            who="Secret target prompt"
            initial="P"
            color="#5B86FF"
            prompt={result.targetPrompt}
          />
          <OpponentReveal opponent={props.opponent} result={result} />
        </div>
        <ResultActions
          onRewrite={props.onRewrite}
          onNext={props.onNext}
          nextLabel={props.nextLabel}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        <span className="font-heading text-[20px] font-extrabold">Get Pip to draw this</span>
        <HamsterScene
          parts={FULL_SCENE}
          label="Target picture: a hamster in a chef's hat flipping a pancake in a school cafeteria, with a Pizza Friday chalkboard, in pixel-art style"
        />
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-muted">
            The AI judge checks {challenge.categories.length} things,{' '}
            {Math.round(100 / challenge.categories.length)} points each:
          </span>
          <ol className="m-0 flex list-none flex-wrap gap-x-4 gap-y-0.5 p-0 text-[14px]">
            {challenge.categories.map((c, i) => (
              <li key={c.id} className="flex gap-1.5">
                <span className="font-heading font-extrabold text-muted tabular-nums">{i + 1}</span>
                <span className="font-bold">{c.category}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <PromptBox
        id="prompt-picture"
        label="Your prompt"
        value={props.draft}
        onChange={props.onDraft}
        onSubmit={props.onSubmit}
        placeholder="Describe the picture: who, wearing what, doing what, where, and in what style..."
        rows={5}
        submitting={props.submitting}
        error={props.error}
        helper={
          <p className="m-0 text-[14px] text-muted">
            <span className="font-bold text-ink">Pip tip:</span> say {pipTip(challenge)}.
          </p>
        }
      />
    </div>
  );
}
