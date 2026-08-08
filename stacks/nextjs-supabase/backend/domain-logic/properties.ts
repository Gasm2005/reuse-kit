import { createPublicClient } from "./supabase/public";
import type { Property, PropertyImage } from "./types";
import { SAMPLE_PROPERTIES } from "./sample-data";

// ---------------------------------------------------------------------------
// Development fallback.
//
// Every property section on the site renders nothing when the table is empty,
// which makes the design impossible to judge before the database is seeded.
// With NEXT_PUBLIC_USE_SAMPLE_DATA=1 in .env.local, reads fall back to the
// same 25 rows as the seed file.
//
// Two guards, because sample listings appearing on a live estate agency site
// would be far worse than a blank page: the flag has to be set explicitly,
// AND the build has to be a non-production one. Vercel builds with
// NODE_ENV=production, so this cannot reach the deployed site.
// ---------------------------------------------------------------------------
const useSample =
  process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === "1" &&
  process.env.NODE_ENV !== "production";

let warned = false;
function sample<T>(rows: T): T {
  if (!warned) {
    warned = true;
    console.warn(
      "\n  ⚠  Serving SAMPLE property data (NEXT_PUBLIC_USE_SAMPLE_DATA=1).\n" +
        "     Remove the flag from .env.local once Supabase is seeded.\n"
    );
  }
  return rows;
}

const byNewest = (a: Property, b: Property) =>
  b.created_at.localeCompare(a.created_at);

export async function getProperties(limit?: number): Promise<Property[]> {
  if (useSample) {
    const rows = [...SAMPLE_PROPERTIES].sort(byNewest);
    return sample(limit ? rows.slice(0, limit) : rows);
  }

  const supabase = createPublicClient();
  let query = supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data } = await query.returns<Property[]>();
  return data ?? [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (useSample) {
    return sample(SAMPLE_PROPERTIES.find((p) => p.id === id) ?? null);
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single<Property>();

  return data ?? null;
}

/**
 * Room-tagged photos for one property, in the order they were uploaded.
 * Sample data has no property_images rows, so it's synthesised from the
 * flat images array with no room label — the gallery still works, it just
 * has nothing to group by.
 */
export async function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  if (useSample) {
    const p = SAMPLE_PROPERTIES.find((row) => row.id === propertyId);
    const urls = p?.images?.length ? p.images : p?.image_url ? [p.image_url] : [];
    return sample(
      urls.map((url, i) => ({
        id: `${propertyId}-${i}`,
        property_id: propertyId,
        url,
        room: null,
        caption: null,
        sort_order: i,
      }))
    );
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .returns<PropertyImage[]>();

  return data ?? [];
}

export async function getRelatedProperties(
  location: string,
  excludeId: string,
  limit = 3
): Promise<Property[]> {
  if (useSample) {
    return sample(
      SAMPLE_PROPERTIES.filter(
        (p) => p.location === location && p.id !== excludeId
      ).slice(0, limit)
    );
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("location", location)
    .neq("id", excludeId)
    .limit(limit)
    .returns<Property[]>();

  return data ?? [];
}

/**
 * Localities with a count and a cover photo taken from one of the properties
 * in that area, so the browse-by-area tiles have something to show.
 */
export async function getLocalities(): Promise<
  { name: string; count: number; image: string | null; total: number }[]
> {
  let rows: { location: string; images: string[] | null; image_url: string | null }[];

  if (useSample) {
    rows = sample(
      SAMPLE_PROPERTIES.map(({ location, images, image_url }) => ({
        location,
        images,
        image_url,
      }))
    );
  } else {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("properties")
      .select("location, images, image_url")
      .returns<
        { location: string; images: string[] | null; image_url: string | null }[]
      >();
    rows = data ?? [];
  }

  const byArea = new Map<string, { count: number; image: string | null }>();
  for (const r of rows) {
    const name = r.location?.trim();
    if (!name) continue;
    const entry = byArea.get(name) ?? { count: 0, image: null };
    entry.count += 1;
    entry.image ??= r.images?.[0] ?? r.image_url ?? null;
    byArea.set(name, entry);
  }

  const total = rows.length;
  return [...byArea.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .map(([name, v]) => ({ name, count: v.count, image: v.image, total }));
}

/** Minimal shape for building static params — id plus what the slug needs. */
export async function getPropertySlugSeeds(): Promise<
  { id: string; title: string; location: string }[]
> {
  if (useSample) {
    return SAMPLE_PROPERTIES.map(({ id, title, location }) => ({
      id,
      title,
      location,
    }));
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("id, title, location")
    .limit(200);

  return (data ?? []) as { id: string; title: string; location: string }[];
}
