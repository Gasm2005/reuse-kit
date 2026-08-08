import { supabase } from "@/integrations/supabase/client";

// Uploads a customer's commission reference photos to the PRIVATE
// `reference-images` bucket (anon INSERT is allowed by that bucket's existing
// RLS; anon cannot read, list, or delete — see the 0C policy review). Files
// are compressed client-side first. We return the storage PATHS (never public
// URLs — the bucket is private); the admin Lead Center signs them fresh.
//
// Each submission gets an unguessable UUID folder prefix. This isn't an RLS
// requirement (anon can't read the bucket) but it's a free extra layer given
// the blanket "anyone can upload" INSERT policy.

const BUCKET = "reference-images";
export const MAX_PHOTOS = 5;
export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB per original file
export const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40MB total per submission
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type PhotoUploadProgress = {
  index: number;
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

export function validatePhotos(files: File[]): string | null {
  if (files.length > MAX_PHOTOS) return `Please attach at most ${MAX_PHOTOS} photos.`;
  let total = 0;
  for (const f of files) {
    if (!f.type.startsWith("image/") && !ACCEPTED.includes(f.type)) {
      return `"${f.name}" is not an image.`;
    }
    if (f.size > MAX_FILE_BYTES) {
      return `"${f.name}" is larger than 15MB. Please use a smaller photo.`;
    }
    total += f.size;
  }
  if (total > MAX_TOTAL_BYTES) return "Those photos add up to more than 40MB in total.";
  return null;
}

/** True when a storage upload failed only because the object is already there. */
export function isAlreadyExists(error: unknown): boolean {
  const e = error as { statusCode?: string | number; status?: number; message?: string } | null;
  if (!e) return false;
  if (String(e.statusCode) === "409" || e.status === 409) return true;
  return /already exists|duplicate/i.test(e.message ?? "");
}

async function compress(file: File): Promise<File> {
  try {
    const { default: imageCompression } = await import("browser-image-compression");
    const out = await imageCompression(file, {
      maxWidthOrHeight: 1800,
      maxSizeMB: 0.6,
      initialQuality: 0.8,
      useWebWorker: true,
      fileType: "image/webp",
    });
    return new File([out], "photo.webp", { type: "image/webp" });
  } catch {
    return file; // fall back to the original if compression fails
  }
}

/**
 * Uploads photos to a STABLE folder (tied to the form's instance id) and
 * returns an index→path map of the ones that succeeded. `skipIndices` are
 * photos already uploaded on a previous attempt, so a retry after a partial
 * failure never re-uploads what already landed. Never throws for a single
 * failed file — the caller merges results and decides what to do.
 */
export async function uploadCommissionPhotos(
  files: File[],
  folder: string,
  skipIndices: Set<number>,
  onProgress?: (p: PhotoUploadProgress) => void,
): Promise<{ paths: Record<number, string>; failed: number }> {
  const paths: Record<number, string> = {};
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    if (skipIndices.has(i)) continue; // already uploaded on a previous attempt
    const file = files[i];
    onProgress?.({ index: i, name: file.name, status: "uploading" });
    try {
      const compressed = await compress(file);
      const path = `${folder}/${i}.webp`;
      // upsert:false — anon has INSERT but no UPDATE policy on this bucket, so
      // upsert (which needs UPDATE) is denied. Not needed anyway: paths are
      // unique (uuid folder + index) and retries skip already-uploaded files,
      // so a re-uploaded file never pre-exists.
      const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
        upsert: false,
        contentType: "image/webp",
      });
      // "Already exists" is SUCCESS, not failure. The path is inside this form
      // instance's own UUID folder, so an object there was written by us — it
      // means a previous attempt's upload actually landed but its response was
      // lost. Without this, such a photo could never be attached (retrying it
      // would 409 forever) even though the bytes are safely in storage.
      if (error && !isAlreadyExists(error)) throw error;
      paths[i] = path;
      onProgress?.({ index: i, name: file.name, status: "done" });
    } catch (err) {
      failed++;
      onProgress?.({
        index: i,
        name: file.name,
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  return { paths, failed };
}
