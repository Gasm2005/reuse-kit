import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Globe,
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  Eye,
} from "lucide-react";
import {
  getWebsiteContent,
  upsertWebsiteContent,
  updateWebsiteContent,
  type WebsiteContent,
} from "@/lib/website-content";
import { getArtworks, type ArtworkWithCategory } from "@/lib/artworks";
import { getCategories } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

// Hostname shown in the Google-preview mock, derived from the single source of
// truth so the admin never displays a retired/stale domain.
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export const Route = createFileRoute("/admin/seo/")({
  component: SEOPage,
});

// ─── Static pages ────────────────────────────────────────────
const STATIC_PAGES = [
  { key: "homepage", label: "Homepage", url: "/", description: "Main landing page" },
  { key: "portfolio", label: "Portfolio", url: "/portfolio", description: "All artworks gallery" },
  { key: "about", label: "About", url: "/about", description: "Artist story page" },
  { key: "services", label: "Services", url: "/services", description: "Services & pricing" },
  { key: "contact", label: "Contact", url: "/contact", description: "Contact page" },
  { key: "faq", label: "FAQ", url: "/faq", description: "Frequently asked questions" },
];

// ─── Score helpers ───────────────────────────────────────────
function titleScore(t: string) {
  if (!t) return "missing";
  if (t.length < 30 || t.length > 65) return "warn";
  return "good";
}
function descScore(d: string) {
  if (!d) return "missing";
  if (d.length < 80 || d.length > 165) return "warn";
  return "good";
}
function ScoreDot({ status }: { status: "good" | "warn" | "missing" }) {
  if (status === "good") return <CheckCircle size={14} className="text-green-500 shrink-0" />;
  if (status === "warn") return <AlertCircle size={14} className="text-amber-500 shrink-0" />;
  return <XCircle size={14} className="text-red-400 shrink-0" />;
}
function charColor(len: number, min: number, max: number) {
  if (len === 0) return "text-stone/40";
  if (len < min || len > max) return "text-amber-600";
  return "text-green-600";
}

