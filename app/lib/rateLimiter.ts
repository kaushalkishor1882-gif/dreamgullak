type RateEntry = {
  count: number;
  lastReset: number;
};

const RATE_LIMIT = 20; // max messages
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const store = new Map<string, RateEntry>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (now - entry.lastReset > WINDOW_MS) {
    store.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}
