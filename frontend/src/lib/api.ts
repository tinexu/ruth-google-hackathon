import type {
  ApiError,
  BattleResult,
  BattlesResponse,
  CommunityData,
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

export async function fetchHomeData(): Promise<HomeData> {
  const res = await fetch('/api/home');
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }
  return (await res.json()) as HomeData;
}

/** Thrown when the Express server can't be reached (Vite's proxy answers 502/504 or plain text). */
export class ServerUnavailableError extends Error {}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ServerUnavailableError('Could not reach the Ada server.');
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!isJson || res.status === 502 || res.status === 504) {
    throw new ServerUnavailableError('The Ada server is not running.');
  }
  const body = (await res.json()) as T | ApiError;
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
