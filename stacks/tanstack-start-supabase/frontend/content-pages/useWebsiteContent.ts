import { useState, useEffect, useCallback } from "react";
import {
  getWebsiteContent,
  getWebsiteContentByKey,
  getWebsiteContentAsRepeater,
  updateWebsiteContent,
  upsertWebsiteContent,
  createRepeaterItem,
  updateRepeaterItem,
  deleteRepeaterItem,
  reorderRepeaterItems,
  type WebsiteContent,
  type RepeaterItem,
  WEBSITE_PAGES,
} from "@/lib/website-content";

export function useWebsiteContent(opts?: { page?: string; section?: string }) {
  const [items, setItems] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWebsiteContent({
        page: opts?.page,
        section: opts?.section,
        activeOnly: true,
      });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [opts?.page, opts?.section]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(async (id: string, values: Partial<WebsiteContent>) => {
    const updated = await updateWebsiteContent(id, values);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const upsert = useCallback(async (contentKey: string, values: Partial<WebsiteContent>) => {
    const upserted = await upsertWebsiteContent(contentKey, values);
    setItems((prev) => {
      const exists = prev.find((item) => item.content_key === contentKey);
      if (exists) {
        return prev.map((item) => (item.id === upserted.id ? upserted : item));
      }
      return [...prev, upserted];
    });
    return upserted;
  }, []);

  const getValue = useCallback(
    (contentKey: string): string | null => {
      const item = items.find((i) => i.content_key === contentKey);
      if (!item) return null;
      return item.value_text ?? item.value_html ?? null;
    },
    [items],
  );

  return {
    items,
    loading,
    error,
    refresh: load,
    update,
    upsert,
    getValue,
    pages: WEBSITE_PAGES,
  };
}

export function useWebsiteContentItem(contentKey: string) {
  const [item, setItem] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWebsiteContentByKey(contentKey);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [contentKey]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (values: Partial<WebsiteContent>) => {
      if (!item) return null;
      const updated = await updateWebsiteContent(item.id, values);
      setItem(updated);
      return updated;
    },
    [item],
  );

  return { item, loading, error, refresh: load, update };
}

export function useRepeaterItems(parentKey: string) {
  const [items, setItems] = useState<RepeaterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWebsiteContentAsRepeater(parentKey);
      setItems(data);
    } catch (err) {
      console.error("useRepeaterItems error:", err);
    } finally {
      setLoading(false);
    }
  }, [parentKey]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (itemData: Record<string, unknown>) => {
      const created = await createRepeaterItem({
        parentKey,
        displayOrder: items.length,
        itemData,
      });
      setItems((prev) => [...prev, created]);
      return created;
    },
    [parentKey, items.length],
  );

  const update = useCallback(
    async (id: string, values: { displayOrder?: number; itemData?: Record<string, unknown> }) => {
      const updated = await updateRepeaterItem(id, values);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await deleteRepeaterItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await reorderRepeaterItems(orderedIds);
      await load();
    },
    [load],
  );

  return { items, loading, refresh: load, add, update, remove, reorder };
}
