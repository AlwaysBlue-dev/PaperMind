const DAILY_LIMIT = 10;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getModelAnswerCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(`pm_ai_count_${todayKey()}`);
  return raw ? parseInt(raw, 10) : 0;
}

export function incrementModelAnswerCount(): number {
  const key = `pm_ai_count_${todayKey()}`;
  const next = getModelAnswerCount() + 1;
  localStorage.setItem(key, String(next));
  return next;
}

export function isModelAnswerRateLimited(): boolean {
  return getModelAnswerCount() >= DAILY_LIMIT;
}

export const MODEL_ANSWER_DAILY_LIMIT = DAILY_LIMIT;
