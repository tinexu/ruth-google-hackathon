import { Link, useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../lib/outlet';
import { DoneCard } from '../feed/DoneCard';
import { FeedSidebar } from '../feed/FeedSidebar';
import { LoadingCard } from '../feed/LoadingCard';
import { QuestionCard } from '../feed/QuestionCard';
import { useFeedSet } from '../feed/useFeedSet';

// Route: /feed
export function FeedPage() {
  const { addXp } = useOutletContext<AppOutletContext>();
  const feed = useFeedSet(addXp);
  const { status, set, current } = feed;
  const total = set?.questions.length ?? 0;
  const done = status === 'ready' && set !== null && current >= total;

  const remaining = set ? set.answers.filter((a) => a === null).length : 0;
  const progress = status === 'loading' ? 'Making new cards…' : done ? `All ${total} cards done` : `${remaining} ${remaining === 1 ? 'card' : 'cards'} left in this set`;

  return (
    <main className="page">
      <div className="page-head">
        <div className="feed-switch">
          <h1>For you</h1>
          {/* Class feed -> /class -> src/pages/ClassFeedPage.tsx (cards a teacher assigned with a class code) */}
          <Link to="/class">Class</Link>
        </div>
        <span className="page-progress" aria-live="polite">{progress}</span>
      </div>

      <div className="layout">
        <div className="card-col">
          {feed.notice && status === 'ready' && (
            <div className="banner" role="status">
              <span>{feed.notice}</span>
              {feed.canRetry && (
                <button type="button" className="banner-btn" onClick={feed.loadNewSet}>Try Gemini again</button>
              )}
            </div>
          )}

          {status === 'loading' || !set ? (
            <LoadingCard />
          ) : done ? (
            <DoneCard set={set} onNewSet={feed.loadNewSet} />
          ) : (
            <QuestionCard
              key={set.questions[current].id}
              question={set.questions[current]}
              index={current}
              total={total}
              answers={set.answers}
              onAnswer={feed.answer}
              onNext={feed.next}
            />
          )}
        </div>

        <FeedSidebar set={status === 'loading' ? null : set} current={current} />
      </div>
    </main>
  );
}
