import { cache, Suspense } from "react";
import {
  getPropertyById,
  getPropertyImages,
  getRelatedProperties,
  getPropertySlugSeeds,
} from "@/lib/properties";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyHeroBar from "@/components/PropertyHeroBar";
import type { SpecItem } from "@/components/PropertySpecBar";
import EnquireAboutProperty from "@/components/EnquireAboutProperty";
import BookVisit from "@/components/BookVisit";
import EmiCalculator from "@/components/EmiCalculator";
import PropertyCard from "@/components/PropertyCard";
import { Detail } from "@/components/Field";
import { ButtonLink } from "@/components/Button";
import {
  IconBed,
  IconBath,
  IconRuler,
  IconLayers,
  IconCompass,
} from "@/components/Icons";
import { SITE, SITE_URL } from "@/lib/site";
import { idFromSlug, propertySlug } from "@/lib/slug";
import { pricePerSqFt } from "@/lib/price";
import { fieldsFor, hasRooms, isFinanceable, displayValue } from "@/lib/property-schema";
import type { Property } from "@/lib/types";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

// generateMetadata and the page body both need the property. Without cache()
// that's two identical round trips to Supabase on every single request —
// which is most of why this page felt slow to open.
const getProperty = cache(async (slug: string) => {
  const id = idFromSlug(slug);
  if (!id) return null;
  return getPropertyById(id);
});

