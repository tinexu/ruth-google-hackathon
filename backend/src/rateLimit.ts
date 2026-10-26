import type { NextFunction, Request, Response } from 'express';

/**
 * Small in-memory fixed-window limiter. Fine for one server process; a
 * multi-server deploy would move this to a shared store.
 */
export function rateLimit(opts: {
  windowMs: number;
  max: number;
  /** Who to count: the signed-in user if there is one, else the IP. */
  key?: (req: Request, res: Response) => string;
  message: string;
}) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = opts.key?.(req, res) ?? req.ip ?? 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > opts.max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ error: opts.message });
      return;
    }
    next();
  };
}

/** Rate-limit key for routes behind requireUser. */
export const byUser = (_req: Request, res: Response) =>
  `user:${(res.locals.user as { id: number } | undefined)?.id ?? 'anon'}`;
