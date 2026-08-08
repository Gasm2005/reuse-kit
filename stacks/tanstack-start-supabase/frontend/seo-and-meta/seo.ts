import { supabase } from "@/integrations/supabase/client";
import { SITE_URL } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

export type SEOMetadata = Database["public"]["Tables"]["seo_metadata"]["Row"];
export type SEOMetadataInsert = Database["public"]["Tables"]["seo_metadata"]["Insert"];
export type SEOMetadataUpdate = Database["public"]["Tables"]["seo_metadata"]["Update"];
export type SEOEntityType = Database["public"]["Enums"]["seo_entity_type"];

export async function getSEOMetadata(entityType: SEOEntityType, entityId: string) {
  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .single();

  if (error) throw error;
  return data as SEOMetadata | null;
}

export async function getAllSEOMetadata(entityType: SEOEntityType) {
  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", entityType);

  if (error) throw error;
  return (data ?? []) as SEOMetadata[];
}

export async function upsertSEOMetadata(values: SEOMetadataInsert): Promise<SEOMetadata> {
  const { data, error } = await supabase
    .from("seo_metadata")
    .upsert(values, { onConflict: "entity_type,entity_id" })
    .select()
    .single();

  if (error) throw error;
  return data as SEOMetadata;
}

export async function updateSEOMetadata(
  id: string,
  values: SEOMetadataUpdate,
): Promise<SEOMetadata> {
  const { data, error } = await supabase
    .from("seo_metadata")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SEOMetadata;
}

export async function deleteSEOMetadata(id: string): Promise<void> {
  const { error } = await supabase.from("seo_metadata").delete().eq("id", id);

  if (error) throw error;
}

// ─── Structured Data Helpers ────────────────────────────────

export function buildArtworkStructuredData(artwork: {
  title: string;
  summary: string;
  image_url: string;
  price: number;
  created_at: string;
  slug: string;
  status: string;
  currency?: string;
  category?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    description: artwork.summary,
    image: artwork.image_url,
    url: `${getSiteUrl()}/artwork/${artwork.slug}`,
    dateCreated: artwork.created_at,
    artform: artwork.category || "Mixed Media",
    offers:
      artwork.price > 0 && artwork.status === "published"
        ? {
            "@type": "Offer",
            price: artwork.price.toString(),
            priceCurrency: artwork.currency || "INR",
            availability: "https://schema.org/InStock",
            url: `${getSiteUrl()}/artwork/${artwork.slug}`,
          }
        : undefined,
  };
}

export function buildOrganizationStructuredData(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Artspire",
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo.png`,
    sameAs: ["https://facebook.com/artspire", "https://instagram.com/artspire"],
  };
}

export function buildBreadcrumbStructuredData(
  items: { name: string; item: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

// Single source of truth (src/lib/site.ts → VITE_SITE_URL). This previously
// returned window.location.origin on the client and fell back to the RETIRED
// .in domain on the server — so client-rendered schema.org/canonical
// data pointed at vercel.app or localhost instead of the real domain, and the
// two environments disagreed. Never derive the canonical host from the browser.
function getSiteUrl(): string {
  return SITE_URL;
}
