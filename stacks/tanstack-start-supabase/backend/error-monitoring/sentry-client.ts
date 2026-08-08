import { scrubEvent } from "./sentry-scrub";

// Client-side Sentry. Fully no-op unless VITE_SENTRY_DSN is set. The heavy
// @sentry/react SDK is DYNAMICALLY imported inside the functions (never at
// module top-level) so this module is safe to import from server-reachable
// files (routes, __root) without pulling browser-only code into the SSR bundle.
// The DSN is a public value (safe in the client bundle); the secret
// SENTRY_AUTH_TOKEN is build-time only (source maps) and never shipped.

let initialized = false;

function dsn(): string | undefined {
  return (import.meta.env.VITE_SENTRY_DSN as string | undefined) || undefined;
}

export function initSentryClient(): void {
  if (initialized || typeof window === "undefined" || !dsn()) return;
  initialized = true;
  void import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: dsn(),
      environment: import.meta.env.MODE,
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0) || 0,
      sendDefaultPii: false, // never attach IP / user by default
      beforeSend: scrubEvent,
    });

    // Task 0A safety net: if the reveal bootstrap had to force content visible
    // (hydration/observer failure), surface it instead of failing silently.
    window.setTimeout(() => {
      if ((window as unknown as { __artspireRevealFailed?: boolean }).__artspireRevealFailed) {
        Sentry.captureMessage("[reveal] safety net fired — content was force-revealed", "warning");
      }
    }, 2500);
  });
}

/** Report a handled error (used by forms, e.g. Task 0D). No-op if unconfigured. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !dsn()) {
    console.error(error, context);
    return;
  }
  void import("@sentry/react").then((Sentry) =>
    Sentry.captureException(error, context ? { extra: context } : undefined),
  );
}
