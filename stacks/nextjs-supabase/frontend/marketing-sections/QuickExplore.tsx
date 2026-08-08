import Link from "next/link";
import { IconBuilding, IconHouse, IconPlot, IconKey, IconSofa } from "./Icons";

const quickLinks = [
  { label: "Flats", type: "Flat", Icon: IconBuilding },
  { label: "Villas", type: "Villa", Icon: IconHouse },
  { label: "Plots", type: "Plot", Icon: IconPlot },
  { label: "For Rent", type: "Rent", Icon: IconKey },
  { label: "Interiors", type: "Interior", Icon: IconSofa },
];

// This used to be pulled up over the hero with a negative margin. The search
// bar now occupies that slot, and two overlapping cards meant this one sat on
// top of the search fields. Normal flow, below the search.
export default function QuickExplore() {
  return (
    <section className="bg-paper pt-16 pb-4">
      <div className="container-page">
        <div className="surface rounded-xl p-7 sm:p-9">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-7">
            <p className="label text-ink-soft">What are you looking for?</p>
            <Link
              href="/listings"
              className="group text-sm text-brass hover:text-brass-bright transition-colors inline-flex items-center gap-1.5"
            >
              View all listings
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickLinks.map(({ label, type, Icon }) => (
              <Link
                key={type}
                href={`/listings?type=${encodeURIComponent(type)}`}
                className="group surface-tan lift flex flex-col gap-4 p-5 rounded-lg"
              >
                <Icon className="w-7 h-7 text-ink-soft transition-all duration-300 group-hover:text-brass group-hover:scale-110" />
                <span className="text-sm font-semibold transition-colors duration-300 group-hover:text-brass">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
