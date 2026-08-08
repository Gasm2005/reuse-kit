import { useState, useEffect, useCallback } from "react";
import {
  getMediaItems,
  getMediaItem,
  getMediaUsage,
  uploadMediaFile,
  updateMediaItem,
  softDeleteMediaItem,
  hardDeleteMediaItem,
  logMediaUsage,
  removeMediaUsage,
  getMediaUsageCount,
  type MediaItem,
  type MediaUsage,
  MEDIA_FOLDERS,
} from "@/lib/media-library";

export function useMediaLibrary(opts?: { folder?: string; tag?: string; search?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMediaItems(opts);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [opts?.folder, opts?.tag, opts?.search]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(
    async (
      file: File,
      meta?: { folder?: string; altText?: string; title?: string; tags?: string[] },
    ) => {
      const result = await uploadMediaFile(file, meta);
      await load();
      return result;
    },
    [load],
  );

  const update = useCallback(async (id: string, values: Partial<MediaItem>) => {
    const updated = await updateMediaItem(id, values);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string, hard = false) => {
    if (hard) {
      await hardDeleteMediaItem(id);
    } else {
      await softDeleteMediaItem(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    items,
    loading,
    error,
    refresh: load,
    upload,
    update,
    remove,
    folders: MEDIA_FOLDERS,
  };
}

export function useMediaItem(id: string) {
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMediaItem(id);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, loading, error };
}

export function useMediaUsage(mediaId: string) {
  const [usages, setUsages] = useState<MediaUsage[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [usageData, usageCount] = await Promise.all([
          getMediaUsage(mediaId),
          getMediaUsageCount(mediaId),
        ]);
        if (!cancelled) {
          setUsages(usageData);
          setCount(usageCount);
        }
      } catch (err) {
        console.error("useMediaUsage error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  const link = useCallback(
    async (entityType: string, entityId: string, usageType: string) => {
      await logMediaUsage(mediaId, entityType, entityId, usageType);
      const [usageData, usageCount] = await Promise.all([
        getMediaUsage(mediaId),
        getMediaUsageCount(mediaId),
      ]);
      setUsages(usageData);
      setCount(usageCount);
    },
    [mediaId],
  );

  const unlink = useCallback(
    async (entityType: string, entityId: string) => {
      await removeMediaUsage(mediaId, entityType, entityId);
      const [usageData, usageCount] = await Promise.all([
        getMediaUsage(mediaId),
        getMediaUsageCount(mediaId),
      ]);
      setUsages(usageData);
      setCount(usageCount);
    },
    [mediaId],
  );

  return { usages, count, loading, link, unlink };
}
