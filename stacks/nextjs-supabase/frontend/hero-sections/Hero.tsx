import Image from "next/image";
import { getProperties } from "@/lib/properties";
import HeroSearch from "./HeroSearch";
import HeroShowcase from "./HeroShowcase";
import { ButtonLink } from "./Button";
import { toSlide } from "@/lib/slide";

// Type scale taken off the reference: the headline there is ~96px at 1440px
// wide. Ours had been sitting at 72px inside a dark scrim, which is the main
// reason it read as small and timid.
function HeroCopy() {
  return (
    <>
      <div className="label text-brass flex items-center gap-3 mb-7 animate-fade-up">
        <span className="w-10 h-px bg-brass" />
        Lucknow · Real Estate &amp; Property Advisory
      </div>

      {/* 74px at desktop, Montserrat ExtraBold — the reference's exact
          hero size. */}
      <h1
        className="font-extrabold text-[2.75rem] sm:text-[3.5rem] xl:text-6xl
                   leading-[1.05] text-ink mb-8 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Find Your
        <br />
        Dream Home
      </h1>

      {/* Body copy sits at the 18px base. text-lg/xl are for card titles and
          prices — using them on paragraphs pushed everything to 20–22px and
          made the whole page read oversized. */}
      <p
        className="text-ink-soft leading-relaxed mb-10 max-w-md animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        Flats, plots, and villas across Lucknow — handled by one person, from
        the first call to the day you get the keys.
      </p>

      <div
        className="flex flex-wrap gap-4 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        <ButtonLink href="/listings" variant="secondary" size="xl" arrow>
          Browse properties
        </ButtonLink>
        <ButtonLink href="/contact" variant="ghost" size="xl">
          Talk to us
        </ButtonLink>
      </div>
    </>
  );
}

export default async function Hero() {
  const properties = await getProperties(4);
  const slides = properties.map(toSlide).filter((s) => s !== null);

  return (
    <>
      {slides.length > 0 ? (
        <HeroShowcase slides={slides}>
          <HeroCopy />
        </HeroShowcase>
      ) : (
        // Nothing listed yet. Replace /public/hero.webp with a real photo of
        // a Lucknow property — the current file is a synthetic render.
        <section className="bg-paper overflow-hidden">
          <div className="container-page pt-16 pb-24 lg:pt-24 lg:pb-32">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-16 items-center">
              <div className="max-w-xl">
                <HeroCopy />
              </div>
              <div className="relative h-[340px] sm:h-[440px] lg:h-[500px] rounded-xl overflow-hidden bg-paper-dim shadow-e3">
                <Image
                  src="/hero.webp"
                  alt="Residential towers along a tree-lined road in Lucknow"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search sits on a tan panel straddling the hero and what follows,
          the way the reference does it. */}
      <div className="relative z-20 -mt-14 sm:-mt-16">
        <div className="container-page">
          <HeroSearch />
        </div>
      </div>
    </>
  );
}
