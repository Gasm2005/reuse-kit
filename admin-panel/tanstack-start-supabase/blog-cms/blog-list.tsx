import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllPosts, deletePost, updatePost, type BlogPost } from "@/lib/blog";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/blog/")({
  component: AdminBlogList,
});

function AdminBlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setPosts(await getAllPosts());
    } catch (e) {
      console.error(e);
      toast.error("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function togglePublish(p: BlogPost) {
    try {
      await updatePost(p.id, { status: p.status === "published" ? "draft" : "published" });
      toast.success(p.status === "published" ? "Moved to draft." : "Published.");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update.");
    }
  }

  async function remove(p: BlogPost) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      await deletePost(p.id);
      toast.success("Post deleted.");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
            Journal
          </h1>
          <p className="font-body text-[13px] text-stone mt-0.5">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 h-[42px] px-5 bg-forest text-white font-body font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-forest/90 transition-colors"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      {loading ? (
        <p className="font-body text-[13px] text-stone">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <h2 className="font-display text-[18px] text-forest font-medium mb-2">No posts yet</h2>
          <p className="font-body text-[13px] text-stone mb-5">
            Write your first journal entry to start building SEO traffic.
          </p>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 h-[42px] px-5 bg-forest text-white font-body font-bold text-[12px] uppercase tracking-wider rounded-xl"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/60 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="font-body text-[14px] font-semibold text-forest truncate">
                  {p.title}
                </div>
                <div className="font-body text-[11px] text-stone/60 truncate">
                  /{p.slug}
                  {p.category ? ` · ${p.category}` : ""}
                </div>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-md font-body text-[11px] font-medium ${p.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
              >
                {p.status}
              </span>
              <button
                onClick={() => togglePublish(p)}
                title={p.status === "published" ? "Unpublish" : "Publish"}
                className="shrink-0 text-stone hover:text-forest"
              >
                {p.status === "published" ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              <Link
                to="/admin/blog/edit/$id"
                params={{ id: p.id }}
                className="shrink-0 text-stone hover:text-forest"
              >
                <Pencil size={16} />
              </Link>
              <button onClick={() => remove(p)} className="shrink-0 text-stone hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
