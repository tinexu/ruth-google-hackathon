import type { HomeData } from '@shared/types';

/** What the app Layout hands every page through <Outlet context>. */
export type AppOutletContext = HomeData & {
  /**
   * Call after the server has recorded XP (e.g. a Prompt Battle round). Bumps
   * the nav's XP pill right away, then reloads level, streak and stats.
   */
  addXp: (xp: number) => void;
  /** Signs the kid out and returns to the log-in screen. */
  logOut: () => void;
};
