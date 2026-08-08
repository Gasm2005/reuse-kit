import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPostById, type BlogPost } from "@/lib/blog";
import { BlogForm } from "@/components/admin/BlogForm";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/admin/blog/edit/$id")({
  component: EditPostPage,
});

function EditPostPage() {
  const { id } = Route.useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostById(id)
      .then((p) => {
        setPost(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/blog"
          className="inline-flex items-center gap-1 font-body text-[12px] text-stone hover:text-forest mb-2"
        >
          <ChevronLeft size={15} /> Back to Journal
        </Link>
        <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
          Edit Post
        </h1>
      </div>
      {loading ? (
        <p className="font-body text-[13px] text-stone">Loading…</p>
      ) : !post ? (
        <p className="font-body text-[13px] text-stone">Post not found.</p>
      ) : (
        <BlogForm post={post} />
      )}
    </div>
  );
}
