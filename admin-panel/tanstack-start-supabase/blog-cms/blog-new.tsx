import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogForm } from "@/components/admin/BlogForm";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/admin/blog/new")({
  component: NewPostPage,
});

function NewPostPage() {
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
          New Post
        </h1>
      </div>
      <BlogForm />
    </div>
  );
}
