"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Property } from "@/lib/types";
import { Field, TextInput, Select, Textarea } from "./Field";
import { Button } from "./Button";

const emptyForm = {
  title: "",
  location: "",
  price: "",
  property_type: "Flat",
  area: "",
  bedrooms: "",
  bathrooms: "",
  status: "Ready to Move",
  imagesText: "",
  videosText: "",
  description: "",
};

const TYPES = ["Flat", "Villa", "Plot", "Rent", "Interior"];
const STATUSES = ["Ready to Move", "Under Construction"];

export default function PropertiesManager({
  initialProperties,
}: {
  initialProperties: Property[];
}) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const supabase = createClient();

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("property-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setUploadError(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("property-photos")
        .getPublicUrl(path);

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setForm((f) => ({
        ...f,
        imagesText: f.imagesText
          ? `${f.imagesText}\n${uploadedUrls.join("\n")}`
          : uploadedUrls.join("\n"),
      }));
    }

    setUploading(false);
    e.target.value = ""; // reset input so the same file can be re-selected if needed
  }

  function startEdit(p: Property) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      location: p.location,
      price: p.price,
      property_type: p.property_type,
      area: p.area ?? "",
      bedrooms: p.bedrooms ?? "",
      bathrooms: p.bathrooms ?? "",
      status: p.status,
      imagesText: (p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []).join("\n"),
      videosText: (p.videos ?? []).join("\n"),
      description: p.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    const imagesArray = form.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const videosArray = form.videosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      location: form.location,
      price: form.price,
      property_type: form.property_type,
      area: form.area || null,
      bedrooms: form.bedrooms || null,
      bathrooms: form.bathrooms || null,
      status: form.status,
      images: imagesArray,
      videos: videosArray,
      image_url: imagesArray[0] || null,
      description: form.description || null,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        setSaveError(error.message);
      } else if (data) {
        setProperties((prev) =>
          prev.map((p) => (p.id === editingId ? (data as Property) : p))
        );
        cancelEdit();
      }
    } else {
      const { data, error } = await supabase
        .from("properties")
        .insert(payload)
        .select()
        .single();

      if (error) {
        setSaveError(error.message);
      } else if (data) {
        setProperties((prev) => [data as Property, ...prev]);
        setForm(emptyForm);
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this property listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="surface rounded-xl p-7 space-y-5">
        <h2 className="font-bold text-lg">
          {editingId ? "Edit property" : "Add new property"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" htmlFor="p-title">
            <TextInput
              id="p-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </Field>
          <Field label="Location" htmlFor="p-location">
            <TextInput
              id="p-location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Price" htmlFor="p-price" hint="e.g. ₹42,00,000 or ₹18,000 / month">
            <TextInput
              id="p-price"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              required
              placeholder="₹42,00,000"
            />
          </Field>
          <Field label="Type" htmlFor="p-type">
            <Select
              id="p-type"
              value={form.property_type}
              onChange={(e) => update("property_type", e.target.value)}
              options={TYPES}
            />
          </Field>
          <Field label="Status" htmlFor="p-status">
            <Select
              id="p-status"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              options={STATUSES}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Area" htmlFor="p-area">
            <TextInput
              id="p-area"
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="1050 sq.ft"
            />
          </Field>
          <Field label="Bedrooms" htmlFor="p-bed">
            <TextInput
              id="p-bed"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
            />
          </Field>
          <Field label="Bathrooms" htmlFor="p-bath">
            <TextInput
              id="p-bath"
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Upload photos directly" htmlFor="p-upload">
          <label className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg border-[1.5px] border-ink/20 cursor-pointer hover:border-ink hover:bg-ink/5 transition-colors font-bold text-sm">
            {uploading ? "Uploading…" : "Choose photos"}
            <input
              id="p-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploadError && <p className="text-sm text-danger mt-2">{uploadError}</p>}
        </Field>

        <Field
          label="Photo URLs — one per line"
          htmlFor="p-images"
          hint="Uploaded photos appear here automatically; the first line becomes the cover photo."
        >
          <Textarea
            id="p-images"
            value={form.imagesText}
            onChange={(e) => update("imagesText", e.target.value)}
            placeholder={"https://...jpg\nhttps://...jpg"}
            rows={4}
          />
        </Field>

        <Field
          label="Video URLs — one per line (optional)"
          htmlFor="p-videos"
          hint="YouTube links or direct .mp4 links."
        >
          <Textarea
            id="p-videos"
            value={form.videosText}
            onChange={(e) => update("videosText", e.target.value)}
            placeholder={"https://youtube.com/watch?v=..."}
            rows={2}
          />
        </Field>

        <Field label="Description (optional)" htmlFor="p-desc">
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
          />
        </Field>

        {saveError && (
          <p className="text-sm text-danger bg-danger/5 border-[1.5px] border-danger/20 rounded-lg p-4">
            Failed to save: {saveError}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" variant="secondary" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update property" : "Add property"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div>
        <h2 className="font-bold text-lg mb-4">
          All listings ({properties.length})
        </h2>
        <div className="space-y-3">
          {properties.map((p) => {
            const thumb = p.images && p.images.length > 0 ? p.images[0] : p.image_url;
            return (
              <div key={p.id} className="surface rounded-xl p-5 flex items-center gap-4">
                <div
                  className="w-20 h-16 rounded-lg bg-cover bg-center bg-paper-dim shrink-0"
                  style={{ backgroundImage: thumb ? `url('${thumb}')` : undefined }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {p.title} — {p.location}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {p.price} · {p.property_type} · {p.status}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(p)}
                  className="text-sm font-bold text-brass shrink-0 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-sm font-bold text-danger shrink-0 hover:underline"
                >
                  Delete
                </button>
              </div>
            );
          })}
          {properties.length === 0 && (
            <p className="text-sm text-ink-soft">No properties yet. Add your first one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
