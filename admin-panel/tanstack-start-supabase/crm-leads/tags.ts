import { supabase } from "@/integrations/supabase/client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** Fetch all available tags for the tag picker */
export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Tag[];
}
