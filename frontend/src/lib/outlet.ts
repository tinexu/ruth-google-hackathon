import type { HomeData } from '@shared/types';

/** What the app Layout hands every page through <Outlet context>. */
export type AppOutletContext = HomeData & {
  /** Add XP earned on a page (e.g. a Prompt Battle round) to the nav's XP pill. */
  addXp: (xp: number) => void;
};
