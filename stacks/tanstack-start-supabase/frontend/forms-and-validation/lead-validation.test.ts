import { describe, it, expect } from "vitest";
import {
  BUDGET_OPTIONS,
  BUDGET_RANGES,
  isAllowedBudgetRange,
  validateEmail,
  validateLeadPayload,
  validatePhone,
} from "./lead-validation";
import { isAlreadyExists } from "./commission-photos";

// Regression guard for the class of bug that silently broke every commission
// enquiry: the UI sent a value the leads CHECK constraint rejected, so every
// insert failed with Postgres 23514 and nothing was saved. These assertions
// fail mechanically — no browser, no network — if that ever recurs.

describe("lead budget_range matches the DB CHECK constraint", () => {
  // Mirror of leads_budget_range_check as it exists in Postgres. If the DB
  // constraint changes, update BOTH this literal and BUDGET_RANGES.
  const DB_ALLOWED = ["under-1000", "1000-5000", "5000-10000", "10000-25000", "25000+"];

  it("declares exactly the codes the database allows", () => {
    expect([...BUDGET_RANGES]).toEqual(DB_ALLOWED);
  });

  it("every UI budget option submits a DB-allowed code, not a display label", () => {
    expect(BUDGET_OPTIONS.length).toBeGreaterThan(0);
    for (const opt of BUDGET_OPTIONS) {
      expect(DB_ALLOWED).toContain(opt.value);
      // The label is for humans; it must never be what we submit.
      expect(DB_ALLOWED).not.toContain(opt.label);
    }
  });

  it("rejects the display label that caused the original outage", () => {
    expect(isAllowedBudgetRange("₹2,500–5,000")).toBe(false);
    expect(
      validateLeadPayload({ name: "A", phone: "9876500011", budgetRange: "₹2,500–5,000" }),
    ).toMatch(/not an allowed value/);
  });
});

describe("photo retry: an already-uploaded path must not fail the retry", () => {
  // VERIFIED against real Supabase storage with the anon key: re-uploading to an
  // existing path with upsert:false returns EXACTLY this. Note status is 400
  // while statusCode is "409" — a predicate that only checked `status === 409`
  // would wrongly treat this as a failure and the photo (already safely in
  // storage) could never be attached to the lead.
  const REAL_SUPABASE_DUPLICATE_ERROR = {
    name: "StorageApiError",
    message: "The resource already exists",
    status: 400,
    statusCode: "409",
  };

  it("recognises the real 'already exists' error Supabase returns", () => {
    expect(isAlreadyExists(REAL_SUPABASE_DUPLICATE_ERROR)).toBe(true);
  });

  it("still recognises it if only the message or only status 409 is present", () => {
    expect(isAlreadyExists({ message: "The resource already exists" })).toBe(true);
    expect(isAlreadyExists({ status: 409 })).toBe(true);
    expect(isAlreadyExists({ statusCode: "409" })).toBe(true);
  });

  it("does NOT swallow genuine upload failures", () => {
    expect(isAlreadyExists(null)).toBe(false);
    expect(isAlreadyExists({ message: "new row violates row-level security policy" })).toBe(false);
    expect(isAlreadyExists({ message: "Payload too large", status: 413 })).toBe(false);
    expect(isAlreadyExists({ message: "Bad Request", status: 400 })).toBe(false);
  });
});

describe("phone validation", () => {
  it("accepts a 10-digit Indian mobile", () => {
    expect(validatePhone("9876500011")).toBeNull();
    expect(validatePhone("98765 00011")).toBeNull();
  });

  it("rejects 11-12 digit numbers entered without a + country code", () => {
    expect(validatePhone("98765000112")).not.toBeNull();
    expect(validatePhone("987650001123")).not.toBeNull();
  });

  it("rejects the 11-digit typo that locked a paid order out of its own page", () => {
    // Real incident: this exact value reached orders.phone via checkout, which
    // validated presence but not format. The order-lookup gate compares against
    // the stored number, so ART-20260730-0008 became permanently unopenable —
    // the correct number (7408690994) can never match it, and the typo is not
    // something anyone knows to type. Checkout now runs this validator.
    expect(validatePhone("74086909947")).not.toBeNull();
    expect(validatePhone("7408690994")).toBeNull();
  });

  it("rejects too-short numbers and empty input", () => {
    expect(validatePhone("98765")).not.toBeNull();
    expect(validatePhone("")).not.toBeNull();
  });

  it("accepts international numbers with a + country code", () => {
    expect(validatePhone("+1 415 555 0100")).toBeNull();
    expect(validatePhone("+971 50 123 4567")).toBeNull();
    expect(validatePhone("+44 20 7946 0958")).toBeNull();
  });
});

describe("email validation", () => {
  it("treats a blank email as valid (optional field)", () => {
    expect(validateEmail("")).toBeNull();
    expect(validateEmail(undefined)).toBeNull();
  });

  it("rejects an address with no @ or no domain", () => {
    expect(validateEmail("notanemail")).not.toBeNull();
    expect(validateEmail("missing@domain")).not.toBeNull();
    expect(validateEmail("@nolocal.com")).not.toBeNull();
  });

  it("accepts a well-formed address", () => {
    expect(validateEmail("himangi@theartspire.com")).toBeNull();
  });
});

describe("validateLeadPayload mirrors the server guard", () => {
  it("requires name and phone", () => {
    expect(validateLeadPayload({ name: "", phone: "9876500011" })).toMatch(/name/i);
    expect(validateLeadPayload({ name: "A", phone: "" })).toMatch(/phone/i);
  });

  it("passes a realistic commission submission", () => {
    expect(
      validateLeadPayload({
        name: "Test User",
        phone: "9876500011",
        email: "test@example.com",
        budgetRange: "5000-10000",
      }),
    ).toBeNull();
  });

  it("passes with no optional fields at all", () => {
    expect(validateLeadPayload({ name: "Test User", phone: "9876500011" })).toBeNull();
  });
});
