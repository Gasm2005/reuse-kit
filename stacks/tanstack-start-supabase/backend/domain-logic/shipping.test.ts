import { describe, it, expect } from "vitest";
import {
  SHIPPING_SLABS,
  DEFAULT_ITEM_WEIGHT_GRAMS,
  VOLUMETRIC_DIVISOR,
  calculateShippingInr,
  chargeableWeightKg,
  parseDimensionsTextToMm,
  parseWeightTextToGrams,
  rateForWeightKg,
  toShippableItem,
} from "./shipping";

// Shipping is money the customer is charged, and the cart, the checkout page and
// the server-side Razorpay amount re-verification all call these functions. If
// they ever disagree the customer is charged the wrong amount, so the maths is
// pinned here rather than trusted.

describe("weight text parsing (legacy free-text fields)", () => {
  it("parses the formats already in the catalogue", () => {
    expect(parseWeightTextToGrams("1000 Gm")).toBe(1000);
    expect(parseWeightTextToGrams("800 GM")).toBe(800);
    expect(parseWeightTextToGrams("800g")).toBe(800);
    expect(parseWeightTextToGrams("1.2 kg")).toBe(1200);
    expect(parseWeightTextToGrams("2KG")).toBe(2000);
  });

  it("returns null rather than 0 for junk, so the caller falls back to a default", () => {
    expect(parseWeightTextToGrams("")).toBeNull();
    expect(parseWeightTextToGrams(null)).toBeNull();
    expect(parseWeightTextToGrams("light")).toBeNull();
    expect(parseWeightTextToGrams("0 g")).toBeNull();
  });
});

describe("dimension text parsing", () => {
  it("treats bare numbers as millimetres (the catalogue's format)", () => {
    expect(parseDimensionsTextToMm("600*100*20")).toEqual({
      lengthMm: 600,
      widthMm: 100,
      heightMm: 20,
    });
  });

  it("scales when the text says cm or inches", () => {
    expect(parseDimensionsTextToMm("20 x 15 x 15 cm")).toEqual({
      lengthMm: 200,
      widthMm: 150,
      heightMm: 150,
    });
    expect(parseDimensionsTextToMm("10 x 10 x 10 inch")).toEqual({
      lengthMm: 254,
      widthMm: 254,
      heightMm: 254,
    });
  });

  it("returns null when fewer than three numbers are present", () => {
    expect(parseDimensionsTextToMm("A4")).toBeNull();
    expect(parseDimensionsTextToMm("20 x 15")).toBeNull();
    expect(parseDimensionsTextToMm(null)).toBeNull();
  });
});

describe("chargeable weight = max(actual, volumetric)", () => {
  it("uses actual weight when the parcel is dense", () => {
    // 2kg in a small box: volumetric = 10*10*10/5000 = 0.2kg → actual wins
    const kg = chargeableWeightKg([
      { quantity: 1, weightGrams: 2000, lengthMm: 100, widthMm: 100, heightMm: 100 },
    ]);
    expect(kg).toBeCloseTo(2, 5);
  });

  it("uses volumetric weight when the parcel is bulky and light", () => {
    // 300g but 40x30x30cm: volumetric = 40*30*30/5000 = 7.2kg → volumetric wins
    const kg = chargeableWeightKg([
      { quantity: 1, weightGrams: 300, lengthMm: 400, widthMm: 300, heightMm: 300 },
    ]);
    expect(kg).toBeCloseTo(7.2, 5);
    expect((40 * 30 * 30) / VOLUMETRIC_DIVISOR).toBeCloseTo(7.2, 5);
  });

  it("multiplies by quantity", () => {
    const one = chargeableWeightKg([{ quantity: 1, weightGrams: 1000 }]);
    const three = chargeableWeightKg([{ quantity: 3, weightGrams: 1000 }]);
    expect(three).toBeCloseTo(one * 3, 5);
  });

  it("falls back to the default weight when a product has NO data (never 0)", () => {
    const kg = chargeableWeightKg([{ quantity: 1 }]);
    expect(kg).toBeCloseTo(DEFAULT_ITEM_WEIGHT_GRAMS / 1000, 5);
    expect(kg).toBeGreaterThan(0);
  });

  it("reads the legacy text fields when numeric columns are missing", () => {
    const kg = chargeableWeightKg([
      { quantity: 1, weightText: "1.5 kg", dimensionsText: "100*100*100" },
    ]);
    expect(kg).toBeCloseTo(1.5, 5); // 10x10x10cm volumetric = 0.2kg, so actual wins
  });
});

