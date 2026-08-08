"use client";

import { useEffect, useRef, useState } from "react";

// Fades and lifts a block in the first time it scrolls into view.
//
// The important part is what happens when that *doesn't* work. An earlier
// version started at opacity-0 and waited for an IntersectionObserver, so if
// JS was slow, blocked, or the observer never fired, the content stayed
// invisible for good — which is exactly what happened in testing. Now the
// markup renders visible, the hidden state is only ever applied on the
// client, and a timer forces it visible regardless. Worst case you lose the
// animation; you never lose the content.
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // never armed — stays visible, no animation
    }

    // Anything already on screen at mount shouldn't animate; hiding it just
    // to fade it back in reads as a flicker.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return;

    setArmed(true);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);

    // Backstop: if the observer hasn't fired by now, something is wrong with
    // it, so show the content anyway.
    const failsafe = setTimeout(() => {
      setShown(true);
      io.disconnect();
    }, 2500);

    return () => {
      io.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
