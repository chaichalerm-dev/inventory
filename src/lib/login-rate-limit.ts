import "server-only";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Attempt = { count: number; firstAttemptAt: number };

// In-memory per-process store: fine for this app's single-instance deployment
// (see next.config.ts `output: "standalone"` / single Dockerfile container).
// A horizontally-scaled deployment would need a shared store (e.g. Redis)
// instead, since each instance would otherwise track attempts independently.
const attempts = new Map<string, Attempt>();

function keyFor(email: string): string {
  return email.trim().toLowerCase();
}

export class LoginRateLimitError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super("Too many login attempts");
    this.name = "LoginRateLimitError";
  }
}

/**
 * Throws when the email has hit MAX_ATTEMPTS failed logins within the
 * window. Called before the DB lookup/bcrypt compare so a locked-out email
 * gets rejected without spending a bcrypt verify — the count is keyed by the
 * submitted email regardless of whether that email exists, so lockout
 * timing reveals nothing about account existence.
 */
export function assertNotRateLimited(email: string): void {
  const key = keyFor(email);
  const entry = attempts.get(key);
  if (!entry) return;

  const elapsed = Date.now() - entry.firstAttemptAt;
  if (elapsed >= WINDOW_MS) {
    attempts.delete(key);
    return;
  }
  if (entry.count >= MAX_ATTEMPTS) {
    throw new LoginRateLimitError(WINDOW_MS - elapsed);
  }
}

export function recordFailedLogin(email: string): void {
  const key = keyFor(email);
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAttemptAt >= WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(email: string): void {
  attempts.delete(keyFor(email));
}
