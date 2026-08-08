import * as Sentry from "@sentry/node";
import { scrubEvent } from "./sentry-scrub";

// Server-side (Nitro/Vercel) Sentry. No-op unless the DSN is set. VITE_SITE
// vars are readable via process.env on the server, so we reuse VITE_SENTRY_DSN
// (falling back to a plain SENTRY_DSN if someone sets that instead).

let initialized = false;

function dsn(): string | undefined {
  return process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN || undefined;
}

export function initSentryServer(): void {
  if (initialized || !dsn()) return;
  initialized = true;
  Sentry.init({
    dsn: dsn(),
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}

/** Capture a server-side error. No-op if unconfigured. Never throws. */
export function captureServerError(error: unknown): void {
  if (!dsn()) return;
  try {
    initSentryServer();
    Sentry.captureException(error);
  } catch {
    // Sentry must never break the request path.
  }
}

/**
 * Capture AND flush. On Vercel the serverless function can freeze immediately
 * after responding, discarding Sentry's buffered events — so an error would be
 * "captured" and still never arrive. Awaiting a bounded flush makes delivery
 * actually happen. Never throws, and never waits longer than the timeout.
 */
export async function captureServerErrorAndFlush(error: unknown, timeoutMs = 2000): Promise<void> {
  if (!dsn()) return;
  try {
    initSentryServer();
    Sentry.captureException(error);
    await Sentry.flush(timeoutMs);
  } catch {
    // Delivery is best-effort; it must never break the request path.
  }
}
