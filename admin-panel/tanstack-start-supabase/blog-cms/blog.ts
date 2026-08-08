import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BlogPostsInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  author: string | null;
  category: string | null;
  status: BlogStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  reading_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export type BlogPostInput = Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>;

// ─── PUBLIC ───────────────────────────────────────────────────
export async function getPublishedPosts(limit = 50): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) return null;
  return (data as BlogPost) ?? null;
}

// ─── ADMIN ────────────────────────────────────────────────────
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return (data as BlogPost) ?? null;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const payload = {
    ...input,
    published_at:
      input.status === "published" ? (input.published_at ?? new Date().toISOString()) : null,
  };
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(payload as BlogPostsInsert)
    .select()
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function updatePost(id: string, input: BlogPostInput): Promise<BlogPost> {
  const payload: BlogPostInput & { updated_at: string } = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  if (input.status === "published" && !input.published_at)
    payload.published_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}
