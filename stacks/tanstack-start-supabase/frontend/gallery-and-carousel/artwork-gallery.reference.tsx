import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { waLink } from "@/lib/whatsapp";
import {
  getPublishedArtworkBySlug,
  getArtworkTags,
  getRelatedArtworks,
  type ArtworkWithCategory,
} from "@/lib";
import { OG_IMAGE } from "@/lib/site";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface LoaderData {
  artwork: ArtworkWithCategory;
  tags: { id: string; name: string }[];
  related: ArtworkWithCategory[];
}

export const Route = createFileRoute("/artwork/$slug")({
  loader: async ({ params }): Promise<LoaderData> => {
    const artwork = await getPublishedArtworkBySlug(params.slug);
    if (!artwork) throw notFound();
    const [tags, related] = await Promise.all([
      getArtworkTags(artwork.id).catch(() => []),
      getRelatedArtworks(artwork.id, artwork.category_id, 4).catch(() => []),
    ]);
    return { artwork, tags, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { artwork } = loaderData;
    return {
      meta: [
        { title: `${artwork.title} | The Artspire` },
        {
          name: "description",
          content: artwork.summary ?? `${artwork.title} — a bespoke commission by Himangi Pandey.`,
        },
        { property: "og:image", content: artwork.image_url ?? OG_IMAGE },
      ],
    };
  },
  component: ArtworkPage,
  notFoundComponent: () => (
    <SiteChrome>
      <section>
        <div className="wrap" style={{ textAlign: "center", padding: "80px 0" }}>
          <h1 className="serif" style={{ fontSize: 40, color: "var(--forest)", fontWeight: 500 }}>
            Artwork not found
          </h1>
          <Link className="btn btn-solid" to="/portfolio" style={{ marginTop: 20 }}>
            <span>Back to portfolio</span>
          </Link>
        </div>
      </section>
    </SiteChrome>
  ),
});

function ArtworkPage() {
  const { artwork, related } = Route.useLoaderData() as LoaderData;
  const [activeImg, setActiveImg] = useState(artwork.image_url ?? "");

  return (
    <SiteChrome>
      <div className="wrap crumbs">
        <Link to="/">Home</Link> / <Link to="/portfolio">Portfolio</Link>
        {artwork.categories?.name ? <> / {artwork.categories.name}</> : null} /{" "}
        <span>{artwork.title}</span>
      </div>

      <div className="wrap pdp">
        <div className="gallery">
          <div className="thumbs">
            {artwork.image_url && (
              <div
                className="frame active"
                onClick={() => setActiveImg(artwork.image_url!)}
                data-label="Artwork"
              >
                <img src={artwork.image_url} alt={artwork.title} />
              </div>
            )}
          </div>
          <div className="frame main-img tilt" data-label="Finished artwork — hi-res">
            {activeImg ? <img src={activeImg} alt={artwork.title} /> : null}
          </div>
        </div>

        <div className="info">
          <div className="cat">{artwork.categories?.name ?? "Commissioned"} · Commissioned</div>
          <h1>{artwork.title}</h1>
          {artwork.summary && <p className="desc">{artwork.summary}</p>}

          <div className="maker">
            <div className="av"></div>
            <div className="t">
              <b>Hand-made by Himangi Pandey</b>
              <br />
              <span>Lucknow, India · 11+ years of craft</span>
            </div>
          </div>

          <Link className="btn btn-solid btn-block" to="/services">
            <span>Commission a piece like this</span>
          </Link>
          <a
            className="concierge"
            href={waLink(
              `Hi The Artspire! I want to know more about "${artwork.title}" and commissioning something similar.`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
              <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 1 1 21 11.5z" />
            </svg>
            Discuss your idea on WhatsApp
          </a>

          <div className="acc">
            <details open>
              <summary>About this commission</summary>
              <div className="body">
                {artwork.short_description ??
                  "Every commission begins with your photograph and a short conversation about what matters most to capture. Hand-made start to finish by Himangi."}
              </div>
            </details>
            <details>
              <summary>The commission process</summary>
              <div className="body">
                1. Share your photo &amp; story · 2. Receive a quote &amp; timeline · 3. Approve a
                preview · 4. Final piece, carefully packed and shipped.
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <div className="wrap">
            <div
              className="sec-head"
              style={{
                justifyContent: "center",
                textAlign: "center",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span className="eyebrow rv">More commissions</span>
              <h2 className="reveal-words">Recently made</h2>
            </div>
            <div className="grid g4">
              {related.map((a, i) => (
                <Link
                  key={a.id}
                  to="/artwork/$slug"
                  params={{ slug: a.slug }}
                  className={
                    "card rv" +
                    (i % 4 === 1 ? " d1" : i % 4 === 2 ? " d2" : i % 4 === 3 ? " d3" : "")
                  }
                >
                  <div className="imgwrap tilt">
                    {a.image_url ? (
                      <div className="frame">
                        <ImageWithFallback
                          src={a.image_url}
                          alt={a.title}
                          loading="lazy"
                          fallbackLabel={a.title}
                        />
                      </div>
                    ) : (
                      <div className="frame" data-label="Commission photo"></div>
                    )}
                    <div className="quick">View piece</div>
                  </div>
                  {a.categories?.name && <div className="cat">{a.categories.name}</div>}
                  <h3>{a.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteChrome>
  );
}
