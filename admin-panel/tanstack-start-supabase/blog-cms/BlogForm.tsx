import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { createPost, updatePost, type BlogPost, type BlogStatus } from "@/lib/blog";
import { toast } from "@/lib/toast";

const input =
  "w-full h-[46px] px-4 rounded-xl border border-border bg-white font-body text-[14px] text-forest focus:outline-none focus:border-gold transition-colors";
const area =
  "w-full px-4 py-3 rounded-xl border border-border bg-white font-body text-[14px] text-forest focus:outline-none focus:border-gold transition-colors";
const label = "block font-body text-[11px] font-bold text-stone uppercase tracking-wider mb-1.5";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    category: post?.category ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    body: post?.body ?? "",
    status: (post?.status ?? "draft") as BlogStatus,
    meta_title: post?.meta_title ?? "",
    meta_description: post?.meta_description ?? "",
    og_image_url: post?.og_image_url ?? "",
    reading_minutes: post?.reading_minutes?.toString() ?? "",
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    if (!f.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const slug = f.slug.trim() || slugify(f.title);
    setSaving(true);
    try {
      const payload = {
        title: f.title.trim(),
        slug,
        excerpt: f.excerpt.trim() || null,
        category: f.category.trim() || null,
        cover_image_url: f.cover_image_url.trim() || null,
        body: f.body,
        status: f.status,
        meta_title: f.meta_title.trim() || null,
        meta_description: f.meta_description.trim() || null,
        og_image_url: f.og_image_url.trim() || null,
        reading_minutes: f.reading_minutes ? Number(f.reading_minutes) : null,
      };
      if (post) {
        await updatePost(post.id, payload);
        toast.success("Post updated.");
      } else {
        await createPost(payload);
        toast.success("Post created.");
      }
      router.navigate({ to: "/admin/blog" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save post.", "Check the slug is unique and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <div>
          <label className={label}>Title *</label>
          <input
            className={input}
            value={f.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!post && !f.slug) set("slug", slugify(e.target.value));
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Slug (URL)</label>
            <input
              className={input}
              value={f.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder="auto from title"
            />
          </div>
          <div>
            <label className={label}>Category</label>
            <input
              className={input}
              value={f.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Craft, Gift Guides…"
            />
          </div>
        </div>
        <div>
          <label className={label}>Excerpt (short summary)</label>
          <textarea
            className={area}
            rows={2}
            value={f.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Cover image URL</label>
            <input
              className={input}
              value={f.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Reading time (min)</label>
            <input
              className={input}
              type="number"
              value={f.reading_minutes}
              onChange={(e) => set("reading_minutes", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={label}>Body (HTML)</label>
          <textarea
            className={area}
            rows={14}
            value={f.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="<p>Write your article… use <h3>, <p>, <ul><li> tags.</p>"
            style={{ fontFamily: "monospace" }}
          />
          <p className="font-body text-[11px] text-stone/60 mt-1">
            Tip: use &lt;h3&gt; for section titles, &lt;p&gt; for paragraphs, &lt;ul&gt;&lt;li&gt;
            for lists.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <h3 className="font-display text-[15px] text-forest font-medium">SEO</h3>
        <div>
          <label className={label}>Meta title</label>
          <input
            className={input}
            value={f.meta_title}
            onChange={(e) => set("meta_title", e.target.value)}
            placeholder="Defaults to title"
          />
        </div>
        <div>
          <label className={label}>Meta description</label>
          <textarea
            className={area}
            rows={2}
            value={f.meta_description}
            onChange={(e) => set("meta_description", e.target.value)}
            placeholder="Defaults to excerpt"
          />
        </div>
        <div>
          <label className={label}>OG / social image URL</label>
          <input
            className={input}
            value={f.og_image_url}
            onChange={(e) => set("og_image_url", e.target.value)}
            placeholder="Defaults to cover image"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <label className={label + " mb-0"}>Status</label>
          <select
            className="h-[46px] px-4 rounded-xl border border-border bg-white font-body text-[14px] text-forest"
            value={f.status}
            onChange={(e) => set("status", e.target.value as BlogStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="h-[46px] px-8 bg-forest text-white font-body font-bold text-[13px] uppercase tracking-wider rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : post ? "Update Post" : "Create Post"}
        </button>
      </div>
    </div>
  );
}
