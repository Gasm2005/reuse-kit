import { ButtonLink } from "./Button";
import type { SpecItem } from "./PropertySpecBar";

const COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

// The reference's bottom bar: a light stat strip (Rooms / Area / Floor) that
// runs straight into a dark price-and-CTA block, as one continuous shape.
// Ours points the CTA at the booking form further down the page rather than
// a generic "Apply Now" — the actual next step here is a site visit.
export default function PropertyHeroBar({
  items,
  price,
  sqFtRate,
  ctaHref,
  className = "",
}: {
  items: SpecItem[];
  price: string;
  sqFtRate?: number | null;
  ctaHref: string;
  className?: string;
}) {
  const cols = COLS[Math.min(Math.max(items.length, 1), 4)] ?? COLS[4];

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-e3 grid sm:grid-cols-[minmax(0,1fr)_auto] ${className}`}
    >
      {items.length > 0 && (
        <div
          className={`bg-shell grid grid-cols-2 ${cols} divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-ink/10`}
        >
          {items.map(({ Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3.5 px-6 py-5">
              <Icon className="w-7 h-7 text-brass shrink-0" />
              <div>
                <div className="font-extrabold text-xl leading-tight">{value}</div>
                <div className="text-sm text-ink-soft">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-ink text-paper flex items-center justify-between gap-6 px-7 py-5 sm:min-w-[280px]">
        <div>
          <div className="font-extrabold text-2xl leading-tight">{price}</div>
          {sqFtRate != null && (
            <div className="text-sm text-paper/60 mt-0.5">
              ₹{sqFtRate.toLocaleString("en-IN")} / sq.ft
            </div>
          )}
        </div>
        <ButtonLink href={ctaHref} variant="primary" size="md" className="shrink-0">
          Book a visit
        </ButtonLink>
      </div>
    </div>
  );
}
