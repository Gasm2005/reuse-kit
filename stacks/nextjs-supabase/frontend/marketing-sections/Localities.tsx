import { getLocalities } from "@/lib/properties";
import { SectionLabel } from "./ProblemSolution";
import Reveal from "./Reveal";
import LocalityCarousel from "./LocalityCarousel";

// Browse-by-area is standard on every serious property site, and the counts
// here are computed from the table rather than typed in — so the page can't
// end up advertising areas we have nothing in.
export default async function Localities() {
  const areas = await getLocalities();
  if (areas.length < 2) return null;

  const total = areas[0].total;

  return (
    <section className="py-20 sm:py-24 bg-shell">
      <div className="container-page">
        <Reveal>
          <div className="max-w-xl mb-14">
            <SectionLabel>Where We Work</SectionLabel>
            <h2 className="font-extrabold text-4xl sm:text-5xl leading-[1.05] tracking-tight mb-5">
              Browse by area.
            </h2>
            <p className="text-ink-soft leading-relaxed">
              {areas.length} localities across Lucknow, with {total} properties
              currently on our books.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <LocalityCarousel
            areas={areas.slice(0, 14).map(({ name, count, image }) => ({
              name,
              count,
              image,
            }))}
          />
        </Reveal>
      </div>
    </section>
  );
}