// Pre-render the listings that exist at build time so a visitor gets static
// HTML instead of waiting on a database call. Anything added later still
// works — it renders on first request and is then cached for `revalidate`.
export async function generateStaticParams() {
  try {
    const rows = await getPropertySlugSeeds();
    return rows.map((p) => ({ slug: propertySlug(p) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) return { title: "Property Not Found" };

  const canonical = `/property/${propertySlug(property)}`;
  const title = `${property.title} in ${property.location}`;
  const description = `${property.title} in ${property.location}, Lucknow — ${property.price}. ${[
    property.area,
    property.bedrooms && `${property.bedrooms} BHK`,
    property.status,
  ]
    .filter(Boolean)
    .join(", ")}. Enquire with Beig Estates.`;
  const cover = property.images?.[0] ?? property.image_url ?? undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

/** First non-empty attribute value, or null — for picking whichever area
 * field a listing actually has (carpet, built-up, or plot). */
function firstAttr(attrs: Record<string, unknown> | null, ...keys: string[]) {
  if (!attrs) return null;
  for (const k of keys) {
    const v = attrs[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
  }
  return null;
}

/**
 * The quick-glance icon row — bedrooms/bathrooms for anything with rooms,
 * an area figure, and the one attribute that most distinguishes the type
 * (floor for a flat or rental, facing for a villa or plot). Deliberately
 * short: this is the scannable summary, not the full spec sheet — that's
 * the Detail grid below it.
 */
function buildSpecItems(property: Property): SpecItem[] {
  const attrs = property.attributes;
  const items: SpecItem[] = [];

  if (hasRooms(property.property_type)) {
    if (property.bedrooms) {
      items.push({ Icon: IconBed, value: property.bedrooms, label: "Bedrooms" });
    }
    if (property.bathrooms) {
      items.push({ Icon: IconBath, value: property.bathrooms, label: "Bathrooms" });
    }
  }

  const area =
    firstAttr(attrs, "carpet_area", "built_up_area", "plot_area", "area_covered") ??
    property.area;
  if (area) {
    items.push({ Icon: IconRuler, value: area, label: "Area" });
  }

  if (property.property_type === "Flat" || property.property_type === "Rent") {
    const floor = firstAttr(attrs, "floor");
    if (floor) items.push({ Icon: IconLayers, value: floor, label: "Floor" });
  } else if (property.property_type === "Villa" || property.property_type === "Plot") {
    const facing = firstAttr(attrs, "facing");
    if (facing) items.push({ Icon: IconCompass, value: facing, label: "Facing" });
  }

  return items.slice(0, 4);
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) notFound();

  // Someone landing on a bare UUID or a stale title gets moved to the
  // canonical URL rather than the page existing at two addresses.
  const canonicalSlug = propertySlug(property);
  if (slug !== canonicalSlug) redirect(`/property/${canonicalSlug}`);

  const images = await getPropertyImages(property.id);
  const isRental = property.property_type === "Rent";
  const isPlot = property.property_type === "Plot";

  const specItems = buildSpecItems(property);

  // Every field this type of listing can carry, filtered to the ones that
  // actually have a value. lib/property-schema is the single definition of
  // which fields belong to which type — the admin form reads the same list.
  const attributeDetails = fieldsFor(property.property_type)
    .map((field) => ({
      label: field.label,
      value: displayValue(field, property.attributes?.[field.key]),
    }))
    .filter((d): d is { label: string; value: string } => d.value !== null);

  const sqFtRate = isPlot
    ? pricePerSqFt(
        property.price_numeric,
        firstAttr(property.attributes, "plot_area") ?? property.area
      )
    : null;

  // A short lead-in below the photo, only when there's actually more text
  // below it to jump to. Most listings here run one or two sentences —
  // showing the same short paragraph twice with a "More about this
  // property" button between two identical copies of it was pointless.
  // isTruncated is what decides whether the teaser+button render at all;
  // when the description already fits, the full "About this property"
  // section further down is the only place it appears.
  const isDescriptionTruncated = (property.description?.length ?? 0) > 200;
  const descriptionTeaser =
    isDescriptionTruncated && property.description
      ? property.description.slice(0, 200).replace(/\s+\S*$/, "") + "…"
      : null;

  // Both come from the free-form attributes column rather than
  // lib/property-schema's fixed field list — they're cross-cutting metadata
  // (legal registration, a PDF link), not a physical spec every listing of
  // a type has, so forcing them into every type's field list would show an
  // empty input on listings that will never have one.
  const reraNumber = firstAttr(property.attributes, "rera_number");
  const brochureUrl = firstAttr(property.attributes, "brochure_url");

  const terms = isRental
    ? [
        property.deposit && { label: "Security deposit", value: property.deposit },
        property.maintenance && {
          label: "Maintenance",
          value: property.maintenance,
        },
        property.furnishing && { label: "Furnishing", value: property.furnishing },
        property.available_from && {
          label: "Available from",
          value: new Date(property.available_from).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        },
      ].filter(Boolean)
    : [];

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: property.title,
            description:
              property.description ||
              `${property.title} in ${property.location}`,
            url: `${SITE_URL}/property/${canonicalSlug}`,
            image: images.map((i) => i.url),
            address: {
              "@type": "PostalAddress",
              addressLocality: property.location,
              addressRegion: SITE.address.state,
              addressCountry: SITE.address.country,
            },
            offers: {
              "@type": "Offer",
              price: property.price_numeric || undefined,
              priceCurrency: "INR",
              availability:
                property.status === "Ready to Move"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/PreOrder",
            },
          }),
        }}
      />

      <main id="main-content">
        <section className="py-10 sm:py-14 bg-shell">
          <div className="container-page">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2.5 text-sm text-ink-soft flex-wrap">
                <li>
                  <Link href="/" className="hover:text-brass transition-colors">
                    Home
                  </Link>
                </li>
                <Divider />
                <li>
                  <Link
                    href="/listings"
                    className="hover:text-brass transition-colors"
                  >
                    Listings
                  </Link>
                </li>
                <Divider />
                <li>
                  <Link
                    href={`/listings?type=${encodeURIComponent(property.property_type)}`}
                    className="hover:text-brass transition-colors"
                  >
                    {property.property_type}
                  </Link>
                </li>
                <Divider />
                <li className="text-ink" aria-current="page">
                  {property.location}
                </li>
              </ol>
            </nav>

            {/* The photo comes first, full width and tall — an exception
                made specifically for this page (PropertyGallery's overlay
                prop is unset everywhere else). Title, eyebrow, and location
                sit on the photo itself rather than in a text column beside
                it, so the first thing a visitor sees is the property, not a
                paragraph about it. */}
            <PropertyGallery
              images={images}
              videos={property.videos ?? []}
              title={property.title}
              heightClassName="h-[440px] sm:h-[560px] lg:h-[620px]"
              showThumbnails={false}
              overlay={
                <div className="max-w-2xl">
                  <div className="label text-brass-bright mb-3">
                    {property.property_type} · {property.status}
                  </div>
                  <h1 className="font-extrabold text-3xl sm:text-5xl text-paper leading-[1.05] tracking-tight mb-2">
                    {property.title}
                  </h1>
                  <p className="text-paper/80 text-lg">{property.location}</p>
                </div>
              }
            />

            {/* Pulled up to overlap the bottom of the photo — the same
                "floating card over the hero image" move the homepage search
                bar already does. */}
            <PropertyHeroBar
              items={specItems}
              price={property.price}
              sqFtRate={sqFtRate}
              ctaHref="#book-visit"
              className="relative z-10 -mt-10 sm:-mt-14 mb-12"
            />

            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-14">
              <div>
                {(descriptionTeaser || brochureUrl) && (
                  <div className="mb-8">
                    {descriptionTeaser && (
                      <p className="text-ink-soft leading-relaxed mb-5">
                        {descriptionTeaser}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {descriptionTeaser && (
                        <ButtonLink href="#about-property" variant="ghost">
                          More about this property
                        </ButtonLink>
                      )}
                      {brochureUrl && (
                        <ButtonLink href={brochureUrl} target="_blank" rel="noopener noreferrer" variant="ghost">
                          Download brochure
                        </ButtonLink>
                      )}
                    </div>
                  </div>
                )}

                {(attributeDetails.length > 0 || reraNumber) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 surface rounded-xl p-7">
                    <Detail label="Locality" value={property.location} />
                    <Detail label="Status" value={property.status} />
                    {attributeDetails.map((d) => (
                      <Detail key={d.label} label={d.label} value={d.value} />
                    ))}
                    {reraNumber && (
                      <Detail label="RERA registration no." value={reraNumber} />
                    )}
                  </div>
                )}

                {/* Rentals live or die on the money terms, so they get their
                    own block instead of being buried in the description. */}
                {isRental && terms.length > 0 && (
                  <div className="surface-tan rounded-xl p-7 mb-8">
                    <p className="label text-brass mb-5">Rental terms</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {terms.map((t) => (
                        <Detail
                          key={(t as { label: string }).label}
                          label={(t as { label: string }).label}
                          value={(t as { value: string }).value}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {property.description && (
                  <div id="about-property" className="scroll-mt-28 mb-8">
                    <h2 className="label text-ink-soft mb-4">
                      About this property
                    </h2>
                    <p className="leading-relaxed whitespace-pre-line text-ink-soft">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Rent and interior work can't be financed — an EMI on a
                    monthly rent or a fit-out quote doesn't mean anything. */}
                {isFinanceable(property.property_type) &&
                  property.price_numeric != null &&
                  property.price_numeric > 0 && (
                    <EmiCalculator price={property.price_numeric} />
                  )}
              </div>

              <div
                id="book-visit"
                className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start space-y-5"
              >
                <BookVisit
                  propertyId={property.id}
                  propertyTitle={property.title}
                  propertyLocation={property.location}
                />
                <EnquireAboutProperty
                  propertyTitle={property.title}
                  propertyType={property.property_type}
                />
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <NearbyProperties
            location={property.location}
            excludeId={property.id}
          />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

async function NearbyProperties({
  location,
  excludeId,
}: {
  location: string;
  excludeId: string;
}) {
  const related = await getRelatedProperties(location, excludeId);
  if (related.length === 0) return null;

  return (
    <section className="py-20 sm:py-24 bg-paper">
      <div className="container-page">
        <div className="label text-brass mb-4 flex items-center gap-2.5">
          <span className="w-[18px] h-px bg-brass" />
          Also in {location}
        </div>
        <h2 className="font-extrabold text-3xl sm:text-4xl mb-12 leading-tight">
          Other properties nearby.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {related.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Divider() {
  return (
    <li aria-hidden="true" className="text-ink-soft/40">
      /
    </li>
  );
}
