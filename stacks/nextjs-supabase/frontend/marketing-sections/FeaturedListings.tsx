import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/lib/properties";
import PropertyCard from "./PropertyCard";
import { SectionLabel } from "./ProblemSolution";
import Reveal from "./Reveal";
import { ButtonLink } from "./Button";
import { propertyHref } from "@/lib/slug";

// The homepage had no properties on it at all, which is the first thing
// anyone scrolls for. If the table is empty we render nothing rather than an
// empty-state — a "no listings yet" panel on the front page reads worse than
// no section.
export default async function FeaturedListings() {
  const properties = await getProperties(5);
  if (properties.length === 0) return null;

  const [lead, ...rest] = properties;
  const leadCover =
    lead.images && lead.images.length > 0 ? lead.images[0] : lead.image_url;
  const leadSpecs = [
    lead.area,
    lead.bedrooms && `${lead.bedrooms} Bed`,
    lead.bathrooms && `${lead.bathrooms} Bath`,
  ].filter(Boolean);

  return (
    <section className="py-20 sm:py-24 bg-paper">
      <div className="container-page">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div>
              <SectionLabel>Current Listings</SectionLabel>
              <h2 className="font-extrabold text-4xl sm:text-5xl max-w-xl leading-[1.05] tracking-tight">
                Available right now.
              </h2>
            </div>
            <ButtonLink href="/listings" variant="secondary" arrow>
              See all properties
            </ButtonLink>
          </div>
        </Reveal>

        {/* One property gets the room it deserves, the rest run alongside.
            Five equal thumbnails would flatten everything to the same value. */}
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 mb-10">
          <Reveal>
            <Link href={propertyHref(lead)} className="group block h-full">
              <div className="relative h-[380px] lg:h-full min-h-[440px] rounded-lg overflow-hidden bg-paper-dim shadow-e3 transition-shadow duration-500 group-hover:shadow-e4">
                {leadCover && (
                  <Image
                    src={leadCover}
                    alt={`${lead.title} in ${lead.location} — ${lead.price}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,17,11,0.92)_0%,rgba(20,17,11,0.3)_50%,transparent_80%)]" />

                <span className="absolute top-6 left-6 label text-[0.6875rem] bg-ink text-paper px-3.5 py-2 rounded shadow-e1">
                  Latest
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="label text-brass-bright mb-3">
                    {lead.property_type} · {lead.status}
                  </p>
                  <h3 className="font-extrabold text-3xl text-paper mb-2 leading-tight">
                    {lead.title}
                  </h3>
                  <p className="text-paper/70 mb-5">{lead.location}</p>
                  <div className="flex items-end justify-between flex-wrap gap-4">
                    <div className="font-extrabold text-3xl text-brass-bright">
                      {lead.price}
                    </div>
                    {leadSpecs.length > 0 && (
                      <p className="text-sm text-paper/60">
                        {leadSpecs.join("  ·  ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-8">
            {rest.slice(0, 2).map((p, i) => (
              <Reveal key={p.id} delay={120 + i * 110}>
                <PropertyCard p={p} />
              </Reveal>
            ))}
          </div>
        </div>

        {rest.length > 2 && (
          <div className="grid sm:grid-cols-2 gap-8">
            {rest.slice(2).map((p, i) => (
              <Reveal key={p.id} delay={i * 110}>
                <PropertyCard p={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
