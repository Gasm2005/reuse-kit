import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { propertySlug } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const supabase = createPublicClient();
    const { data: properties } = await supabase
      .from("properties")
      .select("id, title, location, created_at");

    const rows = (properties ?? []) as {
      id: string;
      title: string;
      location: string;
      created_at: string;
    }[];

    // Category pages are real, indexable URLs — worth listing separately
    // from the properties themselves.
    const typePages: MetadataRoute.Sitemap = [
      "Flat",
      "Villa",
      "Plot",
      "Rent",
      "Interior",
    ].map((t) => ({
      url: `${SITE_URL}/listings?type=${encodeURIComponent(t)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const propertyPages: MetadataRoute.Sitemap = rows.map((p) => ({
      url: `${SITE_URL}/property/${propertySlug(p)}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [...staticPages, ...typePages, ...propertyPages];
  } catch {
    return staticPages;
  }
}
