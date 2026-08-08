import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];
export type FAQInsert = Database["public"]["Tables"]["faqs"]["Insert"];
export type FAQUpdate = Database["public"]["Tables"]["faqs"]["Update"];
export type FAQEntityType = Database["public"]["Enums"]["faq_entity_type"];

export async function getFAQs(entityType?: FAQEntityType, entityId?: string) {
  let query = supabase.from("faqs").select("*").order("display_order", { ascending: true });

  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FAQ[];
}

export async function getGlobalFAQs() {
  return getFAQs("global", undefined);
}

export async function getArtworkFAQs(artworkId: string) {
  return getFAQs("artwork", artworkId);
}

export async function getCategoryFAQs(categoryId: string) {
  return getFAQs("category", categoryId);
}

export async function getFAQById(id: string) {
  const { data, error } = await supabase.from("faqs").select("*").eq("id", id).single();

  if (error) throw error;
  return data as FAQ | null;
}

export async function createFAQ(values: FAQInsert): Promise<FAQ> {
  const { data, error } = await supabase.from("faqs").insert(values).select().single();

  if (error) throw error;
  return data as FAQ;
}

export async function updateFAQ(id: string, values: FAQUpdate): Promise<FAQ> {
  const { data, error } = await supabase.from("faqs").update(values).eq("id", id).select().single();

  if (error) throw error;
  return data as FAQ;
}

export async function deleteFAQ(id: string): Promise<void> {
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) throw error;
}

export async function reorderFAQs(orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("faqs")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);

    if (error) throw error;
  }
}
