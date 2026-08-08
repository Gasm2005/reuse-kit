import { useState, useRef } from "react";
import { uploadMediaFile, type MediaItem } from "@/lib/media-library";
import { Image, X, Upload, GripVertical, Loader2 } from "lucide-react";
import { MediaPicker } from "./MediaPicker";

interface MultiImageUploaderProps {
  images: { mediaId: string; publicUrl: string; caption?: string; altText?: string }[];
  onChange: (
    images: { mediaId: string; publicUrl: string; caption?: string; altText?: string }[],
  ) => void;
  folder?: string;
  maxImages?: number;
}

export function MultiImageUploader({
  images,
  onChange,
  folder,
  maxImages = 10,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const newImages = [...images];
      for (const file of Array.from(files)) {
        if (newImages.length >= maxImages) break;
        const result = await uploadMediaFile(file, { folder: folder ?? "artworks" });
        newImages.push({
          mediaId: result.mediaItem.id,
          publicUrl: result.publicUrl,
        });
      }
      onChange(newImages);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemove(index: number) {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  }

  function handlePickerSelect(mediaId: string, publicUrl: string) {
    if (images.length >= maxImages) return;
    onChange([...images, { mediaId, publicUrl }]);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-body text-[11px] font-semibold text-stone uppercase tracking-wider">
          Images ({images.length}/{maxImages})
        </span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div
              key={img.mediaId + index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-square rounded-xl overflow-hidden border border-border group cursor-grab active:cursor-grabbing ${
                dragIndex === index ? "opacity-50 ring-2 ring-forest" : ""
              }`}
            >
              <img
                src={img.publicUrl}
                alt={img.altText ?? ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 p-1 rounded bg-black/30 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={12} />
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 rounded bg-black/30 text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-body text-[9px] text-white">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 font-body text-[13px] text-stone">
          <Loader2 size={16} className="animate-spin" />
          Uploading images...
        </div>
      )}

      {images.length < maxImages && (
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 h-[40px] px-4 border border-forest text-forest font-body font-semibold text-[12px] rounded-xl btn-secondary transition-colors"
          >
            <Upload size={14} />
            Upload Files
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 h-[40px] px-4 border border-border text-stone font-body font-semibold text-[12px] rounded-xl hover:border-forest/40 hover:text-forest transition-colors"
          >
            <Image size={14} />
            From Library
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePickerSelect}
        folder={folder}
      />
    </div>
  );
}
