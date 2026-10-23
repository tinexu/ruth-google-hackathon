import type { Opponent } from '@shared/types';

/** Props every battle arena gets from BattlePage. */
export interface ArenaProps<C, R> {
  challenge: C;
  opponent: Opponent;
  playerInitial: string;
  /** Set when showing the result screen; null while writing. */
  result: R | null;
  draft: string;
  onDraft: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  onRewrite: () => void;
  onNext: () => void;
  nextLabel: string;
}
