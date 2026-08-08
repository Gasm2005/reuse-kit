import { createFileRoute } from "@tanstack/react-router";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import { HOMEPAGE_SECTIONS } from "@/lib/website-content";
import { Home, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { updateWebsiteContent, upsertWebsiteContent } from "@/lib/website-content";
import type { WebsiteContent } from "@/lib/website-content";

export const Route = createFileRoute("/admin/website-content/homepage")({
  component: HomepageContentPage,
});

function HomepageContentPage() {
  const { items, loading, refresh } = useWebsiteContent({ page: "homepage" });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSave(contentKey: string, value: string) {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const existing = items.find((i) => i.content_key === contentKey);
      if (existing) {
        await updateWebsiteContent(existing.id, { value_text: value });
      } else {
        // Extract page, section, field from content key
        const parts = contentKey.split(".");
        await upsertWebsiteContent(contentKey, {
          page: parts[0],
          section: parts[1],
          field_name: parts[2],
          value_text: value,
          field_type: "text",
        });
      }
      setSaveStatus("success");
      await refresh();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const getValue = (key: string): string => {
    return items.find((i) => i.content_key === key)?.value_text ?? "";
  };

  const heroFields = [
    {
      key: "homepage.hero.tagline",
      label: "Tagline (provenance line — who & where)",
      type: "text" as const,
      placeholder: "Himangi Pandey · Lucknow, India",
    },
    {
      key: "homepage.hero.heading",
      label: "Main Heading (H1) — include keywords",
      type: "text" as const,
      placeholder: "Handmade Pencil Sketches & Custom Art from Your Photos",
    },
    {
      key: "homepage.hero.subheading",
      label: "Subheading",
      type: "textarea" as const,
      placeholder: "Each piece drawn by hand — one stroke at a time...",
    },
    {
      key: "homepage.hero.cta_text",
      label: "Primary Button Text",
      type: "text" as const,
      placeholder: "Commission a Piece",
    },
    {
      key: "homepage.hero.availability",
      label: "⭐ Availability Signal (high conversion impact!)",
      type: "text" as const,
      placeholder: "Currently accepting commissions for July 2026",
    },
    {
      key: "homepage.hero.image_1",
      label: "Hero Image 1 URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.hero.image_2",
      label: "Hero Image 2 URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.hero.image_3",
      label: "Hero Image 3 URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.hero.image_4",
      label: "Hero Image 4 URL",
      type: "text" as const,
      placeholder: "https://...",
    },
  ];

  const trustFields = [
    {
      key: "homepage.trust_strip.text",
      label: "Trust Strip Text",
      type: "text" as const,
      placeholder: "11+ Years • 1000+ Artworks • One Artist • Handcrafted",
    },
  ];

  const servicesFields = [
    {
      key: "homepage.services.heading",
      label: "Section Heading",
      type: "text" as const,
      placeholder: "What Would You Like to Create?",
    },
    {
      key: "homepage.services.subheading",
      label: "Section Subheading",
      type: "textarea" as const,
      placeholder: "Choose from our signature handcrafted art services...",
    },
    {
      key: "homepage.services.0.title",
      label: "Service 1 — Title",
      type: "text" as const,
      placeholder: "Pencil Sketches",
    },
    {
      key: "homepage.services.0.price",
      label: "Service 1 — Price",
      type: "text" as const,
      placeholder: "From ₹999",
    },
    {
      key: "homepage.services.0.days",
      label: "Service 1 — Delivery",
      type: "text" as const,
      placeholder: "5–7 days",
    },
    {
      key: "homepage.services.0.image",
      label: "Service 1 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.services.1.title",
      label: "Service 2 — Title",
      type: "text" as const,
      placeholder: "Colour Portraits",
    },
    {
      key: "homepage.services.1.price",
      label: "Service 2 — Price",
      type: "text" as const,
      placeholder: "From ₹1,999",
    },
    {
      key: "homepage.services.1.days",
      label: "Service 2 — Delivery",
      type: "text" as const,
      placeholder: "7–10 days",
    },
    {
      key: "homepage.services.1.image",
      label: "Service 2 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.services.2.title",
      label: "Service 3 — Title",
      type: "text" as const,
      placeholder: "Custom Paintings",
    },
    {
      key: "homepage.services.2.price",
      label: "Service 3 — Price",
      type: "text" as const,
      placeholder: "From ₹2,999",
    },
    {
      key: "homepage.services.2.days",
      label: "Service 3 — Delivery",
      type: "text" as const,
      placeholder: "10–14 days",
    },
    {
      key: "homepage.services.2.image",
      label: "Service 3 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.services.3.title",
      label: "Service 4 — Title",
      type: "text" as const,
      placeholder: "Mirror Art",
    },
    {
      key: "homepage.services.3.price",
      label: "Service 4 — Price",
      type: "text" as const,
      placeholder: "From ₹2,499",
    },
    {
      key: "homepage.services.3.days",
      label: "Service 4 — Delivery",
      type: "text" as const,
      placeholder: "7–12 days",
    },
    {
      key: "homepage.services.3.image",
      label: "Service 4 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.services.4.title",
      label: "Service 5 — Title",
      type: "text" as const,
      placeholder: "Clay Art",
    },
    {
      key: "homepage.services.4.price",
      label: "Service 5 — Price",
      type: "text" as const,
      placeholder: "From ₹1,799",
    },
    {
      key: "homepage.services.4.days",
      label: "Service 5 — Delivery",
      type: "text" as const,
      placeholder: "7–10 days",
    },
    {
      key: "homepage.services.4.image",
      label: "Service 5 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.services.5.title",
      label: "Service 6 — Title",
      type: "text" as const,
      placeholder: "Personalized Gifts",
    },
    {
      key: "homepage.services.5.price",
      label: "Service 6 — Price",
      type: "text" as const,
      placeholder: "From ₹799",
    },
    {
      key: "homepage.services.5.days",
      label: "Service 6 — Delivery",
      type: "text" as const,
      placeholder: "5–10 days",
    },
    {
      key: "homepage.services.5.image",
      label: "Service 6 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
  ];

  const beforeAfterFields = [
    {
      key: "homepage.before_after.heading",
      label: "Heading",
      type: "text" as const,
      placeholder: "Your Photo. Our Masterpiece.",
    },
    {
      key: "homepage.before_after.subheading",
      label: "Subheading",
      type: "textarea" as const,
      placeholder: "See the transformation from photo to handcrafted art.",
    },
    {
      key: "homepage.before_after.cta_text",
      label: "Button Text",
      type: "text" as const,
      placeholder: "Commission Your Artwork",
    },
    {
      key: "homepage.before_after.before_1",
      label: "Slider 1 — Before Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.before_after.after_1",
      label: "Slider 1 — After Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.before_after.caption_1",
      label: "Slider 1 — Caption",
      type: "text" as const,
      placeholder: "Pencil Sketch · 5 days",
    },
    {
      key: "homepage.before_after.before_2",
      label: "Slider 2 — Before Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.before_after.after_2",
      label: "Slider 2 — After Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.before_after.caption_2",
      label: "Slider 2 — Caption",
      type: "text" as const,
      placeholder: "Color Portrait · 7 days",
    },
    {
      key: "homepage.before_after.before_3",
      label: "Slider 3 — Before Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.before_after.after_3",
      label: "Slider 3 — After Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.before_after.caption_3",
      label: "Slider 3 — Caption",
      type: "text" as const,
      placeholder: "Custom Painting · 10 days",
    },
  ];

  const howItWorksFields = [
    {
      key: "homepage.how_it_works.heading",
      label: "Heading",
      type: "text" as const,
      placeholder: "Simple. Personal. Yours.",
    },
    {
      key: "homepage.how_it_works.subheading",
      label: "Subheading",
      type: "textarea" as const,
      placeholder: "Four easy steps from idea to delivered artwork.",
    },
    {
      key: "homepage.how_it_works.step_1_title",
      label: "Step 1 — Title",
      type: "text" as const,
      placeholder: "Share Your Idea",
    },
    {
      key: "homepage.how_it_works.step_1_desc",
      label: "Step 1 — Description",
      type: "textarea" as const,
      placeholder: "Send us your favorite photo...",
    },
    {
      key: "homepage.how_it_works.step_2_title",
      label: "Step 2 — Title",
      type: "text" as const,
      placeholder: "We Discuss & Confirm",
    },
    {
      key: "homepage.how_it_works.step_2_desc",
      label: "Step 2 — Description",
      type: "textarea" as const,
      placeholder: "We'll help you choose...",
    },
    {
      key: "homepage.how_it_works.step_3_title",
      label: "Step 3 — Title",
      type: "text" as const,
      placeholder: "Watch It Come to Life",
    },
    {
      key: "homepage.how_it_works.step_3_desc",
      label: "Step 3 — Description",
      type: "textarea" as const,
      placeholder: "Receive updates as our artist...",
    },
    {
      key: "homepage.how_it_works.step_4_title",
      label: "Step 4 — Title",
      type: "text" as const,
      placeholder: "Delivered to Your Door",
    },
    {
      key: "homepage.how_it_works.step_4_desc",
      label: "Step 4 — Description",
      type: "textarea" as const,
      placeholder: "Safely packaged and shipped...",
    },
  ];

  const categoriesFields = [
    {
      key: "homepage.categories.heading",
      label: "Heading",
      type: "text" as const,
      placeholder: "Explore by Category",
    },
    {
      key: "homepage.categories.subheading",
      label: "Subheading",
      type: "textarea" as const,
      placeholder: "Browse our handcrafted art collections.",
    },
  ];

  const recentWorkFields = [
    {
      key: "homepage.recent_work.heading",
      label: "Heading",
      type: "text" as const,
      placeholder: "Recent Work",
    },
    {
      key: "homepage.recent_work.subheading",
      label: "Subheading",
      type: "textarea" as const,
      placeholder: "A selection of our latest handcrafted commissions.",
    },
  ];

  const testimonialsFields = [
    {
      key: "homepage.testimonials.heading",
      label: "Section Heading",
      type: "text" as const,
      placeholder: "What Our Clients Say",
    },
    {
      key: "homepage.testimonials.1_quote",
      label: "Review 1 — Quote",
      type: "textarea" as const,
      placeholder: "She saw details I never mentioned...",
    },
    {
      key: "homepage.testimonials.1_author",
      label: "Review 1 — Name",
      type: "text" as const,
      placeholder: "— Rajiv M.",
    },
    {
      key: "homepage.testimonials.2_quote",
      label: "Review 2 — Quote",
      type: "textarea" as const,
      placeholder: "The clay sculpture made me cry...",
    },
    {
      key: "homepage.testimonials.2_author",
      label: "Review 2 — Name",
      type: "text" as const,
      placeholder: "— Sneha K.",
    },
    {
      key: "homepage.testimonials.3_quote",
      label: "Review 3 — Quote",
      type: "textarea" as const,
      placeholder: "She redid the eyes because...",
    },
    {
      key: "homepage.testimonials.3_author",
      label: "Review 3 — Name",
      type: "text" as const,
      placeholder: "— Anjali & Vikram S.",
    },
  ];

  const giftsFields = [
    {
      key: "homepage.gifts.heading",
      label: "Heading",
      type: "text" as const,
      placeholder: "Find the Perfect Gift",
    },
    {
      key: "homepage.gifts.subheading",
      label: "Subheading",
      type: "textarea" as const,
      placeholder: "Handcrafted art for every special occasion.",
    },
    {
      key: "homepage.gifts.card_1_label",
      label: "Card 1 — Label",
      type: "text" as const,
      placeholder: "For Parents",
    },
    {
      key: "homepage.gifts.card_1_image",
      label: "Card 1 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.gifts.card_2_label",
      label: "Card 2 — Label",
      type: "text" as const,
      placeholder: "For Couples",
    },
    {
      key: "homepage.gifts.card_2_image",
      label: "Card 2 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.gifts.card_3_label",
      label: "Card 3 — Label",
      type: "text" as const,
      placeholder: "New Home",
    },
    {
      key: "homepage.gifts.card_3_image",
      label: "Card 3 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.gifts.card_4_label",
      label: "Card 4 — Label",
      type: "text" as const,
      placeholder: "Memorials",
    },
    {
      key: "homepage.gifts.card_4_image",
      label: "Card 4 — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
    {
      key: "homepage.gifts.corporate_label",
      label: "Corporate Banner — Text",
      type: "text" as const,
      placeholder: "Corporate & Bulk Orders",
    },
    {
      key: "homepage.gifts.corporate_image",
      label: "Corporate Banner — Image URL",
      type: "text" as const,
      placeholder: "https://...",
    },
  ];

  const aboutFields = [
    {
      key: "homepage.about.tagline",
      label: "Tagline (small label above heading)",
      type: "text" as const,
      placeholder: "The Artist",
    },
    {
      key: "homepage.about.heading",
      label: "Heading",
      type: "text" as const,
      placeholder: "Hi, I'm Himangi.",
    },
    {
      key: "homepage.about.description",
      label: "Description paragraph 1 (GEO entity — be specific)",
      type: "textarea" as const,
      placeholder:
        "I am a visual artist based in Lucknow, India, working in pencil, graphite, colour, clay, and mirror...",
    },
    {
      key: "homepage.about.description_2",
      label: "Description paragraph 2",
      type: "textarea" as const,
      placeholder: "Every piece I make is drawn or sculpted by my hands alone...",
    },
    {
      key: "homepage.about.cta_text",
      label: "Link Text",
      type: "text" as const,
      placeholder: "Read my story →",
    },
    {
      key: "homepage.about.image",
      label: "Artist Photo URL",
      type: "text" as const,
      placeholder: "https://...",
    },
  ];

  const ctaFields = [
    {
      key: "homepage.cta.heading",
      label: "Closing CTA Heading",
      type: "text" as const,
      placeholder: "Ready to commission something extraordinary?",
    },
    {
      key: "homepage.cta.subheading",
      label: "Closing CTA Subheading",
      type: "textarea" as const,
      placeholder: "Tell Himangi about the person, the memory, or the occasion...",
    },
  ];

  const sections = [
    { name: "🎯 Hero Section", fields: heroFields },
    { name: "✨ Trust Strip", fields: trustFields },
    { name: "👩‍🎨 About Artist", fields: aboutFields },
    { name: "🖼️ Before & After", fields: beforeAfterFields },
    { name: "🎨 Services", fields: servicesFields },
    { name: "🗂️ Categories", fields: categoriesFields },
    { name: "🖼️ Recent Work", fields: recentWorkFields },
    { name: "💬 Testimonials", fields: testimonialsFields },
    { name: "🎁 Gift Section", fields: giftsFields },
    { name: "🔚 Closing CTA", fields: ctaFields },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a
          href="/admin/website-content"
          className="p-2 rounded-lg hover:bg-forest/5 text-stone hover:text-forest transition-colors"
        >
          <ArrowLeft size={18} />
        </a>
        <div>
          <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
            Homepage Content
          </h1>
          <p className="font-body text-[13px] text-stone mt-0.5">
            Edit all text and content on the homepage
          </p>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 font-body text-[13px] text-green-700">
          ✅ Changes saved successfully.
        </div>
      )}
      {saveStatus === "error" && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 font-body text-[13px] text-red-700">
          ❌ Failed to save. Please try again.
        </div>
      )}

      {loading ? (
        <div className="font-body text-stone text-[13px]">Loading content...</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.name}
              className="bg-white rounded-2xl border border-border p-5 shadow-sm"
            >
              <h2 className="font-display text-[16px] text-forest font-medium mb-4">
                {section.name}
              </h2>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <ContentField
                    key={field.key}
                    label={field.label}
                    value={getValue(field.key)}
                    placeholder={field.placeholder}
                    type={field.type}
                    onSave={(val) => handleSave(field.key, val)}
                    saving={saving}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentField({
  label,
  value,
  placeholder,
  type,
  onSave,
  saving,
}: {
  label: string;
  value: string;
  placeholder: string;
  type: "text" | "textarea";
  onSave: (val: string) => void;
  saving: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);

  // Sync when DB value loads
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-[14px] text-forest focus:outline-none focus:border-gold transition-colors";

  return (
    <div>
      <label className="block font-body text-[11px] font-semibold text-stone uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        {type === "textarea" ? (
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={inputClass + " resize-y min-h-[80px]"}
          />
        ) : (
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        )}
        <button
          onClick={() => onSave(localValue)}
          disabled={saving}
          className="shrink-0 h-[44px] px-4 bg-forest text-white font-body font-bold text-[12px] rounded-xl btn-primary disabled:opacity-50"
        >
          <Save size={14} />
        </button>
      </div>
    </div>
  );
}
