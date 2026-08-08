import { createFileRoute } from "@tanstack/react-router";
import { useMediaItem } from "@/hooks/useMediaLibrary";
import { useMediaUsage } from "@/hooks/useMediaLibrary";
import { Image, Link, ExternalLink, Tag, Folder, Calendar, HardDrive } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/media/$id")({
  component: MediaDetailPage,
});

function MediaDetailPage() {
  const { id } = Route.useParams();
  const { item, loading } = useMediaItem(id);
  const { usages, count } = useMediaUsage(id);
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return <div className="font-body text-stone text-[13px]">Loading media details...</div>;
  }

  if (!item) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="font-body text-stone text-[14px]">Media not found.</p>
      </div>
    );
  }

  const fileSize = item.file_size ? formatFileSize(item.file_size) : "Unknown";
  const dimensions = item.width && item.height ? `${item.width} × ${item.height}` : "Unknown";
  const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
          Media Detail
        </h1>
        <p className="font-body text-[13px] text-stone mt-0.5">{item.original_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image preview */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <div className="aspect-square bg-forest/5 rounded-xl overflow-hidden">
            {!imageError && item.public_url ? (
              <img
                src={item.public_url}
                alt={item.alt_text ?? item.original_name}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone/30">
                <Image size={48} />
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <a
              href={item.public_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-[36px] px-3 bg-forest/5 text-forest font-body font-semibold text-[12px] rounded-lg hover:bg-forest/10 transition-colors"
            >
              <ExternalLink size={12} />
              Open Original
            </a>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <h2 className="font-display text-[16px] text-forest font-medium mb-4">
              File Information
            </h2>
            <div className="space-y-3">
              <InfoRow icon={Folder} label="Filename" value={item.original_name} />
              <InfoRow icon={Folder} label="Folder" value={item.folder ?? "—"} />
              <InfoRow icon={HardDrive} label="File Size" value={fileSize} />
              <InfoRow icon={Image} label="Dimensions" value={dimensions} />
              <InfoRow icon={Tag} label="MIME Type" value={item.mime_type ?? "Unknown"} />
              <InfoRow icon={Calendar} label="Uploaded" value={createdDate} />
              <InfoRow
                icon={Link}
                label="Usage Count"
                value={`${count} location${count !== 1 ? "s" : ""}`}
              />
            </div>
          </div>

          {/* Alt text */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <h2 className="font-display text-[16px] text-forest font-medium mb-3">
              Alt Text & Metadata
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-body text-[11px] font-bold text-stone uppercase tracking-wider">
                  Alt Text
                </span>
                <p className="font-body text-[13px] text-forest mt-0.5">{item.alt_text ?? "—"}</p>
              </div>
              <div>
                <span className="font-body text-[11px] font-bold text-stone uppercase tracking-wider">
                  Title
                </span>
                <p className="font-body text-[13px] text-forest mt-0.5">{item.title ?? "—"}</p>
              </div>
              <div>
                <span className="font-body text-[11px] font-bold text-stone uppercase tracking-wider">
                  Caption
                </span>
                <p className="font-body text-[13px] text-forest mt-0.5">{item.caption ?? "—"}</p>
              </div>
              <div>
                <span className="font-body text-[11px] font-bold text-stone uppercase tracking-wider">
                  Tags
                </span>
                <p className="font-body text-[13px] text-forest mt-0.5">
                  {item.tags && item.tags.length > 0 ? item.tags.join(", ") : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Usage tracking */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <h2 className="font-display text-[16px] text-forest font-medium mb-3">
              Where This Image Is Used
            </h2>
            {usages.length === 0 ? (
              <p className="font-body text-[13px] text-stone/60">
                This image is not used anywhere yet.
              </p>
            ) : (
              <div className="space-y-2">
                {usages.map((usage, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-cream/50 border border-border/50"
                  >
                    <span className="font-body text-[11px] font-bold text-forest uppercase">
                      {usage.entityType}
                    </span>
                    <span className="font-body text-[12px] text-stone">{usage.entityName}</span>
                    <span className="font-body text-[10px] text-stone/50 ml-auto">
                      {usage.usageType}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {count > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="font-body text-[11px] text-amber-700 font-medium">
                  ⚠️ This image is used in {count} location{count !== 1 ? "s" : ""}. Replacing or
                  deleting it will affect all locations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-stone/40 shrink-0" />
      <span className="font-body text-[11px] font-bold text-stone uppercase tracking-wider w-[100px] shrink-0">
        {label}
      </span>
      <span className="font-body text-[13px] text-forest truncate">{value}</span>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
