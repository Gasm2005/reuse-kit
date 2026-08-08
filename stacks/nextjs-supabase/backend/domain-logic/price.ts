// Prices are stored as free text ("₹42,00,000", "₹28,000 / month") because
// the column is a text field. Until that becomes a numeric column, this pulls
// a number out so budget filtering and sorting can work at all. It's a stopgap
// — anything typed in a format other than digits-and-separators won't parse,
// and those rows are treated as "unknown" rather than silently filtered out.
export function parsePrice(price: string): number | null {
  const digits = price.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Pulls a square-foot figure out of free text like "1,050 sq.ft" or "30 × 60 ft".
 * Dimensions are multiplied out; a plain number is taken as-is.
 */
export function parseArea(area: string | null | undefined): number | null {
  if (!area) return null;
  const text = area.toLowerCase().replace(/,/g, "");

  // "30 x 60", "30 × 60", "30*60" — a plot quoted by its sides.
  const dims = text.match(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/);
  if (dims) {
    const n = Number(dims[1]) * Number(dims[2]);
    return n > 0 ? n : null;
  }

  const single = text.match(/(\d+(?:\.\d+)?)/);
  if (!single) return null;
  const n = Number(single[1]);
  return n > 0 ? n : null;
}

/**
 * Rate per square foot — the number Indian buyers actually compare on.
 * Null when either side is missing or the maths would be nonsense.
 */
export function pricePerSqFt(
  priceValue: number | null | undefined,
  area: string | null | undefined
): number | null {
  const sqft = parseArea(area);
  if (!priceValue || !sqft) return null;
  const rate = priceValue / sqft;
  // A rate under ₹100/sq.ft means the area was misread, not a bargain.
  return rate >= 100 ? Math.round(rate) : null;
}

export const SALE_BUDGETS = [
  { label: "Any budget", max: null },
  { label: "Under ₹30 L", max: 3_000_000 },
  { label: "₹30 L – ₹50 L", max: 5_000_000, min: 3_000_000 },
  { label: "₹50 L – ₹1 Cr", max: 10_000_000, min: 5_000_000 },
  { label: "₹1 Cr – ₹2 Cr", max: 20_000_000, min: 10_000_000 },
  { label: "Above ₹2 Cr", max: null, min: 20_000_000 },
] as const;

export const RENT_BUDGETS = [
  { label: "Any budget", max: null },
  { label: "Under ₹15,000", max: 15_000 },
  { label: "₹15,000 – ₹30,000", max: 30_000, min: 15_000 },
  { label: "₹30,000 – ₹50,000", max: 50_000, min: 30_000 },
  { label: "Above ₹50,000", max: null, min: 50_000 },
] as const;

export function budgetMatches(
  price: string,
  min?: number | null,
  max?: number | null
) {
  if (min == null && max == null) return true;
  const value = parsePrice(price);
  if (value == null) return true; // unparseable price — don't hide it
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}