// ─── Google Preview ──────────────────────────────────────────
function GooglePreview({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  const siteUrl = SITE_HOST;
  return (
    <div className="bg-white rounded-xl border border-border p-4 font-body">
      <p className="text-[11px] text-stone/50 mb-2 uppercase tracking-wider font-semibold">
        Google Preview
      </p>
      <div className="text-[12px] text-stone/60 mb-0.5">
        {siteUrl}
        {url}
      </div>
      <div className="text-[18px] text-blue-700 leading-snug hover:underline cursor-pointer truncate">
        {title || <span className="text-stone/30 italic">No title set</span>}
      </div>
      <div className="text-[13px] text-stone/70 mt-1 line-clamp-2">
        {description || <span className="text-stone/30 italic">No description set</span>}
      </div>
    </div>
  );
}

// ─── SEO Field Editor ────────────────────────────────────────
function SEOFieldEditor({
  titleKey,
  descKey,
  ogImageKey,
  titleDefault,
  descDefault,
  url,
  saving,
  onSave,
  initialTitle,
  initialDesc,
  initialOg,
}: {
  titleKey: string;
  descKey: string;
  ogImageKey?: string;
  titleDefault: string;
  descDefault: string;
  url: string;
  saving: boolean;
  onSave: (key: string, val: string) => Promise<void>;
  initialTitle: string;
  initialDesc: string;
  initialOg?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [og, setOg] = useState(initialOg ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);
  useEffect(() => {
    setDesc(initialDesc);
  }, [initialDesc]);
  useEffect(() => {
    setOg(initialOg ?? "");
  }, [initialOg]);

  async function handleSave() {
    setLocalSaving(true);
    try {
      await onSave(titleKey, title);
      await onSave(descKey, desc);
      if (ogImageKey) await onSave(ogImageKey, og);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setLocalSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-[13px] text-forest focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="space-y-4">
      {/* Meta Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-body text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <ScoreDot status={titleScore(title)} />
            Meta Title
          </label>
          <span
            className={`font-body text-[11px] font-semibold ${charColor(title.length, 30, 65)}`}
          >
            {title.length}/65
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titleDefault}
          maxLength={80}
          className={inputClass}
        />
        <p className="font-body text-[10px] text-stone/50 mt-1">Ideal: 30–65 characters</p>
      </div>

      {/* Meta Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-body text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <ScoreDot status={descScore(desc)} />
            Meta Description
          </label>
          <span
            className={`font-body text-[11px] font-semibold ${charColor(desc.length, 80, 165)}`}
          >
            {desc.length}/165
          </span>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={descDefault}
          maxLength={200}
          rows={3}
          className={inputClass + " resize-none"}
        />
        <p className="font-body text-[10px] text-stone/50 mt-1">Ideal: 80–165 characters</p>
      </div>

      {/* OG Image */}
      {ogImageKey && (
        <div>
          <label className="font-body text-[11px] font-bold text-stone uppercase tracking-wider mb-1.5 block">
            OG Image URL (Social Share Image)
          </label>
          <input
            type="text"
            value={og}
            onChange={(e) => setOg(e.target.value)}
            placeholder="https://theartspire.com/og-image.jpg (1200×630px)"
            className={inputClass}
          />
          <p className="font-body text-[10px] text-stone/50 mt-1">
            Shown when shared on WhatsApp, Instagram, Facebook
          </p>
        </div>
      )}

      {/* Google Preview Toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-1.5 font-body text-[11px] text-forest font-semibold hover:text-gold transition-colors"
      >
        <Eye size={13} />
        {showPreview ? "Hide" : "Show"} Google Preview
      </button>
      {showPreview && <GooglePreview title={title} description={desc} url={url} />}

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={handleSave}
          disabled={localSaving}
          className="inline-flex items-center gap-2 h-[40px] px-5 bg-forest text-white font-body font-bold text-[12px] rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50"
        >
          {localSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {localSaving ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span className="font-body text-[12px] text-green-600 font-semibold">✓ Saved!</span>
        )}
      </div>
    </div>
  );
}

// ─── Accordion wrapper ───────────────────────────────────────
function Accordion({
  title,
  subtitle,
  score,
  children,
}: {
  title: string;
  subtitle: string;
  score: "good" | "warn" | "missing";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cream/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ScoreDot status={score} />
          <div>
            <p className="font-body text-[14px] font-semibold text-forest">{title}</p>
            <p className="font-body text-[11px] text-stone/60">{subtitle}</p>
          </div>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-stone/40" />
        ) : (
          <ChevronDown size={16} className="text-stone/40" />
        )}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
function SEOPage() {
  const [tab, setTab] = useState<"pages" | "artworks" | "global">("pages");
  const [content, setContent] = useState<WebsiteContent[]>([]);
  const [artworks, setArtworks] = useState<ArtworkWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [artworkSearch, setArtworkSearch] = useState("");

  useEffect(() => {
    Promise.all([
      getWebsiteContent({ page: "seo" }).catch(() => []),
      getArtworks({ status: "published", limit: 200 }).catch(() => []),
    ])
      .then(([c, a]) => {
        setContent(c as WebsiteContent[]);
        setArtworks(a as ArtworkWithCategory[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const cv = (key: string) => content.find((c) => c.content_key === key)?.value_text ?? "";

  const saveContent = useCallback(
    async (key: string, val: string) => {
      const existing = content.find((c) => c.content_key === key);
      let updated: WebsiteContent;
      if (existing) {
        updated = await updateWebsiteContent(existing.id, { value_text: val });
        setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const parts = key.split(".");
        updated = await upsertWebsiteContent(key, {
          page: "seo",
          section: parts[1] ?? "general",
          field_name: parts[2] ?? key,
          value_text: val,
          field_type: "text",
        });
        setContent((prev) => [...prev.filter((c) => c.content_key !== key), updated]);
      }
    },
    [content],
  );

  const saveArtworkSEO = useCallback(
    async (id: string, field: string, val: string) => {
      const key = `seo.artwork.${id}.${field}`;
      const existing = content.find((c) => c.content_key === key);
      let updated: WebsiteContent;
      if (existing) {
        updated = await updateWebsiteContent(existing.id, { value_text: val });
        setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        updated = await upsertWebsiteContent(key, {
          page: "seo",
          section: "artwork",
          field_name: field,
          value_text: val,
          field_type: "text",
        });
        setContent((prev) => [...prev.filter((c) => c.content_key !== key), updated]);
      }
    },
    [content],
  );

  const filteredArtworks = artworks.filter((a) =>
    a.title.toLowerCase().includes(artworkSearch.toLowerCase()),
  );

  // Overall score
  const pageScores = STATIC_PAGES.map((p) => {
    const t = cv(`seo.${p.key}.title`);
    const d = cv(`seo.${p.key}.description`);
    if (titleScore(t) === "good" && descScore(d) === "good") return "good";
    if (!t && !d) return "missing";
    return "warn";
  });
  const goodCount = pageScores.filter((s) => s === "good").length;
  const missingCount = pageScores.filter((s) => s === "missing").length;

  const tabs = [
    { key: "pages", label: "Pages SEO", icon: FileText },
    { key: "artworks", label: "Artworks SEO", icon: Image },
    { key: "global", label: "Global SEO", icon: Globe },
  ] as const;

  if (loading) return <p className="font-body text-stone text-[13px] p-6">Loading SEO data…</p>;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
          SEO Center
        </h1>
        <p className="font-body text-[13px] text-stone mt-0.5">
          Meta tags, descriptions, and structured data for every page
        </p>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-border p-4 text-center shadow-sm">
          <p className="font-display text-[28px] text-green-600 font-medium">{goodCount}</p>
          <p className="font-body text-[11px] text-stone/60 uppercase tracking-wider">Optimized</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center shadow-sm">
          <p className="font-display text-[28px] text-amber-500 font-medium">
            {pageScores.filter((s) => s === "warn").length}
          </p>
          <p className="font-body text-[11px] text-stone/60 uppercase tracking-wider">Needs Work</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center shadow-sm">
          <p className="font-display text-[28px] text-red-400 font-medium">{missingCount}</p>
          <p className="font-body text-[11px] text-stone/60 uppercase tracking-wider">Missing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-body text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-forest text-forest"
                : "border-transparent text-stone/60 hover:text-forest"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PAGES TAB ── */}
      {tab === "pages" && (
        <div className="space-y-3">
          <p className="font-body text-[12px] text-stone/60">
            Set meta title and description for each page. These appear in Google search results.
          </p>
          {STATIC_PAGES.map((page, i) => {
            const t = cv(`seo.${page.key}.title`);
            const d = cv(`seo.${page.key}.description`);
            const og = cv(`seo.${page.key}.og_image`);
            const ts = titleScore(t);
            const ds = descScore(d);
            const score = ts === "good" && ds === "good" ? "good" : !t && !d ? "missing" : "warn";
            return (
              <Accordion key={page.key} title={page.label} subtitle={page.url} score={score}>
                <SEOFieldEditor
                  titleKey={`seo.${page.key}.title`}
                  descKey={`seo.${page.key}.description`}
                  ogImageKey={`seo.${page.key}.og_image`}
                  titleDefault={`${page.label} | Artspire`}
                  descDefault={`${page.description} — Artspire custom handmade art by Himangi`}
                  url={page.url}
                  saving={false}
                  onSave={saveContent}
                  initialTitle={t}
                  initialDesc={d}
                  initialOg={og}
                />
              </Accordion>
            );
          })}
        </div>
      )}

      {/* ── ARTWORKS TAB ── */}
      {tab === "artworks" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40"
              />
              <input
                type="text"
                value={artworkSearch}
                onChange={(e) => setArtworkSearch(e.target.value)}
                placeholder="Search artworks…"
                className="w-full h-[40px] pl-9 pr-4 rounded-xl border border-border bg-white font-body text-[13px] text-forest focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <span className="font-body text-[12px] text-stone/50 shrink-0">
              {filteredArtworks.length} artworks
            </span>
          </div>

          <div className="space-y-3">
            {filteredArtworks.map((artwork) => {
              const t = cv(`seo.artwork.${artwork.id}.meta_title`);
              const d = cv(`seo.artwork.${artwork.id}.meta_description`);
              const ts = titleScore(t);
              const ds = descScore(d);
              const score = ts === "good" && ds === "good" ? "good" : !t && !d ? "missing" : "warn";
              return (
                <Accordion
                  key={artwork.id}
                  title={artwork.title}
                  subtitle={`/artwork/${artwork.slug} · ${artwork.categories?.name ?? "No category"}`}
                  score={score}
                >
                  <ArtworkSEOEditor
                    artwork={artwork}
                    initialTitle={t}
                    initialDesc={d}
                    onSave={(field, val) => saveArtworkSEO(artwork.id, field, val)}
                  />
                </Accordion>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GLOBAL TAB ── */}
      {tab === "global" && (
        <div className="space-y-4">
          <p className="font-body text-[12px] text-stone/60">
            These apply across the whole site when a specific page doesn't have its own SEO set.
          </p>
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <GlobalField
              label="Default Site Title"
              hint="Used when no page title is set"
              contentKey="seo.global.site_title"
              placeholder="Artspire | Custom Handmade Art by Himangi Pandey"
              cv={cv}
              save={saveContent}
            />
            <GlobalField
              label="Default Meta Description"
              hint="Fallback for all pages"
              contentKey="seo.global.site_description"
              placeholder="Custom handmade pencil sketches, paintings, clay art, and mirror art from your photos. Delivered across India."
              cv={cv}
              save={saveContent}
              textarea
            />
            <GlobalField
              label="Default OG Image URL"
              hint="Shown when any page is shared on social media (1200×630px)"
              contentKey="seo.global.og_image"
              placeholder="https://theartspire.com/og-default.jpg"
              cv={cv}
              save={saveContent}
            />
            <GlobalField
              label="Twitter / X Handle"
              hint="e.g. @artspirein"
              contentKey="seo.global.twitter_handle"
              placeholder="@artspirein"
              cv={cv}
              save={saveContent}
            />
            <GlobalField
              label="Google Search Console Verification"
              hint="Paste the content= value from Google Search Console meta tag"
              contentKey="seo.global.google_verification"
              placeholder="xxxxxxxxxxxxxxxxxxxxxx"
              cv={cv}
              save={saveContent}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-body text-[12px] font-semibold text-amber-800 mb-1">
              📍 Already done automatically
            </p>
            <ul className="font-body text-[12px] text-amber-700 space-y-1 list-disc list-inside">
              <li>sitemap.xml generated at every deploy → theartspire.com/sitemap.xml</li>
              <li>robots.txt live → theartspire.com/robots.txt</li>
              <li>JSON-LD structured data on all artwork pages</li>
              <li>Breadcrumb schema on artwork pages</li>
              <li>Open Graph tags on artwork pages</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <p className="font-body text-[13px] font-semibold text-forest mb-3">
              🔗 Submit to search engines
            </p>
            <div className="space-y-2">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-forest/30 transition-colors group"
              >
                <div>
                  <p className="font-body text-[13px] font-semibold text-forest">
                    Google Search Console
                  </p>
                  <p className="font-body text-[11px] text-stone/60">
                    Submit sitemap, monitor rankings
                  </p>
                </div>
                <span className="font-body text-[11px] text-gold font-semibold group-hover:text-forest">
                  Open →
                </span>
              </a>
              <a
                href="https://www.bing.com/webmasters"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-forest/30 transition-colors group"
              >
                <div>
                  <p className="font-body text-[13px] font-semibold text-forest">
                    Bing Webmaster Tools
                  </p>
                  <p className="font-body text-[11px] text-stone/60">
                    Submit sitemap to Bing & DuckDuckGo
                  </p>
                </div>
                <span className="font-body text-[11px] text-gold font-semibold group-hover:text-forest">
                  Open →
                </span>
              </a>
            </div>
            <p className="font-body text-[11px] text-stone/50 mt-3">
              Sitemap URL to submit:{" "}
              <span className="font-semibold text-forest">https://theartspire.com/sitemap.xml</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ArtworkSEOEditor({
  artwork,
  initialTitle,
  initialDesc,
  onSave,
}: {
  artwork: ArtworkWithCategory;
  initialTitle: string;
  initialDesc: string;
  onSave: (field: string, val: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-[13px] text-forest focus:outline-none focus:border-gold transition-colors";

  async function handleSave() {
    setSaving(true);
    try {
      await onSave("meta_title", title);
      await onSave("meta_description", desc);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {artwork.image_url && (
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-[120px] object-cover rounded-xl"
        />
      )}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-body text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <ScoreDot status={titleScore(title)} />
            Meta Title
          </label>
          <span
            className={`font-body text-[11px] font-semibold ${charColor(title.length, 30, 65)}`}
          >
            {title.length}/65
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${artwork.title} | Artspire`}
          maxLength={80}
          className={inputClass}
        />
        <p className="font-body text-[10px] text-stone/50 mt-1">
          If empty, uses artwork title automatically
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-body text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1.5">
            <ScoreDot status={descScore(desc)} />
            Meta Description
          </label>
          <span
            className={`font-body text-[11px] font-semibold ${charColor(desc.length, 80, 165)}`}
          >
            {desc.length}/165
          </span>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={
            artwork.summary ?? `Custom handmade ${artwork.title} by Artspire artist Himangi Pandey.`
          }
          maxLength={200}
          rows={3}
          className={inputClass + " resize-none"}
        />
      </div>
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-1.5 font-body text-[11px] text-forest font-semibold hover:text-gold transition-colors"
      >
        <Eye size={13} />
        {showPreview ? "Hide" : "Show"} Google Preview
      </button>
      {showPreview && (
        <GooglePreview
          title={title || `${artwork.title} | Artspire`}
          description={desc || artwork.summary || ""}
          url={`/artwork/${artwork.slug}`}
        />
      )}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-[40px] px-5 bg-forest text-white font-body font-bold text-[12px] rounded-xl hover:bg-forest/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span className="font-body text-[12px] text-green-600 font-semibold">✓ Saved!</span>
        )}
      </div>
    </div>
  );
}

function GlobalField({
  label,
  hint,
  contentKey,
  placeholder,
  cv,
  save,
  textarea,
}: {
  label: string;
  hint: string;
  contentKey: string;
  placeholder: string;
  cv: (k: string) => string;
  save: (k: string, v: string) => Promise<void>;
  textarea?: boolean;
}) {
  const [val, setVal] = useState(cv(contentKey));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVal(cv(contentKey));
  }, [cv, contentKey]);

  async function handleSave() {
    setSaving(true);
    try {
      await save(contentKey, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-[13px] text-forest focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between">
        <div>
          <label className="font-body text-[11px] font-bold text-stone uppercase tracking-wider">
            {label}
          </label>
          <p className="font-body text-[10px] text-stone/50">{hint}</p>
        </div>
        {saved && (
          <span className="font-body text-[11px] text-green-600 font-semibold shrink-0">
            ✓ Saved
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClass + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 h-[36px] px-4 bg-forest text-white font-body font-semibold text-[11px] rounded-lg hover:bg-forest/90 disabled:opacity-50 transition-colors"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
