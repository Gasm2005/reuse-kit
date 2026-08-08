// Single source of truth for values the `leads` table's CHECK constraints
// accept, plus the client-side field validators.
//
// WHY THIS EXISTS: the commission form silently failed for every visitor
// because the UI sent a display label ("₹2,500–5,000") into
// leads.budget_range, whose CHECK constraint only allows the codes below —
// every insert died with Postgres 23514 and no lead was ever saved. Keeping the
// allowed values here (and asserting them in lead-validation.test.ts) makes
// that class of mismatch a test failure instead of a silent production outage.
//
// KEEP IN SYNC with supabase/migrations/*: if a CHECK constraint changes, change
// these arrays in the same commit.

/** leads_budget_range_check */
export const BUDGET_RANGES = [
  "under-1000",
  "1000-5000",
  "5000-10000",
  "10000-25000",
  "25000+",
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

/** leads_source_check */
export const LEAD_SOURCES = [
  "website-form",
  "whatsapp",
  "instagram",
  "facebook",
  "google",
  "direct",
  "referral",
] as const;

/** leads_status_check */
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "negotiating",
  "confirmed",
  "in-production",
  "delivered",
  "closed-won",
  "closed-lost",
] as const;

/** Budget choices for the UI: value MUST be a DB-allowed code; label is display only. */
export const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "under-1000", label: "Under ₹1,000" },
  { value: "1000-5000", label: "₹1,000 – 5,000" },
  { value: "5000-10000", label: "₹5,000 – 10,000" },
  { value: "10000-25000", label: "₹10,000 – 25,000" },
  { value: "25000+", label: "₹25,000+" },
];

export function isAllowedBudgetRange(value: string): boolean {
  return (BUDGET_RANGES as readonly string[]).includes(value);
}

/**
 * India-first phone validation: a plain 10-digit mobile, OR an international
 * number the customer enters with a leading "+" and country code.
 * Returns null when valid, else a customer-facing message.
 */
export function validatePhone(phone: string): string | null {
  const raw = (phone || "").trim();
  if (!raw) return "Please enter your phone number.";
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15
      ? null
      : "Enter a valid international number, including your country code.";
  }
  return digits.length === 10
    ? null
    : "Enter a 10-digit mobile number — or start with “+” and your country code for international.";
}

/** Email is optional; when present it must look like an address. */
export function validateEmail(email?: string): string | null {
  const v = (email || "").trim();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    ? null
    : "Enter a valid email address (e.g. name@example.com).";
}

/**
 * Mirrors the server-side guard in submitContactLead + the DB constraints.
 * Returns null when the payload is safe to insert, else the reason.
 */
export function validateLeadPayload(p: {
  name: string;
  phone: string;
  email?: string;
  budgetRange?: string;
}): string | null {
  if (!p.name?.trim()) return "Please enter your name.";
  const phoneErr = validatePhone(p.phone);
  if (phoneErr) return phoneErr;
  const emailErr = validateEmail(p.email);
  if (emailErr) return emailErr;
  if (p.budgetRange && !isAllowedBudgetRange(p.budgetRange)) {
    return `Budget "${p.budgetRange}" is not an allowed value.`;
  }
  return null;
}
