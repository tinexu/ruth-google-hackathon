import type {
  ApiError,
  AuthRequest,
  AuthUser,
  BattleResult,
  BattlesResponse,
  CommunityData,
  FeedAnswerReport,
  FeedAnswerResult,
  HomeData,
  SubmitRequest,
  TeachAnswerRequest,
  TeachAnswerResult,
  TeachChoiceLetter,
  TeachExample,
  TeachResponse,
  TeachTrainRequest,
  TeachTrainResult,
} from '@shared/types';

export function fetchHomeData(): Promise<HomeData> {
  return requestJson<HomeData>('/api/home');
}

/** Thrown when the Express server can't be reached (Vite's proxy answers 502/504 or plain text). */
export class ServerUnavailableError extends Error {}

/** Thrown when the kid isn't signed in (or their session ran out). */
export class UnauthorizedError extends Error {}

let onUnauthorized: (() => void) | null = null;

/** The app registers this so an expired session anywhere sends the kid back to log in. */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ServerUnavailableError('Could not reach the Pip server.');
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!isJson || res.status === 502 || res.status === 504) {
    throw new ServerUnavailableError('The Pip server is not running.');
  }
  const body = (await res.json()) as T | ApiError;
  if (res.status === 401) {
    onUnauthorized?.();
    throw new UnauthorizedError((body as ApiError).error ?? 'Please log in first.');
  }
  if (!res.ok) throw new Error((body as ApiError).error ?? `Server responded with ${res.status}`);
  return body as T;
}

export function fetchBattles(): Promise<BattlesResponse> {
  return requestJson<BattlesResponse>('/api/battles');
}

export function submitBattlePrompt(challengeId: string, prompt: string): Promise<BattleResult> {
  return requestJson<BattleResult>(`/api/battles/${encodeURIComponent(challengeId)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt } satisfies SubmitRequest),
  });
}

export function fetchTeachCards(): Promise<TeachResponse> {
  return requestJson<TeachResponse>('/api/teach');
}

export function answerTeachCard(
  cardId: string,
  letter: TeachChoiceLetter,
): Promise<TeachAnswerResult> {
  return requestJson<TeachAnswerResult>(`/api/teach/${encodeURIComponent(cardId)}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ letter } satisfies TeachAnswerRequest),
  });
}

export function trainTeachCard(
  cardId: string,
  examples: TeachExample[],
): Promise<TeachTrainResult> {
  return requestJson<TeachTrainResult>(`/api/teach/${encodeURIComponent(cardId)}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ examples } satisfies TeachTrainRequest),
  });
}

export function fetchCommunityData(): Promise<CommunityData> {
  return requestJson<CommunityData>('/api/community');
}

// ---------- Accounts ----------

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** The signed-in kid, or null when signed out. Doesn't trigger the unauthorized handler. */
export async function fetchMe(): Promise<AuthUser | null> {
  let res: Response;
  try {
    res = await fetch('/api/auth/me');
  } catch {
    throw new ServerUnavailableError('Could not reach the Pip server.');
  }
  if (res.status === 401) return null;
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new ServerUnavailableError('The Pip server is not running.');
  }
  if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  return (await res.json()) as AuthUser;
}

export function signUp(username: string, password: string): Promise<AuthUser> {
  return postJson<AuthUser>('/api/auth/signup', {
    username,
    password,
    timezone: browserTimezone(),
  } satisfies AuthRequest);
}

export function logIn(username: string, password: string): Promise<AuthUser> {
  return postJson<AuthUser>('/api/auth/login', {
    username,
    password,
    timezone: browserTimezone(),
  } satisfies AuthRequest);
}

export async function logOut(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

/** Saves one answered feed card; the server decides the XP. */
export function reportFeedAnswer(report: FeedAnswerReport): Promise<FeedAnswerResult> {
  return postJson<FeedAnswerResult>('/api/progress/feed', report);
}
