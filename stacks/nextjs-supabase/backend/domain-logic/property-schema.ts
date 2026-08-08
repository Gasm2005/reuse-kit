// What each kind of listing actually needs shown.
//
// A plot buyer asks about facing, road width and approvals. A flat buyer asks
// about the floor, parking and how old the building is. A villa has a plot
// area and a built-up area, which are different numbers. An interior job has
// a scope and a duration, and no bedrooms at all.
//
// This is the single definition of that. The admin form renders inputs from
// it and the property page renders the filled ones back out, so the two can't
// drift apart, and adding a field is a one-line change here rather than a
// database migration.

export type FieldType = "text" | "number" | "select" | "boolean";

export type AttributeField = {
  key: string;
  label: string;
  type: FieldType;
  /** Shown under the input in the admin form. */
  hint?: string;
  options?: string[];
  /** Appended when displaying, e.g. "sq.ft". */
  suffix?: string;
};

const FACING = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const FLAT_FIELDS: AttributeField[] = [
  { key: "floor", label: "Floor", type: "text", hint: "e.g. 4 of 12" },
  { key: "carpet_area", label: "Carpet area", type: "text", suffix: "sq.ft" },
  { key: "facing", label: "Facing", type: "select", options: FACING },
  { key: "parking", label: "Parking", type: "text", hint: "e.g. 1 covered" },
  { key: "age", label: "Age of property", type: "text", hint: "e.g. New, 3 years" },
  { key: "balconies", label: "Balconies", type: "number" },
  { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully furnished"] },
  { key: "lift", label: "Lift", type: "boolean" },
  { key: "power_backup", label: "Power backup", type: "boolean" },
];

const VILLA_FIELDS: AttributeField[] = [
  { key: "plot_area", label: "Plot area", type: "text", suffix: "sq.ft" },
  { key: "built_up_area", label: "Built-up area", type: "text", suffix: "sq.ft" },
  { key: "floors", label: "Floors", type: "number" },
  { key: "facing", label: "Facing", type: "select", options: FACING },
  { key: "parking", label: "Car parking", type: "text", hint: "e.g. 2 covered" },
  { key: "garden", label: "Private garden", type: "boolean" },
  { key: "servant_quarter", label: "Servant quarter", type: "boolean" },
  { key: "gated", label: "Gated society", type: "boolean" },
];

const PLOT_FIELDS: AttributeField[] = [
  { key: "plot_area", label: "Plot area", type: "text", suffix: "sq.ft" },
  { key: "dimensions", label: "Dimensions", type: "text", hint: "e.g. 30 × 60 ft" },
  { key: "facing", label: "Facing", type: "select", options: FACING },
  { key: "road_width", label: "Road width", type: "text", hint: "e.g. 30 ft" },
  { key: "corner_plot", label: "Corner plot", type: "boolean" },
  { key: "boundary_wall", label: "Boundary wall", type: "boolean" },
  { key: "approval", label: "Approval", type: "text", hint: "e.g. LDA approved, UP RERA" },
  { key: "khasra", label: "Khasra / plot no.", type: "text" },
];

const RENT_FIELDS: AttributeField[] = [
  { key: "floor", label: "Floor", type: "text", hint: "e.g. 2 of 5" },
  { key: "carpet_area", label: "Carpet area", type: "text", suffix: "sq.ft" },
  { key: "facing", label: "Facing", type: "select", options: FACING },
  { key: "parking", label: "Parking", type: "text" },
  { key: "balconies", label: "Balconies", type: "number" },
  { key: "preferred_tenants", label: "Preferred tenants", type: "select", options: ["Family", "Bachelors", "Company lease", "Anyone"] },
  { key: "lift", label: "Lift", type: "boolean" },
  { key: "power_backup", label: "Power backup", type: "boolean" },
];

const INTERIOR_FIELDS: AttributeField[] = [
  { key: "scope", label: "Scope", type: "text", hint: "e.g. Full home, Kitchen only" },
  { key: "area_covered", label: "Area covered", type: "text", suffix: "sq.ft" },
  { key: "duration", label: "Typical duration", type: "text", hint: "e.g. 6–8 weeks" },
  { key: "rooms_covered", label: "Rooms covered", type: "text", hint: "e.g. 2 bedrooms, living, kitchen" },
  { key: "includes", label: "Quote includes", type: "text", hint: "e.g. design, materials, carpentry" },
  { key: "site_supervision", label: "Site supervision included", type: "boolean" },
];

export const ATTRIBUTE_FIELDS: Record<string, AttributeField[]> = {
  Flat: FLAT_FIELDS,
  Villa: VILLA_FIELDS,
  Plot: PLOT_FIELDS,
  Rent: RENT_FIELDS,
  Interior: INTERIOR_FIELDS,
};

export function fieldsFor(propertyType: string): AttributeField[] {
  return ATTRIBUTE_FIELDS[propertyType] ?? [];
}

/** Bedrooms and bathrooms make no sense on a plot or an interior quote. */
export function hasRooms(propertyType: string) {
  return propertyType !== "Plot" && propertyType !== "Interior";
}

/** Only a purchase can be financed — rent and interior work can't. */
export function isFinanceable(propertyType: string) {
  return propertyType === "Flat" || propertyType === "Villa" || propertyType === "Plot";
}

/** Turns a stored value into something displayable, or null to hide it. */
export function displayValue(
  field: AttributeField,
  raw: unknown
): string | null {
  if (raw === null || raw === undefined || raw === "") return null;

  if (field.type === "boolean") {
    // Only surface a "yes" — a grid full of "No" rows is noise.
    return raw === true || raw === "true" ? "Yes" : null;
  }

  const text = String(raw).trim();
  if (!text) return null;
  return field.suffix ? `${text} ${field.suffix}` : text;
}
