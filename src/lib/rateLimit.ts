interface Bucket {
  count: number;
  resetAt: number;
}

interface LoginBackoffState {
  failures: number;
  windowStart: number;
  blockedUntil: number;
}

const buckets = new Map<string, Bucket>();
const loginBackoffs = new Map<string, LoginBackoffState>();
let lastPrune = 0;

function pruneExpired(now: number) {
  if (now - lastPrune < 60_000 && buckets.size < 2000) return;
  lastPrune = now;
  for (const [k, v] of buckets.entries()) {
    if (v.resetAt <= now) {
      buckets.delete(k);
    }
  }
  for (const [k, v] of loginBackoffs.entries()) {
    if (now - v.windowStart > 2 * 60 * 60_000 && v.blockedUntil <= now) {
      loginBackoffs.delete(k);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  pruneExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSec: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX_FAILURES = 5;

export function getAdminLoginStatus(ip: string): {
  allowed: boolean;
  retryAfterSec: number;
  failures: number;
} {
  const now = Date.now();
  pruneExpired(now);
  const state = loginBackoffs.get(ip);
  if (!state) {
    return { allowed: true, retryAfterSec: 0, failures: 0 };
  }
  if (state.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((state.blockedUntil - now) / 1000)),
      failures: state.failures,
    };
  }
  if (now - state.windowStart > LOGIN_WINDOW_MS) {
    loginBackoffs.delete(ip);
    return { allowed: true, retryAfterSec: 0, failures: 0 };
  }
  return { allowed: true, retryAfterSec: 0, failures: state.failures };
}

export function recordAdminLoginFailure(ip: string): {
  blocked: boolean;
  retryAfterSec: number;
  failures: number;
} {
  const now = Date.now();
  let state = loginBackoffs.get(ip);
  if (!state || now - state.windowStart > LOGIN_WINDOW_MS) {
    state = { failures: 1, windowStart: now, blockedUntil: 0 };
    loginBackoffs.set(ip, state);
    return { blocked: false, retryAfterSec: 0, failures: 1 };
  }

  state.failures += 1;
  if (state.failures > LOGIN_MAX_FAILURES) {
    // Backoff exponencial: 15 min * 2^(exceso), tope 2 horas
    const exponent = Math.min(3, state.failures - LOGIN_MAX_FAILURES - 1);
    const lockMs = LOGIN_WINDOW_MS * Math.pow(2, exponent);
    state.blockedUntil = now + lockMs;
    return {
      blocked: true,
      retryAfterSec: Math.ceil(lockMs / 1000),
      failures: state.failures,
    };
  }

  return { blocked: false, retryAfterSec: 0, failures: state.failures };
}

export function clearAdminLoginFailures(ip: string): void {
  loginBackoffs.delete(ip);
}
