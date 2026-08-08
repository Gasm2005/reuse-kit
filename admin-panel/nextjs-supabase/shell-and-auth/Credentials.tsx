import { CREDENTIALS, SITE } from "@/lib/site";
import { getProperties } from "@/lib/properties";
import Reveal from "./Reveal";

// The reference has a stats band (8K+ houses, 6K+ sold, 2K+ agents) and the
// closest Indian comparison leans on ISO / CRISIL / award badges. Both work
// because the numbers are real.
//
// So this renders nothing until there is something true to show. Two of the
// figures are counted from the database; the rest come from CREDENTIALS in
// lib/site.ts and stay hidden while they're null. Nothing here is invented —
// a made-up "500+ happy families" is worse than an empty section.
export default async function Credentials() {
  const properties = await getProperties();

  const liveListings = properties.length;
  const localities = new Set(properties.map((p) => p.location.trim())).size;

  const stats: { value: string; label: string }[] = [];

  if (CREDENTIALS.establishedYear) {
    const years = new Date().getFullYear() - CREDENTIALS.establishedYear;
    if (years > 0) {
      stats.push({ value: `${years}+`, label: "Years in Lucknow" });
    }
  }

  if (CREDENTIALS.dealsClosed) {
    stats.push({
      value: `${CREDENTIALS.dealsClosed}+`,
      label: "Deals closed",
    });
  }

  if (liveListings > 0) {
    stats.push({ value: String(liveListings), label: "Live listings" });
  }

  if (localities > 1) {
    stats.push({ value: String(localities), label: "Localities covered" });
  }

  // One stat on its own isn't a band, it's a stray number.
  if (stats.length < 2 && !CREDENTIALS.reraNumber) return null;

  return (
    <section className="py-16 sm:py-20 bg-shell border-y border-ink/8">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-8 flex-1 min-w-0">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-extrabold text-4xl text-ink mb-1.5">
                    {s.value}
                  </div>
                  <div className="text-sm text-ink-soft">{s.label}</div>
                </div>
              ))}
            </div>

            {CREDENTIALS.reraNumber && (
              <div className="surface-tan rounded-lg px-6 py-5">
                <p className="label text-ink-soft/80 mb-1.5">
                  UP RERA Registration
                </p>
                <p className="font-bold tracking-wide">
                  {CREDENTIALS.reraNumber}
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-ink-soft/70 mt-10">
            Listings and localities are counted live from what we&apos;re
            currently handling — {SITE.address.city}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
