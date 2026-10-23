import type { ArtifactKind, FeedQuestion, FeedSet } from './types';
import { QUESTIONS_PER_SET } from './types';

export class FeedApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FeedApiError';
    this.status = status;
  }
}

const ARTIFACT_KINDS: ArtifactKind[] = ['chat', 'email', 'post', 'prompts', 'none'];

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Make sure each question from the server has everything the page needs. */
function isFeedQuestion(q: unknown): q is FeedQuestion {
  if (!q || typeof q !== 'object') return false;
  const o = q as Record<string, unknown>;
  return (
    isString(o.id) &&
    typeof o.topicId === 'number' &&
    isString(o.topic) &&
    isString(o.tag) &&
    isString(o.intro) &&
    isString(o.question) &&
    ARTIFACT_KINDS.includes(o.artifactKind as ArtifactKind) &&
    Array.isArray(o.artifactLines) &&
    Array.isArray(o.options) &&
    o.options.length === 4 &&
    o.options.every(isString) &&
    Number.isInteger(o.correctIndex) &&
    (o.correctIndex as number) >= 0 &&
    (o.correctIndex as number) < 4
  );
}

/**
 * Ask the server (which asks Gemini) for a new set of questions.
 * `avoidTopics` = topic ids from the last set, so Pip picks different ones.
 */
export async function fetchQuestionSet(avoidTopics: number[], signal?: AbortSignal): Promise<FeedSet> {
  let res: Response;
  try {
    res = await fetch('/api/feed/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avoidTopics }),
      signal
    });
  } catch {
    throw new FeedApiError('Could not reach the Pip server.');
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : `HTTP ${res.status}`;
    throw new FeedApiError(msg, res.status);
  }

  const body = (data ?? {}) as { setId?: unknown; createdAt?: unknown; questions?: unknown };
  const questions = Array.isArray(body.questions) ? body.questions.filter(isFeedQuestion) : [];
  if (questions.length < QUESTIONS_PER_SET) {
    throw new FeedApiError('The server sent back incomplete questions.');
  }
  const picked = questions.slice(0, QUESTIONS_PER_SET);

  return {
    id: isString(body.setId) ? body.setId : crypto.randomUUID(),
    source: 'gemini',
    createdAt: isString(body.createdAt) ? body.createdAt : new Date().toISOString(),
    questions: picked,
    answers: picked.map(() => null)
  };
}
