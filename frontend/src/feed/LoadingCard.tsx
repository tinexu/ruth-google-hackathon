import { PipMascot } from '../components/PipMascot';

export function LoadingCard() {
  return (
    <section className="feed-card" aria-busy="true">
      <span className="tag">NEW CARDS</span>
      <div className="pip-row">
        <PipMascot size={84} waving className="pip pip-bounce" />
        <p className="bubble" role="status">I'm making 4 brand-new challenges just for you. One sec!</p>
      </div>
      <div className="skeleton-list" aria-hidden="true">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </section>
  );
}
