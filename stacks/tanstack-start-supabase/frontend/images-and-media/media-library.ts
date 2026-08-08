import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MediaLibraryInsert = Database["public"]["Tables"]["media_library"]["Insert"];
type MediaLibraryUpdate = Database["public"]["Tables"]["media_library"]["Update"];

export type MediaItem = {
  id: string;
  filename: string;
  original_name: string;
  storage_path: string;
  public_url: string;
  width: number | null;
  height: number | null;
  aspect_ratio: number | null;
  file_size: number | null;
  mime_type: string | null;
  variants: Record<string, unknown> | null;
  alt_text: string | null;
  title: string | null;
  description: string | null;
  caption: string | null;
  tags: string[] | null;
  folder: string | null;
  ai_generated_alt: string | null;
  ai_generated_tags: string[] | null;
  dominant_colors: Record<string, unknown> | null;
  usage_count: number | null;
  used_in: Record<string, unknown>[] | null;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type MediaItemInsert = Omit<
  Partial<MediaItem>,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;
export type MediaItemUpdate = Partial<MediaItem>;

export type MediaVariant = {
  id: string;
  media_id: string | null;
  variant_name: string;
  storage_path: string;
  url: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string | null;
};

export type MediaUsageLog = {
  id: string;
  media_id: string | null;
  entity_type: string;
  entity_id: string;
  usage_type: string;
  created_at: string | null;
};

export type MediaUsage = {
  entityType: string;
  entityId: string;
  entityName: string;
  entitySlug: string;
  usageType: string;
};

// ─── READ ───────────────────────────────────────────────────

export async function getMediaItems(opts?: {
  folder?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from("media_library")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (opts?.folder && opts.folder !== "all") {
    query = query.eq("folder", opts.folder);
  }
  if (opts?.tag) {
    query = query.contains("tags", [opts.tag]);
  }
  if (opts?.search) {
    query = query.ilike("original_name", `%${opts.search}%`);
  }

  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MediaItem[];
}

export async function getMediaItem(id: string) {
  const { data, error } = await supabase
    .from("media_library")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data as MediaItem | null;
}

export async function getMediaItemByPath(path: string) {
  const { data, error } = await supabase
    .from("media_library")
    .select("*")
    .eq("storage_path", path)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data as MediaItem | null;
}

export async function getMediaItemVariants(mediaId: string) {
  const { data, error } = await supabase
    .from("media_variants")
    .select("*")
    .eq("media_id", mediaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as MediaVariant[];
}

export async function getMediaUsage(mediaId: string): Promise<MediaUsage[]> {
  const { data, error } = await supabase
    .from("media_usage_log")
    .select("*")
    .eq("media_id", mediaId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const usages = (data ?? []) as MediaUsageLog[];
  const result: MediaUsage[] = [];

  for (const usage of usages) {
    let entityName = "";
    let entitySlug = "";

    // Look up the entity name based on type
    if (usage.entity_type === "artwork") {
      const { data: artwork } = await supabase
        .from("artworks")
        .select("title, slug")
        .eq("id", usage.entity_id)
        .single();
      entityName = artwork?.title ?? "Unknown Artwork";
      entitySlug = artwork?.slug ?? "";
    } else if (usage.entity_type === "category") {
      const { data: category } = await supabase
        .from("categories")
        .select("name, slug")
        .eq("id", usage.entity_id)
        .single();
      entityName = category?.name ?? "Unknown Category";
      entitySlug = category?.slug ?? "";
    } else if (usage.entity_type === "homepage") {
      entityName = "Homepage";
      entitySlug = "/";
    } else {
      entityName = usage.entity_type;
      entitySlug = "";
    }

    result.push({
      entityType: usage.entity_type,
      entityId: usage.entity_id,
      entityName,
      entitySlug,
      usageType: usage.usage_type,
    });
  }

  return result;
}

export async function getMediaUsageCount(mediaId: string): Promise<number> {
  const { count, error } = await supabase
    .from("media_usage_log")
    .select("*", { count: "exact", head: true })
    .eq("media_id", mediaId);

  if (error) throw error;
  return count ?? 0;
}

// ─── UPLOAD ─────────────────────────────────────────────────

export type UploadMediaResult = {
  mediaItem: MediaItem;
  publicUrl: string;
};

// Photo formats worth compressing. SVG/GIF (animated) are left untouched.
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Compresses + resizes a raster image to WebP in the browser before upload,
 * so admin-uploaded photos aren't served at 300–400KB+. Caps the longest edge
 * at 1600px (covers 2x retina for any display on the site) and targets
 * ~300KB. Falls back to the original file if compression isn't applicable or
 * fails, so an upload is never blocked.
 */
async function compressImageForUpload(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.includes(file.type)) return file;
  try {
    // Dynamic import keeps this browser-only lib out of the SSR bundle.
    const { default: imageCompression } = await import("browser-image-compression");
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1600,
      maxSizeMB: 0.35,
      initialQuality: 0.8,
      useWebWorker: true,
      fileType: "image/webp",
    });
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([compressed], `${base}.webp`, { type: "image/webp" });
  } catch (err) {
    console.warn("[media] image compression failed — uploading original:", err);
    return file;
  }
}

export async function uploadMediaFile(
  file: File,
  opts?: {
    folder?: string;
    altText?: string;
    title?: string;
    tags?: string[];
  },
): Promise<UploadMediaResult> {
  const folder = opts?.folder ?? "uncategorized";
  const originalName = file.name;
  // Optimize before upload (WebP + resized); no-op for non-raster or on failure.
  const upload = await compressImageForUpload(file);
  const timestamp = Date.now();
  const path = `${folder}/${timestamp}-${upload.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("media-library")
    .upload(path, upload, { upsert: false });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("media-library")
    .getPublicUrl(uploadData.path);

  const publicUrl = publicUrlData.publicUrl;

  // Create media_library record
  const insert: MediaItemInsert = {
    filename: upload.name,
    original_name: originalName,
    storage_path: uploadData.path,
    public_url: publicUrl,
    file_size: upload.size,
    mime_type: upload.type,
    alt_text: opts?.altText ?? null,
    title: opts?.title ?? null,
    tags: opts?.tags ?? null,
    folder,
  };

  const { data: mediaItem, error: dbError } = await supabase
    .from("media_library")
    .insert(insert as MediaLibraryInsert)
    .select()
    .single();

  if (dbError) throw dbError;

  return {
    mediaItem: mediaItem as MediaItem,
    publicUrl,
  };
}

// ─── UPDATE ─────────────────────────────────────────────────

export async function updateMediaItem(id: string, values: MediaItemUpdate): Promise<MediaItem> {
  const { data, error } = await supabase
    .from("media_library")
    .update({ ...values, updated_at: new Date().toISOString() } as MediaLibraryUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as MediaItem;
}

// ─── DELETE ─────────────────────────────────────────────────

export async function softDeleteMediaItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("media_library")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function hardDeleteMediaItem(id: string): Promise<void> {
  // Get the storage path first
  const { data: item } = await supabase
    .from("media_library")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (item?.storage_path) {
    // Delete from storage
    await supabase.storage.from("media-library").remove([item.storage_path]);
  }

  // Delete from DB
  const { error } = await supabase.from("media_library").delete().eq("id", id);

  if (error) throw error;
}

// ─── USAGE TRACKING ─────────────────────────────────────────

export async function logMediaUsage(
  mediaId: string,
  entityType: string,
  entityId: string,
  usageType: string,
): Promise<void> {
  const { error } = await supabase.from("media_usage_log").insert({
    media_id: mediaId,
    entity_type: entityType,
    entity_id: entityId,
    usage_type: usageType,
  });

  if (error) throw error;

  // Update usage_count
  await recalculateMediaUsageCount(mediaId);
}

export async function removeMediaUsage(
  mediaId: string,
  entityType: string,
  entityId: string,
): Promise<void> {
  const { error } = await supabase
    .from("media_usage_log")
    .delete()
    .eq("media_id", mediaId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) throw error;

  await recalculateMediaUsageCount(mediaId);
}

export async function recalculateMediaUsageCount(mediaId: string): Promise<void> {
  const { count, error } = await supabase
    .from("media_usage_log")
    .select("*", { count: "exact", head: true })
    .eq("media_id", mediaId);

  if (error) throw error;

  await supabase
    .from("media_library")
    .update({ usage_count: count ?? 0 })
    .eq("id", mediaId);
}

// ─── FOLDERS ──────────────────────────────────────────────────

export const MEDIA_FOLDERS = [
  "uncategorized",
  "homepage",
  "categories",
  "artworks",
  "testimonials",
  "about",
  "contact",
  "footer",
  "seo",
  "overlays",
  "banners",
  "icons",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

// ─── GET PUBLIC URL HELPER ──────────────────────────────────

export function getMediaUrl(path: string): string {
  const { data } = supabase.storage.from("media-library").getPublicUrl(path);
  return data.publicUrl;
}
