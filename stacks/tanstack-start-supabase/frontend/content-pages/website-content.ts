import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

type WebsiteContentDbInsert = Database["public"]["Tables"]["website_content"]["Insert"];
type WebsiteContentDbUpdate = Database["public"]["Tables"]["website_content"]["Update"];

export type WebsiteContent = {
  id: string;
  content_key: string;
  page: string;
  section: string;
  field_name: string;
  value_text: string | null;
  value_html: string | null;
  value_json: Record<string, unknown> | null;
  value_media_id: string | null;
  field_type:
    | "text"
    | "textarea"
    | "html"
    | "image"
    | "multi_image"
    | "repeater"
    | "select"
    | "toggle";
  description: string | null;
  placeholder: string | null;
  is_required: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type WebsiteContentInsert = Omit<
  Partial<WebsiteContent>,
  "id" | "created_at" | "updated_at"
>;
export type WebsiteContentUpdate = Partial<WebsiteContent>;
export type ContentFieldType = WebsiteContent["field_type"];

export type RepeaterItem = {
  id: string;
  parent_key: string;
  display_order: number | null;
  item_data: Record<string, unknown>;
  created_at: string | null;
};

// ─── READ ───────────────────────────────────────────────────

export async function getWebsiteContent(opts?: {
  page?: string;
  section?: string;
  fieldType?: ContentFieldType;
  activeOnly?: boolean;
}) {
  let query = supabase
    .from("website_content")
    .select("*")
    .order("section", { ascending: true })
    .order("field_name", { ascending: true });

  if (opts?.page) {
    query = query.eq("page", opts.page);
  }
  if (opts?.section) {
    query = query.eq("section", opts.section);
  }
  if (opts?.fieldType) {
    query = query.eq("field_type", opts.fieldType);
  }
  if (opts?.activeOnly !== false) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as WebsiteContent[];
}

export async function getWebsiteContentByKey(contentKey: string) {
  const { data, error } = await supabase
    .from("website_content")
    .select("*")
    .eq("content_key", contentKey)
    .single();

  if (error) throw error;
  return data as WebsiteContent | null;
}

export async function getWebsiteContentByPage(page: string): Promise<WebsiteContent[]> {
  return getWebsiteContent({ page, activeOnly: true });
}

export async function getWebsiteContentValue(contentKey: string): Promise<string | null> {
  const item = await getWebsiteContentByKey(contentKey);
  if (!item) return null;
  return item.value_text ?? item.value_html ?? null;
}

export async function getWebsiteContentAsRepeater(parentKey: string): Promise<RepeaterItem[]> {
  const { data, error } = await supabase
    .from("website_content_repeater_items")
    .select("*")
    .eq("parent_key", parentKey)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as RepeaterItem[];
}

export async function getWebsiteContentWithRepeater(contentKey: string): Promise<{
  content: WebsiteContent | null;
  repeaterItems: RepeaterItem[];
}> {
  const content = await getWebsiteContentByKey(contentKey);
  if (!content || content.field_type !== "repeater") {
    return { content, repeaterItems: [] };
  }
  const repeaterItems = await getWebsiteContentAsRepeater(contentKey);
  return { content, repeaterItems };
}

// ─── CREATE ─────────────────────────────────────────────────

export async function createWebsiteContent(values: WebsiteContentInsert): Promise<WebsiteContent> {
  const { data, error } = await supabase
    .from("website_content")
    .insert(values as WebsiteContentDbInsert)
    .select()
    .single();

  if (error) throw error;
  return data as WebsiteContent;
}

export async function createRepeaterItem(values: {
  parentKey: string;
  displayOrder?: number;
  itemData: Record<string, unknown>;
}): Promise<RepeaterItem> {
  const { data, error } = await supabase
    .from("website_content_repeater_items")
    .insert({
      parent_key: values.parentKey,
      display_order: values.displayOrder ?? 0,
      item_data: values.itemData as Json,
    })
    .select()
    .single();

  if (error) throw error;
  return data as RepeaterItem;
}

// ─── UPDATE ─────────────────────────────────────────────────

export async function updateWebsiteContent(
  id: string,
  values: WebsiteContentUpdate,
): Promise<WebsiteContent> {
  const { data, error } = await supabase
    .from("website_content")
    .update({ ...values, updated_at: new Date().toISOString() } as WebsiteContentDbUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as WebsiteContent;
}

export async function upsertWebsiteContent(
  contentKey: string,
  values: Omit<WebsiteContentInsert, "content_key">,
): Promise<WebsiteContent> {
  const { data, error } = await supabase
    .from("website_content")
    .upsert({ content_key: contentKey, ...values } as WebsiteContentDbInsert, {
      onConflict: "content_key",
    })
    .select()
    .single();

  if (error) throw error;
  return data as WebsiteContent;
}

export async function updateRepeaterItem(
  id: string,
  values: { displayOrder?: number; itemData?: Record<string, unknown> },
): Promise<RepeaterItem> {
  const { data, error } = await supabase
    .from("website_content_repeater_items")
    .update({
      display_order: values.displayOrder,
      item_data: values.itemData as Json,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as RepeaterItem;
}

// ─── DELETE ─────────────────────────────────────────────────

export async function deleteWebsiteContent(id: string): Promise<void> {
  const { error } = await supabase.from("website_content").delete().eq("id", id);

  if (error) throw error;
}

export async function deleteRepeaterItem(id: string): Promise<void> {
  const { error } = await supabase.from("website_content_repeater_items").delete().eq("id", id);

  if (error) throw error;
}

export async function deleteRepeaterItemsByParent(parentKey: string): Promise<void> {
  const { error } = await supabase
    .from("website_content_repeater_items")
    .delete()
    .eq("parent_key", parentKey);

  if (error) throw error;
}

// ─── REORDER ────────────────────────────────────────────────

export async function reorderRepeaterItems(orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("website_content_repeater_items")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);

    if (error) throw error;
  }
}

// ─── CONTENT KEY HELPER ─────────────────────────────────────

export function buildContentKey(page: string, section: string, field: string): string {
  return `${page}.${section}.${field}`;
}

// ─── FIELD TYPE HELPERS ─────────────────────────────────────

export const CONTENT_FIELD_TYPES: { value: ContentFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "html", label: "HTML" },
  { value: "image", label: "Image" },
  { value: "multi_image", label: "Multiple Images" },
  { value: "repeater", label: "Repeater" },
  { value: "select", label: "Select" },
  { value: "toggle", label: "Toggle" },
];

export function getFieldTypeLabel(type: ContentFieldType): string {
  return CONTENT_FIELD_TYPES.find((t) => t.value === type)?.label ?? type;
}

// ─── PAGES ────────────────────────────────────────────────────

export const WEBSITE_PAGES = [
  { slug: "homepage", name: "Homepage", route: "/" },
  { slug: "about", name: "About Us", route: "/about" },
  { slug: "contact", name: "Contact", route: "/contact" },
  { slug: "footer", name: "Footer", route: "" },
  { slug: "global", name: "Global", route: "" },
] as const;

export type WebsitePage = (typeof WEBSITE_PAGES)[number]["slug"];

// ─── PRESET SECTIONS ────────────────────────────────────────

export const HOMEPAGE_SECTIONS = [
  { slug: "hero", name: "Hero Section" },
  { slug: "trust_strip", name: "Trust Strip" },
  { slug: "services", name: "Services" },
  { slug: "before_after", name: "Before & After" },
  { slug: "how_it_works", name: "How It Works" },
  { slug: "categories", name: "Category Grid" },
  { slug: "recent_work", name: "Recent Work" },
  { slug: "testimonials", name: "Testimonials" },
  { slug: "gifts", name: "Gift Section" },
  { slug: "about", name: "About Artist" },
];

export const ABOUT_SECTIONS = [
  { slug: "hero", name: "Hero" },
  { slug: "story", name: "Story" },
  { slug: "mission", name: "Mission" },
  { slug: "vision", name: "Vision" },
  { slug: "team", name: "Team" },
];

export const CONTACT_SECTIONS = [
  { slug: "info", name: "Contact Info" },
  { slug: "hours", name: "Business Hours" },
  { slug: "social", name: "Social Links" },
];

export const FOOTER_SECTIONS = [
  { slug: "brand", name: "Brand" },
  { slug: "quick_links", name: "Quick Links" },
  { slug: "services", name: "Services" },
  { slug: "contact", name: "Contact Info" },
  { slug: "copyright", name: "Copyright" },
];

// ─── SEO helper for route loaders ───────────────────────────
export async function getPageSEO(
  pageKey: string,
): Promise<{ title: string | null; description: string | null; ogImage: string | null }> {
  const keys = [`seo.${pageKey}.title`, `seo.${pageKey}.description`, `seo.${pageKey}.og_image`];
  const { data } = await supabase
    .from("website_content")
    .select("content_key, value_text")
    .in("content_key", keys);

  const get = (key: string) => data?.find((d) => d.content_key === key)?.value_text ?? null;
  return {
    title: get(`seo.${pageKey}.title`),
    description: get(`seo.${pageKey}.description`),
    ogImage: get(`seo.${pageKey}.og_image`),
  };
}
