import type { ErrorEvent, EventHint } from "@sentry/core";

// Strips customer PII from every Sentry event before it leaves the app.
// Requirement (Task 4): no email, phone, or shipping address in error payloads.
// We drop the user object outright, redact email/phone patterns from all free
// text, and redact any object key that looks like PII.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// +91 98765 43210, 9876543210, 98765-43210, etc. (8+ digits with separators)
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/g;
const PII_KEY_RE =
  /(email|phone|whatsapp|mobile|contact|address|line1|line2|postal|pincode|zip|shipping|customer_?name|full_?name|recipient)/i;

function redact(s: string): string {
  return s.replace(EMAIL_RE, "[email]").replace(PHONE_RE, "[phone]");
}

function scrubDeep(value: unknown, depth = 0): unknown {
  if (value == null || depth > 6) return value;
  if (typeof value === "string") return redact(value);
  if (Array.isArray(value)) return value.map((v) => scrubDeep(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PII_KEY_RE.test(k) ? "[redacted]" : scrubDeep(v, depth + 1);
    }
    return out;
  }
  return value;
}

export function scrubEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent {
  // Never send who the user is.
  delete event.user;

  if (typeof event.message === "string") event.message = redact(event.message);

  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    if (event.request.data) event.request.data = scrubDeep(event.request.data);
    if (event.request.query_string) {
      event.request.query_string = redact(String(event.request.query_string)) as never;
    }
  }

  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redact(ex.value);
  }

  if (event.extra) event.extra = scrubDeep(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubDeep(event.contexts) as typeof event.contexts;

  for (const b of event.breadcrumbs ?? []) {
    if (b.message) b.message = redact(b.message);
    if (b.data) b.data = scrubDeep(b.data) as Record<string, unknown>;
  }

  return event;
}
