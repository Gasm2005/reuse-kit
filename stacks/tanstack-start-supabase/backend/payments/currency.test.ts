import { describe, it, expect } from "vitest";
import { toSubunits, formatMoney, CURRENCIES, ACTIVE_CURRENCY, DEFAULT_CURRENCY } from "./currency";

describe("currency config", () => {
  it("defaults to INR when no env override is set", () => {
    // No VITE_ACTIVE_CURRENCY in the test env → should fall back.
    expect(ACTIVE_CURRENCY).toBe(DEFAULT_CURRENCY);
    expect(DEFAULT_CURRENCY).toBe("INR");
  });

  it("converts major units to minor units for 2-decimal currencies", () => {
    expect(toSubunits(4999, "INR")).toBe(499900); // rupees → paise
    expect(toSubunits(10, "USD")).toBe(1000); // dollars → cents
    expect(toSubunits(19.99, "USD")).toBe(1999);
  });

  it("handles Kuwaiti dinar's 3 minor digits (fils)", () => {
    expect(CURRENCIES.KWD.subunits).toBe(1000);
    expect(toSubunits(5, "KWD")).toBe(5000);
  });

  it("rounds to avoid floating-point paise errors", () => {
    // 1.1 * 100 = 110.00000000000001 in JS — must round to 110.
    expect(toSubunits(1.1, "INR")).toBe(110);
  });

  it("formats INR without decimals and with the rupee symbol", () => {
    const out = formatMoney(4999, "INR");
    expect(out).toContain("4,999");
    expect(out).toMatch(/₹|INR/);
  });

  it("exposes all six target-market currencies plus INR", () => {
    expect(Object.keys(CURRENCIES).sort()).toEqual(
      ["AED", "GBP", "INR", "KWD", "QAR", "SAR", "USD"].sort(),
    );
  });
});
