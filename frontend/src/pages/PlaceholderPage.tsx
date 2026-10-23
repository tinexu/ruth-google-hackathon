import { PipMascot } from '../components/PipMascot';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex max-w-[1360px] flex-col items-center gap-4 px-6 py-24 text-center">
      <PipMascot mood="happy" size={120} waving={false} />
      <h1 className="font-heading text-3xl font-extrabold text-ink">{title}</h1>
      <p className="text-muted">This page is coming soon — Pip can't wait!</p>
    </main>
  );
}
