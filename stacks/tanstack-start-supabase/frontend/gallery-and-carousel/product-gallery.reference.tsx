import { createFileRoute, notFound, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  getPublishedProductBySlug,
  getProductGalleryImages,
  getRelatedProducts,
  type ProductWithCategory,
} from "@/lib/products";
import { getApprovedReviews, type ProductReview } from "@/lib/reviews";
import { addToCart, getOrCreateSessionId } from "@/lib/cart";
import { waLink } from "@/lib/whatsapp";
import { toast } from "@/lib/toast";
import { OG_IMAGE } from "@/lib/site";
import { trackViewItem, trackAddToCart, type TrackedItem } from "@/lib/analytics";
import { findRedirect } from "@/lib/redirects";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface LoaderData {
  product: ProductWithCategory;
  gallery: { media?: { public_url: string; mime_type?: string | null } | null }[];
  related: ProductWithCategory[];
  reviews: ProductReview[];
}

export const Route = createFileRoute("/shop/product/$slug")({
  loader: async ({ params }): Promise<LoaderData> => {
    const product = await getPublishedProductBySlug(params.slug);
    if (!product) {
      // Slug no longer resolves — honour a recorded permanent redirect before
      // 404ing, so renamed products (e.g. a corrected spelling in a slug) keep
      // their existing links and indexed URLs working. Only runs on this miss
      // path, so normal loads pay nothing.
      const rule = await findRedirect(`/shop/product/${params.slug}`);
      if (rule) throw redirect({ href: rule.toPath, statusCode: rule.statusCode });
      throw notFound();
    }
    const [gallery, related, reviews] = await Promise.all([
      getProductGalleryImages(product.id).catch(() => []),
      getRelatedProducts(product.id, product.category_id, 4).catch(() => []),
      getApprovedReviews(product.id).catch(() => []),
    ]);
    return { product, gallery, related, reviews };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { product } = loaderData;
    return {
      meta: [
        { title: product.meta_title ?? `${product.title} | The Artspire Shop` },
        {
          name: "description",
          content:
            product.meta_description ??
            product.summary ??
            `${product.title} — handmade, one of a kind, by The Artspire.`,
        },
        { property: "og:title", content: product.meta_title ?? `${product.title} | The Artspire` },
        { property: "og:image", content: product.image_url ?? OG_IMAGE },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <SiteChrome>
      <section>
        <div className="wrap" style={{ textAlign: "center", padding: "80px 0" }}>
          <h1 className="serif" style={{ fontSize: 44, color: "var(--forest)", fontWeight: 500 }}>
            Piece not found
          </h1>
          <p style={{ color: "var(--stone)", margin: "10px 0 24px" }}>
            This piece may have sold or moved.
          </p>
          <Link className="btn btn-solid" to="/shop">
            <span>Back to shop</span>
          </Link>
        </div>
      </section>
    </SiteChrome>
  ),
});

function ProductPage() {
  const { product, gallery, related, reviews } = Route.useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [idx, setIdx] = useState(0);
  const startX = useRef(0);

  const soldOut = product.status === "sold_out";
  const lowStock = !soldOut && product.inventory_count > 0 && product.inventory_count <= 3;

  const images = [
    product.image_url,
    ...gallery.map((g) => g.media?.public_url).filter(Boolean),
  ].filter((v, i, a) => v && a.indexOf(v) === i) as string[];
  const activeImg = images[idx] ?? images[0] ?? "";

  // GA4/Meta item shape for this product (analytics no-ops when unconfigured).
  const trackedItem = (qty = 1): TrackedItem => ({
    item_id: product.id,
    item_name: product.title,
    price: product.price,
    quantity: qty,
    item_category: product.categories?.name ?? undefined,
  });

  useEffect(() => {
    trackViewItem(trackedItem());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addToCart(getOrCreateSessionId(), product, quantity);
      trackAddToCart(trackedItem(quantity));
      toast.success("Added to cart!", `${product.title} × ${quantity}`);
      window.dispatchEvent(new CustomEvent("artspire:cart-updated"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart.", "Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    setAdding(true);
    try {
      await addToCart(getOrCreateSessionId(), product, quantity);
      trackAddToCart(trackedItem(quantity));
      window.dispatchEvent(new CustomEvent("artspire:cart-updated"));
      navigate({ to: "/checkout" });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't start checkout.", "Please try again.");
      setAdding(false);
    }
  }

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;

  return (
    <SiteChrome>
      <div className="wrap crumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link>
        {product.categories?.name ? <> / {product.categories.name}</> : null} /{" "}
        <span>{product.title}</span>
      </div>

      <div className="wrap pdp">
        <div className="gallery">
          <div className="thumbs">
            {images.map((src, i) => (
              <div
                key={i}
                className={"frame" + (i === idx ? " active" : "")}
                onClick={() => setIdx(i)}
                data-label={`View ${i + 1}`}
              >
                <ImageWithFallback
                  src={src}
                  alt={product.title}
                  loading="lazy"
                  fallbackLabel={product.title}
                />
              </div>
            ))}
          </div>
          <div
            className="frame main-img tilt"
            data-label="Product photo"
            onTouchStart={(e) => {
              startX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - startX.current;
              if (Math.abs(dx) > 40 && images.length > 1) {
                setIdx((i) =>
                  dx < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length,
                );
              }
            }}
          >
            <ImageWithFallback
              src={activeImg}
              alt={product.title}
              loading="eager"
              fallbackLabel={product.title}
            />
          </div>
          {images.length > 1 && (
            <div className="gdots">
              {images.map((_, i) => (
                <span key={i} className={i === idx ? "on" : ""} onClick={() => setIdx(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="info">
          {product.categories?.name && <div className="cat">{product.categories.name}</div>}
          <h1>{product.title}</h1>
          <div className="price-row">
            <span className="price-lg">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="tax">Inclusive of all taxes</span>
          </div>
          {reviews.length > 0 && (
            <div className="rating">
              <span className="stars">{"★".repeat(Math.round(avgRating))}</span>{" "}
              {avgRating.toFixed(1)} · {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </div>
          )}

          {/* Derived from the REAL inventory count, never from static copy. The
              old version checked is_one_of_a_kind first and asserted "Only 1 in
              stock" regardless of how many were actually in stock, and claimed
              the piece "won't be remade" — which contradicted descriptions
              offering further pieces. */}
          {soldOut ? (
            <div className="scarcity">
              <span className="dotg"></span> Sold out — join the waitlist
            </div>
          ) : product.inventory_count === 1 ? (
            <div className="scarcity">
              <span className="dotg"></span> Only 1 in stock
              {product.is_one_of_a_kind ? " — one of a kind" : ""}
            </div>
          ) : lowStock ? (
            <div className="scarcity">
              <span className="dotg"></span> Only {product.inventory_count} left in stock
            </div>
          ) : null}

          {(product.summary || product.description) && (
            <p className="desc">{product.summary ?? product.description}</p>
          )}

          <div className="maker">
            <div className="av"></div>
            <div className="t">
              <b>Made by Himangi Pandey</b>
              <br />
              <span>Lucknow, India · 11+ years of craft</span>
            </div>
          </div>

          {soldOut ? (
            <a
              className="btn btn-solid btn-block"
              href={waLink(`Hi! Please notify me when "${product.title}" is back.`)}
              target="_blank"
              rel="noreferrer"
            >
              <span>Join the waitlist</span>
            </a>
          ) : (
            <>
              <div className="qty-row">
                <div className="qty">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
                <button
                  className="btn btn-solid btn-block"
                  disabled={adding}
                  onClick={handleAddToCart}
                >
                  <span>{adding ? "Adding…" : "Add to Cart"}</span>
                </button>
              </div>
              <button className="btn btn-gold btn-block" disabled={adding} onClick={handleBuyNow}>
                <span>Buy it now</span>
              </button>
            </>
          )}

          <a
            className="concierge"
            href={waLink(
              `Hi The Artspire! I'm interested in "${product.title}" (₹${product.price.toLocaleString("en-IN")}). Is it available?`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
              <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 1 1 21 11.5z" />
            </svg>
            Questions? Chat with Himangi on WhatsApp
          </a>

          <div className="trust">
            <div>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z" />
              </svg>
              Handmade guarantee
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secure checkout
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                <path d="M16 3H1v13h15zM16 8h4l3 3v5h-7z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Insured packaging
            </div>
          </div>

          <div className="acc">
            <details open>
              <summary>Details &amp; materials</summary>
              <div className="body">
                {product.care_instructions
                  ? product.care_instructions
                  : "Each piece is individually made — expect subtle, beautiful variation. Care notes are included with every order."}
              </div>
            </details>
            <details>
              <summary>Shipping &amp; delivery</summary>
              <div className="body">
                Insured shipping across India, dispatched in 3–5 business days. Shipping calculated
                at checkout. Fragile pieces are hand-packed in protective, recyclable materials.
              </div>
            </details>
            <details>
              <summary>Returns &amp; care</summary>
              <div className="body">
                <b>Returns:</b> 7-day return on ready-made pieces if unused and undamaged (bespoke
                commissions excluded).
                <br />
                <b>Care:</b> Wipe gently with a dry, soft cloth. Avoid moisture and direct sunlight.
              </div>
            </details>
          </div>
        </div>
      </div>

      <section className="exclusive" style={{ marginTop: 40 }}>
        <div className="wrap exc-grid">
          <div
            className="frame tilt"
            data-label="Process photo — the piece being made"
            style={{
              aspectRatio: "4/3",
              background: "var(--forest-2)",
              borderColor: "rgba(198,165,102,.4)",
              borderRadius: 3,
            }}
          ></div>
          <div>
            <span className="eyebrow rv">The story of this piece</span>
            <h2 className="reveal-words">Shaped slowly, by one pair of hands.</h2>
            <p className="rv d2">
              This piece begins as raw material in Himangi's Lucknow studio, worked and finished by
              hand over several days — no moulds, no assembly line.
            </p>
            <p className="rv d3">
              When you buy an Artspire object, you're taking home a small, deliberate act of craft,
              made to be lived with and passed on.
            </p>
          </div>
        </div>
      </section>

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
              <span className="eyebrow rv">You may also love</span>
              <h2 className="reveal-words">More from the studio</h2>
            </div>
            <div className="grid g4">
              {related.map((p, i) => (
                <Link
                  key={p.id}
                  to="/shop/product/$slug"
                  params={{ slug: p.slug }}
                  className={
                    "card rv" +
                    (i % 4 === 1 ? " d1" : i % 4 === 2 ? " d2" : i % 4 === 3 ? " d3" : "")
                  }
                >
                  <div className="imgwrap tilt">
                    {p.image_url ? (
                      <div className="frame">
                        <ImageWithFallback
                          src={p.image_url}
                          alt={p.title}
                          loading="lazy"
                          fallbackLabel={p.title}
                        />
                      </div>
                    ) : (
                      <div className="frame" data-label="Product photo"></div>
                    )}
                    <div className="quick">Quick view</div>
                  </div>
                  {p.categories?.name && <div className="cat">{p.categories.name}</div>}
                  <h3>{p.title}</h3>
                  <div className="price">₹{p.price.toLocaleString("en-IN")}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteChrome>
  );
}
