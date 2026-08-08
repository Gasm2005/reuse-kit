export type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  property_type: string;
  area: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  status: string;
  image_url: string | null;
  images: string[] | null;
  videos: string[] | null;
  description: string | null;
  // Rental terms. Null on sale listings, which is why they're all optional
  // rather than defaulted — an empty deposit field would read as "₹0".
  deposit: string | null;
  maintenance: string | null;
  furnishing: string | null;
  available_from: string | null;
  /** Generated in Postgres from `price` — never write to it. */
  price_numeric: number | null;
  /** Type-specific details; the shape per type lives in lib/property-schema. */
  attributes: Record<string, unknown> | null;
  created_at: string;
};

/** A photo with the room it belongs to, so a gallery can group by space. */
export type PropertyImage = {
  id: string;
  property_id: string;
  url: string;
  room: string | null;
  caption: string | null;
  sort_order: number;
};

export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Ready to Visit",
  "Visited",
  "Negotiating",
  "Won",
  "Lost",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_TAGS = [
  "Interested",
  "Not Interested",
  "May Buy Later",
  "Needs EMI",
] as const;
export type LeadTag = (typeof LEAD_TAGS)[number];

export type Lead = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  service: string | null;
  city: string | null;
  budget: string | null;
  timeline: string | null;
  notes: string | null;
  stage: LeadStage;
  tags: LeadTag[];
  source: string;
  assigned_to: string | null;
  created_at: string;
};

/** One entry in a lead's call/remark/conversation timeline. */
export type LeadActivity = {
  id: string;
  lead_id: string;
  actor_id: string | null;
  kind: "call" | "note" | "whatsapp" | "email" | "stage_change";
  content: string;
  created_at: string;
};

export type Visit = {
  id: string;
  property_id: string | null;
  property_title: string;
  name: string;
  mobile: string;
  preferred_date: string;
  preferred_slot: string;
  notes: string | null;
  status: string;
  created_at: string;
};
