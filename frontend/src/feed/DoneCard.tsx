import { useEffect, useRef } from 'react';
import { PipMascot } from '../components/PipMascot';
import type { FeedSet } from './types';
import { XP_PER_CORRECT } from './types';

interface DoneCardProps {
  set: FeedSet;
  onNewSet: () => void;
}

export function DoneCard({ set, onNewSet }: DoneCardProps) {
  const total = set.questions.length;
  const score = set.answers.filter((a) => a && a.correct).length;
  const missed = set.questions.filter((_, i) => !set.answers[i]?.correct);
  const headingRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <article className="feed-card">
      <span className="tag" ref={headingRef} tabIndex={-1}>DONE FOR TODAY</span>
      <div className="pip-row">
        <PipMascot size={96} mood="excited" waving className="pip" />
        <p className="bubble">
          {score === total
            ? 'Wow, a perfect set! You’re getting really good at spotting how AI works.'
            : 'Great job! Every card you miss teaches you something new.'}
        </p>
      </div>

      <div className="score-grid">
        <div className="score-tile">
          <span className="score-label">You got</span>
          <span className="score-num">{score} of {total}</span>
        </div>
        <div className="score-tile score-tile-mint">
          <span className="score-label">XP earned</span>
          <span className="score-num">+{score * XP_PER_CORRECT}</span>
        </div>
      </div>

      <div className="practice">
        <h2>Practice again next time</h2>
        <ul>
          {missed.length === 0 ? (
            <li className="is-none">Nothing! You got every card right.</li>
          ) : (
            missed.map((q) => (
              <li key={q.id}><span><strong>{q.topic}:</strong> {q.question}</span></li>
            ))
          )}
        </ul>
        <p className="practice-note">Your teacher and grown-ups see this list too, so they can help you practice.</p>
      </div>

      <button type="button" className="btn btn-blue btn-start" onClick={onNewSet}>Get 4 new cards</button>
    </article>
  );
}
