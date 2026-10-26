import { QuestionIcon } from '../components/icons';
import type { FeedSet } from './types';
import { XP_PER_CORRECT } from './types';

interface FeedSidebarProps {
  set: FeedSet | null;
  current: number;
}

export function FeedSidebar({ set, current }: FeedSidebarProps) {
  const total = set ? set.questions.length : 0;
  const done = set !== null && current >= total;
  const onScreen = set && !done ? set.questions[current] : null;

  return (
    <aside className="side-col">
      <section className="side-panel">
        <h2>Today's cards</h2>
        <ol className="today-list">
          {set
            ? set.questions.map((q, i) => {
                const a = set.answers[i];
                let cls = '';
                let status = 'Up next';
                if (a?.correct) { cls = 'is-right'; status = `Got it right · +${XP_PER_CORRECT} XP`; }
                else if (a) { cls = 'is-missed'; status = 'Missed · practice later'; }
                else if (i === current) { cls = 'is-current'; status = 'Playing now'; }
                return (
                  <li key={q.id} className={cls}>
                    <span className="today-num" aria-hidden="true">{i + 1}</span>
                    <span className="today-body">
                      <span className="today-title">{q.topic}</span>
                      <span className="today-status">{status}</span>
                    </span>
                  </li>
                );
              })
            : [1, 2, 3, 4].map((n) => (
                <li key={n}>
                  <span className="today-num" aria-hidden="true">{n}</span>
                  <span className="today-body">
                    <span className="today-title">Making a card…</span>
                    <span className="today-status">Up next</span>
                  </span>
                </li>
              ))}
        </ol>
      </section>

      <section className="side-panel">
        <h2 className="why-title"><QuestionIcon />Why am I seeing this?</h2>
        <p>
          {onScreen
            ? onScreen.why
            : 'Pip picks 4 topics from 13 ways AI shows up in your life, so every set is a little different.'}
        </p>
        <p className="why-note">
          {set?.source === 'backup'
            ? 'These are Pip’s practice cards, written ahead of time by people.'
            : 'Each set is written fresh by an AI called Gemini. AI can make mistakes too, so if a card seems wrong, tell a grown-up!'}
        </p>
      </section>
    </aside>
  );
}
