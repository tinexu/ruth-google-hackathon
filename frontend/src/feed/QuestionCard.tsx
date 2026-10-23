import { useEffect, useRef } from 'react';
import { ArrowRightIcon, CheckIcon, CrossIcon, InfoIcon } from '../components/icons';
import { PipMascot } from '../components/PipMascot';
import type { FeedAnswer, FeedQuestion } from './types';
import { XP_PER_CORRECT } from './types';

const LETTERS = ['A', 'B', 'C', 'D'];

const ARTIFACT_TITLES: Record<string, string> = {
  chat: 'Chat',
  email: 'Email',
  post: 'Post',
  prompts: 'Prompts'
};

interface QuestionCardProps {
  question: FeedQuestion;
  index: number;
  total: number;
  answers: (FeedAnswer | null)[];
  onAnswer: (optionIndex: number) => void;
  onNext: () => void;
}

export function QuestionCard({ question: q, index, total, answers, onAnswer, onNext }: QuestionCardProps) {
  const answer = answers[index];
  const answered = answer !== null;
  const isLast = index === total - 1;
  const nextRef = useRef<HTMLButtonElement>(null);

  // A–D or 1–4 picks an answer; Enter goes to the next card once answered.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (answered) return;
      const key = e.key.toUpperCase();
      const i = LETTERS.indexOf(key) !== -1 ? LETTERS.indexOf(key) : ['1', '2', '3', '4'].indexOf(key);
      if (i !== -1 && i < q.options.length) {
        e.preventDefault();
        onAnswer(i);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, onAnswer, q.options.length]);

  // Move focus to "Next card" after answering, so keyboard users can keep going.
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  const mood = !answered ? 'happy' : answer.correct ? 'excited' : 'worried';
  const bubble = !answered ? q.intro : answer.correct ? q.pipRight : q.pipWrong;

  return (
    <article className="feed-card" aria-labelledby="q-question">
      <div className="card-top">
        <span className="tag">{q.tag}</span>
        <span className="card-count">Card {index + 1} of {total} today</span>
      </div>

      <div className="dots" aria-hidden="true">
        {answers.map((a, i) => (
          <span key={i} className={a !== null ? 'is-done' : i === index ? 'is-current' : ''} />
        ))}
      </div>

      <div className="pip-row">
        <PipMascot size={84} mood={mood} className="pip" />
        <p className="bubble" aria-live="polite">{bubble}</p>
      </div>

      {q.artifactKind !== 'none' && q.artifactLines.length > 0 && (
        <div className="artifact" data-kind={q.artifactKind}>
          <span className="artifact-kind">{ARTIFACT_TITLES[q.artifactKind]}</span>
          <div className="artifact-lines">
            {q.artifactLines.map((line, i) => (
              <div key={i} className={`artifact-line${/^(ai|bot|chatbot|pip)$/i.test(line.label) ? ' is-ai' : ''}`}>
                <span className="artifact-label">{line.label}</span>
                <span>{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="question" id="q-question">{q.question}</h2>

      <div className="options" role="group" aria-labelledby="q-question">
        {q.options.map((text, i) => {
          const isCorrect = i === q.correctIndex;
          const isPicked = answered && answer.picked === i;
          let state = '';
          let label = `${LETTERS[i]}: ${text}`;
          if (answered) {
            if (isCorrect) { state = 'is-correct'; label += ' (correct answer)'; }
            else if (isPicked) { state = 'is-wrong'; label += ' (your answer, not correct)'; }
            else state = 'is-faded';
          }
          return (
            <button
              key={i}
              type="button"
              className={`option ${state}`}
              disabled={answered}
              aria-label={label}
              onClick={() => onAnswer(i)}
            >
              <span className="option-main">
                <span className="option-key" aria-hidden="true">{LETTERS[i]}</span>
                <span>{text}</span>
              </span>
              {answered && isCorrect && <span className="option-mark"><CheckIcon size={16} /></span>}
              {answered && isPicked && !isCorrect && <span className="option-mark"><CrossIcon size={14} /></span>}
            </button>
          );
        })}
      </div>

      {answered && answer.correct && (
        <div className="feedback feedback-right" role="status">
          <div className="feedback-head">
            <span className="feedback-title">Nice work!</span>
            <span className="xp-pill">+{XP_PER_CORRECT} XP</span>
          </div>
          <p>{q.explanation}</p>
        </div>
      )}
      {answered && !answer.correct && (
        <div className="feedback feedback-wrong" role="status">
          <span className="feedback-title">Not quite. The green one is right.</span>
          <p>{q.explanation}</p>
        </div>
      )}

      <div className="card-foot">
        <span className="card-meta">
          <InfoIcon size={16} />
          {q.topic} · +{XP_PER_CORRECT} XP
        </span>
        {answered ? (
          <button ref={nextRef} type="button" className="btn btn-blue" onClick={onNext}>
            {isLast ? 'See my results' : 'Next card'}
            <ArrowRightIcon />
          </button>
        ) : (
          <span className="card-hint">Pick an answer<span className="kbd-hint"> (or press A, B, C or D)</span></span>
        )}
      </div>
    </article>
  );
}
