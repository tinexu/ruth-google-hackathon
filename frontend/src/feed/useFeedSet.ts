import { useCallback, useEffect, useRef, useState } from 'react';
import { FeedApiError, fetchQuestionSet } from './api';
import { makeBackupSet } from './backupQuestions';
import {
  archiveSet,
  firstUnanswered,
  isSetComplete,
  loadCurrentSet,
  recordAnswer,
  saveCurrentSet
} from './storage';
import type { FeedSet } from './types';
import { XP_PER_CORRECT } from './types';

export type FeedStatus = 'loading' | 'ready';

export interface FeedState {
  status: FeedStatus;
  set: FeedSet | null;
  /** Index of the card on screen. Equal to questions.length on the results screen. */
  current: number;
  /** Shown above the card when we fell back to practice cards. */
  notice: string | null;
  /** True when "Try again" can swap the practice cards for a Gemini set. */
  canRetry: boolean;
  answer: (optionIndex: number) => void;
  next: () => void;
  loadNewSet: () => void;
}

function backupNotice(err: unknown): string {
  if (err instanceof FeedApiError && err.status === 503) {
    return 'Gemini isn’t connected yet, so here are some practice cards.';
  }
  return 'Pip couldn’t make new cards right now, so here are some practice cards.';
}

/**
 * Runs the feed:
 * - On page load, resume the saved set if it isn't finished.
 * - Otherwise ask Gemini (through the server) for a new set of 4.
 * - If that fails, use the built-in practice cards so the page still works.
 */
export function useFeedSet(): FeedState {
  const [status, setStatus] = useState<FeedStatus>('loading');
  const [set, setSet] = useState<FeedSet | null>(null);
  const [current, setCurrent] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const started = useRef(false);
  const loading = useRef(false);

  const loadNewSet = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setStatus('loading');
    setNotice(null);

    // Tell the server which topics the last set used so the new one feels different.
    const previous = loadCurrentSet();
    const avoidTopics = previous ? previous.questions.map((q) => q.topicId) : [];

    let nextSet: FeedSet;
    try {
      nextSet = await fetchQuestionSet(avoidTopics);
    } catch (err) {
      console.warn('[feed] falling back to practice cards:', err);
      nextSet = makeBackupSet();
      setNotice(backupNotice(err));
    }

    saveCurrentSet(nextSet);
    setSet(nextSet);
    setCurrent(0);
    setStatus('ready');
    loading.current = false;
  }, []);

  // First visit: resume an unfinished set, otherwise generate a new one.
  // (The ref stops React StrictMode from asking Gemini twice in dev.)
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const saved = loadCurrentSet();
    if (saved && !isSetComplete(saved)) {
      setSet(saved);
      setCurrent(firstUnanswered(saved));
      setStatus('ready');
      if (saved.source === 'backup') {
        setNotice('You’re finishing your practice cards. New Gemini cards come after these!');
      }
    } else {
      void loadNewSet();
    }
  }, [loadNewSet]);

  const answer = useCallback(
    (optionIndex: number) => {
      if (!set || current >= set.questions.length || set.answers[current]) return;
      const q = set.questions[current];
      const correct = optionIndex === q.correctIndex;
      const answers = set.answers.slice();
      answers[current] = { picked: optionIndex, correct, answeredAt: new Date().toISOString() };

      let updated: FeedSet = { ...set, answers };
      if (isSetComplete(updated) && !updated.archived) {
        archiveSet(updated); // feeds the teacher / parent report
        updated = { ...updated, archived: true };
      }
      saveCurrentSet(updated);
      setSet(updated);
      recordAnswer(correct ? XP_PER_CORRECT : 0);
    },
    [set, current]
  );

  const next = useCallback(() => {
    setCurrent((c) => (set ? Math.min(c + 1, set.questions.length) : c));
  }, [set]);

  const canRetry = Boolean(set && set.source === 'backup' && set.answers.every((a) => a === null));

  return {
    status,
    set,
    current,
    notice,
    canRetry,
    answer,
    next,
    loadNewSet: () => void loadNewSet()
  };
}
