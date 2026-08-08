import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { initSentryServer, captureServerErrorAndFlush } from "./lib/sentry.server";

// No-op unless VITE_SENTRY_DSN is set.
initSentryServer();

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const swallowed = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(swallowed);
  await captureServerErrorAndFlush(swallowed);
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Canonical-host redirect, OFF by default. Once theartspire.com is live in
// Vercel, set VITE_ENFORCE_CANONICAL_HOST=true and every request arriving on
// another host (artspire-v2.vercel.app, a preview URL, a bare .in) gets a 301 to
// the same path on the canonical host — so duplicate content collapses onto one
// domain. Left disabled until DNS resolves, otherwise the site would 301 to a
// domain that doesn't answer yet.
function canonicalHostRedirect(request: Request): Response | null {
  if (process.env.VITE_ENFORCE_CANONICAL_HOST !== "true") return null;
  const siteUrl = process.env.VITE_SITE_URL;
  if (!siteUrl) return null;
  try {
    const canonical = new URL(siteUrl);
    const incoming = new URL(request.url);
    // Never redirect localhost — that would break local production previews.
    if (incoming.hostname === "localhost" || incoming.hostname === "127.0.0.1") return null;
    if (incoming.host === canonical.host) return null;
    const target = new URL(incoming.pathname + incoming.search, canonical.origin);
    return new Response(null, { status: 301, headers: { location: target.toString() } });
  } catch {
    return null; // a malformed env value must never break the request path
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const hostRedirect = canonicalHostRedirect(request);
    if (hostRedirect) return hostRedirect;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      await captureServerErrorAndFlush(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