describe("slab rates", () => {
  it("charges the correct slab at each boundary", () => {
    expect(rateForWeightKg(0.4)).toBe(SHIPPING_SLABS[0].baseInr);
    expect(rateForWeightKg(0.5)).toBe(SHIPPING_SLABS[0].baseInr); // inclusive
    expect(rateForWeightKg(0.6)).toBe(SHIPPING_SLABS[1].baseInr);
    expect(rateForWeightKg(1)).toBe(SHIPPING_SLABS[1].baseInr);
    expect(rateForWeightKg(1.8)).toBe(SHIPPING_SLABS[2].baseInr);
    expect(rateForWeightKg(4.9)).toBe(SHIPPING_SLABS[3].baseInr);
    expect(rateForWeightKg(5)).toBe(SHIPPING_SLABS[3].baseInr);
  });

  it("adds a per-kg increment above the top slab", () => {
    const last = SHIPPING_SLABS[SHIPPING_SLABS.length - 1];
    const perKg = last.perExtraKgInr ?? 0;
    expect(rateForWeightKg(6)).toBe(last.baseInr + perKg);
    expect(rateForWeightKg(8)).toBe(last.baseInr + 3 * perKg);
  });

  it("rises monotonically with weight — heavier is never cheaper", () => {
    let prev = 0;
    for (const kg of [0.2, 0.5, 0.9, 1.5, 3, 5, 6, 10, 25]) {
      const rate = rateForWeightKg(kg);
      expect(rate).toBeGreaterThanOrEqual(prev);
      prev = rate;
    }
  });
});

describe("calculateShippingInr — the figure the customer pays", () => {
  it("is 0 for an empty cart", () => {
    expect(calculateShippingInr([])).toBe(0);
  });

  it("is never 0 for a cart with items, even with no weight data", () => {
    expect(calculateShippingInr([{ quantity: 1 }])).toBeGreaterThan(0);
  });

  it("is deterministic — repeated calls agree (client and server must match)", () => {
    const items = [
      { quantity: 2, weightGrams: 800, lengthMm: 200, widthMm: 150, heightMm: 150 },
      { quantity: 1, weightText: "1 kg" },
    ];
    const a = calculateShippingInr(items);
    const b = calculateShippingInr(items);
    expect(a).toBe(b);
    expect(Number.isFinite(a)).toBe(true);
  });

  it("produces the same result from a product row as from explicit fields", () => {
    const fromRow = calculateShippingInr([
      toShippableItem(1, {
        weight_grams: 800,
        length_mm: 200,
        width_mm: 150,
        height_mm: 150,
        weight: "800 GM",
        dimensions: "200*150*150",
      }),
    ]);
    const fromFields = calculateShippingInr([
      { quantity: 1, weightGrams: 800, lengthMm: 200, widthMm: 150, heightMm: 150 },
    ]);
    expect(fromRow).toBe(fromFields);
  });

  it("prefers the numeric columns over the legacy text when both exist", () => {
    const numeric = calculateShippingInr([
      toShippableItem(1, { weight_grams: 300, weight: "9 kg" }),
    ]);
    const textOnly = calculateShippingInr([toShippableItem(1, { weight: "9 kg" })]);
    expect(numeric).toBeLessThan(textOnly);
  });

  it("charges the real lamp (1000 Gm, 600*100*20) a sane, non-zero amount", () => {
    // volumetric = 60*10*2/5000 = 0.24kg, actual = 1kg → 1kg slab
    const inr = calculateShippingInr([
      toShippableItem(1, { weight: "1000 Gm", dimensions: "600*100*20" }),
    ]);
    expect(inr).toBe(rateForWeightKg(1));
    expect(inr).toBeGreaterThan(0);
  });
});
