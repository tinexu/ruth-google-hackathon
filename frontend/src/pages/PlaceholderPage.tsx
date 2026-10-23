import { Link } from 'react-router-dom';
import { PipMascot } from '../components/PipMascot';

interface PlaceholderPageProps {
  title: string;
  /** The file that should replace this placeholder, shown for the team. */
  file?: string;
}

// Stand-in for pages that aren't built yet, so every tab already goes somewhere.
export function PlaceholderPage({ title, file }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex max-w-[1360px] flex-col items-center gap-4 px-6 py-24 text-center">
      <PipMascot mood="happy" size={120} waving={false} />
      <h1 className="font-heading text-3xl font-extrabold text-ink">{title}</h1>
      <p className="text-muted">I'm still building this page. Come back soon!</p>
      {file && <code className="text-xs text-muted/70">{file}</code>}
      <Link
        to="/"
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink bg-sun px-5 py-3 font-heading text-base font-bold text-ink shadow-[0_5px_0_#1B2140] transition-transform duration-100 ease-out hover:-translate-y-0.5 hover:shadow-[0_7px_0_#1B2140] active:translate-y-[3px] active:shadow-[0_1px_0_#1B2140]"
      >
        Back to My Pip
      </Link>
    </main>
  );
}
