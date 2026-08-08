import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { uploadMediaFile, softDeleteMediaItem, type MediaItem } from "@/lib/media-library";
import { Image, Upload, Trash2, Search, Folder, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/media/")({
  component: MediaLibraryPage,
});

function MediaLibraryPage() {
  const router = useRouter();
  const { items, loading, refresh, folders } = useMediaLibrary();
  const [folder, setFolder] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (folder !== "all" && item.folder !== folder) return false;
    if (search && !item.original_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMediaFile(file, {
          folder: folder === "all" ? "uncategorized" : folder,
        });
      }
      await refresh();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? It will be soft-deleted.")) return;
    setDeleteId(id);
    try {
      await softDeleteMediaItem(id);
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
            Media Library
          </h1>
          <p className="font-body text-[13px] text-stone mt-0.5">
            Upload, manage, and track all website images
          </p>
        </div>
        <label className="inline-flex items-center gap-2 h-[44px] px-5 bg-forest text-white font-body font-bold text-[13px] rounded-xl btn-primary cursor-pointer transition-colors">
          <Upload size={16} />
          Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50" />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[44px] pl-9 pr-4 rounded-xl border border-border bg-white font-body text-[14px] text-forest focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Folder size={14} className="text-stone/50" />
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="h-[44px] px-3 rounded-xl border border-border bg-white font-body text-[14px] text-forest focus:outline-none focus:border-gold"
          >
            <option value="all">All Folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 font-body text-[13px] text-stone">
          <Loader2 size={16} className="animate-spin" />
          Uploading images...
        </div>
      )}

      {loading ? (
        <div className="font-body text-stone text-[13px]">Loading media...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <Image size={40} className="mx-auto text-stone/30 mb-3" />
          <p className="font-body text-stone text-[14px]">No media found.</p>
          <p className="font-body text-stone/60 text-[12px] mt-1">
            Upload your first image to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              isDeleting={deleteId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({
  item,
  onDelete,
  isDeleting,
}: {
  item: MediaItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm group">
      <div className="aspect-square bg-forest/5 relative overflow-hidden">
        {!imageError && item.public_url ? (
          <img
            src={item.public_url}
            alt={item.alt_text ?? item.original_name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone/30">
            <Image size={24} />
          </div>
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a
            href={`/admin/media/${item.id}`}
            className="p-2 rounded-lg bg-white/90 text-forest hover:bg-white transition-colors"
            title="View Details"
          >
            <Search size={14} />
          </a>
          <button
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-white transition-colors"
            title="Delete"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
      <div className="p-3">
        <p
          className="font-body text-[11px] text-forest font-medium truncate"
          title={item.original_name}
        >
          {item.original_name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-body text-[10px] text-stone/60 uppercase">{item.folder}</span>
          <span className="font-body text-[10px] text-stone/60">{item.usage_count ?? 0} uses</span>
        </div>
      </div>
    </div>
  );
}
