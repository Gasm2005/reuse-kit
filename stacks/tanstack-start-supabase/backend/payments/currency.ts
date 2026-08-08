// ─── CURRENCY CONFIG (single source of truth) ──────────────────
// Audit finding: currency was hardcoded to "INR" inside
// razorpay.server.ts, so the store could physically never charge in
// any other currency. This module centralises currency so the code is
// ready to support multiple currencies once the two *business*
// prerequisites are met:
//
//   1. Razorpay International must be activated on the merchant account
//      (Razorpay Dashboard → Settings → International). Until then,
//      non-INR orders will be rejected by Razorpay regardless of what
//      this code sends.
//   2. Products need per-currency prices (or a trusted FX conversion
//      step). Today `products.price` is a single INR number — do NOT
//      naively multiply by an FX rate at checkout, that produces
//      mispriced orders. Add price columns / a pricing table first.
//
// Until both are done, keep ACTIVE_CURRENCY = "INR". Changing the env
// var alone will NOT make international checkout correct — it only
// unblocks the code path.

export type CurrencyCode = "INR" | "USD" | "GBP" | "AED" | "SAR" | "QAR" | "KWD";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  /** BCP-47 locale used for Intl number formatting. */
  locale: string;
  /** Minor units per major unit (paise, cents, fils). Razorpay wants amounts in the minor unit. */
  subunits: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  INR: { code: "INR", symbol: "₹", locale: "en-IN", subunits: 100 },
  USD: { code: "USD", symbol: "$", locale: "en-US", subunits: 100 },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", subunits: 100 },
  AED: { code: "AED", symbol: "د.إ", locale: "ar-AE", subunits: 100 },
  SAR: { code: "SAR", symbol: "﷼", locale: "ar-SA", subunits: 100 },
  QAR: { code: "QAR", symbol: "﷼", locale: "ar-QA", subunits: 100 },
  KWD: { code: "KWD", symbol: "د.ك", locale: "ar-KW", subunits: 1000 }, // Kuwaiti dinar has 3 minor digits
};

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

function readActiveCurrency(): CurrencyCode {
  // Readable on both client (VITE_ prefix) and server. Falls back to INR.
  const raw =
    (typeof import.meta !== "undefined" &&
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env
        ?.VITE_ACTIVE_CURRENCY) ||
    (typeof process !== "undefined" ? process.env?.VITE_ACTIVE_CURRENCY : undefined);

  const code = (raw ?? "").toUpperCase();
  if (code in CURRENCIES) return code as CurrencyCode;
  return DEFAULT_CURRENCY;
}

export const ACTIVE_CURRENCY: CurrencyCode = readActiveCurrency();

/** Convert a major-unit amount (e.g. rupees) to the minor unit Razorpay expects (paise). */
export function toSubunits(amount: number, code: CurrencyCode = ACTIVE_CURRENCY): number {
  return Math.round(amount * CURRENCIES[code].subunits);
}

/** Format a major-unit amount for display, e.g. formatMoney(4999) → "₹4,999". */
export function formatMoney(amount: number, code: CurrencyCode = ACTIVE_CURRENCY): string {
  const meta = CURRENCIES[code];
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: meta.code,
      maximumFractionDigits: meta.subunits === 1000 ? 3 : 0,
    }).format(amount);
  } catch {
    return `${meta.symbol}${amount.toLocaleString(meta.locale)}`;
  }
}
