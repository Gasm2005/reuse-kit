"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconButton } from "./Button";

export type Locality = {
  name: string;
  count: number;
  image: string | null;
};

// Twelve identical flat rectangles is a list, not a section. Each tile now
// carries a photo from a property actually in that locality, and the row
// scrolls instead of stacking into four rows of dead space.
export default function LocalityCarousel({ areas }: { areas: Locality[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // Move by roughly one card plus its gap.
    el.scrollBy({ left: dir * (el.clientWidth * 0.75), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {areas.map((a) => (
          <Link
            key={a.name}
            href={`/listings?q=${encodeURIComponent(a.name)}`}
            className="group relative shrink-0 snap-start w-[260px] sm:w-[300px] h-[340px]
                       rounded-xl overflow-hidden bg-paper-dim shadow-e2
                       transition-shadow duration-500 hover:shadow-e4"
          >
            {a.image && (
              <Image
                src={a.image}
                alt={`Property in ${a.name}`}
                fill
                sizes="300px"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
              />
            )}

            <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(43,27,18,0.9)_0%,rgba(43,27,18,0.25)_45%,transparent_72%)]" />

            <span className="absolute inset-x-0 bottom-0 p-6">
              <span className="block text-xl font-bold text-white mb-1">
                {a.name}
              </span>
              <span className="flex items-center justify-between text-white/75">
                <span className="text-sm">
                  {a.count} {a.count === 1 ? "property" : "properties"}
                </span>
                <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  →
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Arrows are hidden from assistive tech — the track is scrollable and
          every tile is a real link, so they're a convenience, not the only
          way through. */}
      <div className="flex items-center gap-3 mt-6">
        <IconButton
          label="Scroll left"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
        >
          <ChevronIcon dir="left" />
        </IconButton>
        <IconButton
          label="Scroll right"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
        >
          <ChevronIcon dir="right" />
        </IconButton>
      </div>
    </div>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}
