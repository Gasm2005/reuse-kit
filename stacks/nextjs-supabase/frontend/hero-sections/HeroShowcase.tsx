"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Slide } from "@/lib/slide";

const INTERVAL = 6500;

// Reworked to the Dwello layout: the photograph sits beside the copy as its
// own object rather than behind it. Text over a darkened photo is what made
// the previous hero look muddy — nothing here overlaps, so the headline is
// crisp dark-on-light and the image gets to be a photograph.
export default function HeroShowcase({
  slides,
  children,
}: {
  slides: Slide[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL
    );
    return () => clearInterval(t);
  }, [slides.length, paused]);

  const current = slides[index];

  return (
    <section className="relative bg-paper overflow-hidden">
      <div className="container-page pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">{children}</div>

          {/* Image column. It used to carry a negative right margin so it
              bled past the gutter like the reference does — but the reference
              bleeds a cut-out illustration, whereas these are photographs
              with a caption on them, so the edge just got sliced off and the
              section clipped it. It stays inside the container now. */}
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative h-[340px] sm:h-[440px] lg:h-[500px] rounded-xl overflow-hidden bg-paper-dim shadow-e3">
              {slides.map((s, i) => (
                <Link
                  key={s.id}
                  href={s.href}
                  aria-hidden={i !== index}
                  tabIndex={i === index ? 0 : -1}
                  className={`absolute inset-0 group transition-opacity duration-[1000ms] ease-out ${
                    i === index ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={s.image}
                    alt={`${s.title} in ${s.location}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />

                  {/* Only the bottom strip is darkened, and only far enough
                      to carry the caption. */}
                  <span className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(43,27,18,0.88),transparent)]" />

                  <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <span className="label text-paper/70 block mb-2">
                      {s.type} · {s.location}
                    </span>
                    <span className="font-extrabold text-2xl text-white block leading-snug">
                      {s.title}
                    </span>
                    <span className="text-white/85 mt-1 block">
                      {s.price}
                      <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-2.5 mt-6">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${s.title}`}
                    aria-current={i === index}
                    className="group py-2"
                  >
                    <span
                      className={`block h-1 rounded-full transition-all duration-500 ${
                        i === index
                          ? "w-10 bg-ink"
                          : "w-4 bg-ink/20 group-hover:bg-ink/40"
                      }`}
                    />
                  </button>
                ))}
                {current && (
                  <span className="ml-3 text-sm text-ink-soft/70">
                    {index + 1} / {slides.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
