// ─── SHIPPING: THE SINGLE SOURCE OF TRUTH ──────────────────────
// Task 6. Previously `SHIPPING_COST = 150` was hardcoded in THREE places
// (cart.tsx, checkout.tsx, razorpay.server.ts) — three chances to disagree with
// each other, on the number the customer is actually charged. Everything now
// imports from here, so the cart, the checkout page, and the server-side
// Razorpay amount re-verification always compute the identical figure.
//
// Rates follow standard Indian courier practice: charge on the GREATER of the
// parcel's actual weight and its volumetric weight.
//
//   volumetric_weight_kg = (L_cm × B_cm × H_cm) / 5000
//   chargeable_weight    = max(actual_weight, volumetric_weight)
//
// [PLACEHOLDER — every rate below must be replaced with the real Shiprocket
//  rate card in Phase 2. They are deliberately conservative round numbers, not
//  quotes.] Courier-API integration (live rates per pincode) is Phase 2; this
// module is the foundation it will plug into.

/** Divisor used to convert cm³ to volumetric kg. Indian courier standard. */
export const VOLUMETRIC_DIVISOR = 5000;

/**
 * Weight slabs, cheapest first. `upToKg: null` is the final open-ended slab,
 * which charges `baseInr` plus `perExtraKgInr` for every kg (rounded up) above
 * `fromKg`. One constant so rates are trivial to change.
 * [PLACEHOLDER — replace with Shiprocket rate card in Phase 2.]
 */
export const SHIPPING_SLABS: Array<{
  label: string;
  upToKg: number | null;
  fromKg?: number;
  baseInr: number;
  perExtraKgInr?: number;
}> = [
  { label: "Up to 0.5 kg", upToKg: 0.5, baseInr: 90 },
  { label: "Up to 1 kg", upToKg: 1, baseInr: 150 },
  { label: "Up to 2 kg", upToKg: 2, baseInr: 230 },
  { label: "Up to 5 kg", upToKg: 5, baseInr: 380 },
  { label: "Above 5 kg", upToKg: null, fromKg: 5, baseInr: 380, perExtraKgInr: 70 },
];

/**
 * Fallback weight when a product has no weight data at all. Deliberately NOT
 * zero — a missing field must never silently produce ₹0 shipping.
 * [PLACEHOLDER — set from real parcel data in Phase 2.]
 */
export const DEFAULT_ITEM_WEIGHT_GRAMS = 1000;

/**
 * Surcharge hook for fragile pieces (clay, cement, mirror, glass need heavier
 * protective packing). Returns 0 until real rates are known, so it changes
 * nothing today but the call site already exists.
 * [PLACEHOLDER — set real fragile surcharge in Phase 2.]
 */
export function fragileSurchargeInr(_items: ShippableItem[]): number {
  return 0;
}

/** The shipping-relevant shape of a product. All fields optional/nullable. */
export type ShippableItem = {
  quantity: number;
  weightGrams?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  /** Free-text legacy fields, parsed only when the numeric ones are missing. */
  weightText?: string | null;
  dimensionsText?: string | null;
  isFragile?: boolean | null;
};

/** "1000 Gm", "800 g", "1.2 kg" → grams. Returns null when unparseable. */
export function parseWeightTextToGrams(text?: string | null): number | null {
  if (!text) return null;
  const m = text.match(/([\d.]+)\s*(kg|kgs|g|gm|gms|gram|grams)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = (m[2] ?? "g").toLowerCase();
  return unit.startsWith("k") ? Math.round(n * 1000) : Math.round(n);
}

/** "600*100*20" or "20 x 15 x 20 cm" → {lengthMm,widthMm,heightMm} in mm. */
export function parseDimensionsTextToMm(
  text?: string | null,
): { lengthMm: number; widthMm: number; heightMm: number } | null {
  if (!text) return null;
  const nums = text.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return null;
  const [l, w, h] = nums.slice(0, 3).map(Number);
  if (![l, w, h].every((v) => Number.isFinite(v) && v > 0)) return null;
  // Bare numbers in this catalogue are millimetres ("600*100*20"). If the text
  // explicitly says cm/inch, convert.
  const isCm = /cm/i.test(text);
  const isInch = /in\b|inch|"/i.test(text);
  const factor = isInch ? 25.4 : isCm ? 10 : 1;
  return {
    lengthMm: Math.round(l * factor),
    widthMm: Math.round(w * factor),
    heightMm: Math.round(h * factor),
  };
}

/** Chargeable weight in kg for one line item (already multiplied by quantity). */
function lineChargeableKg(item: ShippableItem): number {
  const qty = Math.max(1, item.quantity || 1);

  const grams =
    item.weightGrams ?? parseWeightTextToGrams(item.weightText) ?? DEFAULT_ITEM_WEIGHT_GRAMS;
  const actualKg = (grams / 1000) * qty;

  const dims =
    item.lengthMm && item.widthMm && item.heightMm
      ? { lengthMm: item.lengthMm, widthMm: item.widthMm, heightMm: item.heightMm }
      : parseDimensionsTextToMm(item.dimensionsText);

  let volumetricKg = 0;
  if (dims) {
    const cm3 = (dims.lengthMm / 10) * (dims.widthMm / 10) * (dims.heightMm / 10);
    volumetricKg = (cm3 / VOLUMETRIC_DIVISOR) * qty;
  }

  return Math.max(actualKg, volumetricKg);
}

/** Total chargeable weight (kg) for a cart. */
export function chargeableWeightKg(items: ShippableItem[]): number {
  const total = items.reduce((sum, i) => sum + lineChargeableKg(i), 0);
  // Never zero: an empty/dataless cart still falls back to one default item.
  return total > 0 ? total : DEFAULT_ITEM_WEIGHT_GRAMS / 1000;
}

/** Rate for a given chargeable weight, from the slab table. */
export function rateForWeightKg(kg: number): number {
  for (const slab of SHIPPING_SLABS) {
    if (slab.upToKg !== null && kg <= slab.upToKg) return slab.baseInr;
  }
  const last = SHIPPING_SLABS[SHIPPING_SLABS.length - 1];
  const from = last.fromKg ?? 5;
  const extraKg = Math.max(0, Math.ceil(kg - from));
  return last.baseInr + extraKg * (last.perExtraKgInr ?? 0);
}

/**
 * THE function. Computes shipping for a cart. Deterministic and dependency-free
 * so the client and the server (razorpay.server.ts) always agree.
 */
export function calculateShippingInr(items: ShippableItem[]): number {
  if (!items.length) return 0;
  const kg = chargeableWeightKg(items);
  return rateForWeightKg(kg) + fragileSurchargeInr(items);
}

/** Shown in the cart before we know where the parcel is going. */
export const SHIPPING_TBD_LABEL = "Calculated at checkout";

/**
 * Maps a cart line (or an order line joined to its product) to a ShippableItem.
 * Used by the cart, the checkout page, and the server, so all three feed the
 * calculator identically shaped data.
 */
export function toShippableItem(
  quantity: number,
  product?: {
    weight_grams?: number | null;
    length_mm?: number | null;
    width_mm?: number | null;
    height_mm?: number | null;
    weight?: string | null;
    dimensions?: string | null;
    is_fragile?: boolean | null;
  } | null,
): ShippableItem {
  return {
    quantity,
    weightGrams: product?.weight_grams ?? null,
    lengthMm: product?.length_mm ?? null,
    widthMm: product?.width_mm ?? null,
    heightMm: product?.height_mm ?? null,
    weightText: product?.weight ?? null,
    dimensionsText: product?.dimensions ?? null,
    isFragile: product?.is_fragile ?? null,
  };
}
