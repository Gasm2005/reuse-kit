import { useState } from "react";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Image, Check, X } from "lucide-react";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: string, publicUrl: string) => void;
  folder?: string;
  multiple?: boolean;
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  folder,
  multiple = false,
}: MediaPickerProps) {
  const { items, loading, folders } = useMediaLibrary({
    folder: folder === "all" ? undefined : folder,
  });
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(folder ?? "all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = items.filter((item) => {
    if (search && !item.original_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleSelect(id: string) {
    if (multiple) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelectedIds(new Set([id]));
    }
  }

  function handleConfirm() {
    const selected = items.filter((i) => selectedIds.has(i.id));
    selected.forEach((s) => onSelect(s.id, s.public_url));
    onOpenChange(false);
    setSelectedIds(new Set());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-[18px] text-forest">
            Select from Media Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search & filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50"
              />
              <Input
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-[40px]"
              />
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="h-[40px] px-3 rounded-md border border-border bg-white font-body text-[13px] text-forest focus:outline-none focus:border-gold"
            >
              <option value="all">All Folders</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="font-body text-stone text-[13px]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <Image size={32} className="mx-auto text-stone/30 mb-2" />
              <p className="font-body text-stone text-[13px]">No media found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filtered.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      isSelected ? "border-forest" : "border-transparent hover:border-forest/30"
                    }`}
                  >
                    <img
                      src={item.public_url}
                      alt={item.alt_text ?? item.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-forest/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="font-body text-[9px] text-white truncate">
                        {item.original_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-body text-[12px] text-stone">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className="bg-forest hover:bg-forest/90"
              >
                <Check size={14} className="mr-1" /> Select
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
