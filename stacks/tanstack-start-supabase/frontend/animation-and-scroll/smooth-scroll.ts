// Scrolling on this site is owned by Lenis (smooth-scroll library, loaded in
// SiteChrome). Lenis runs its own requestAnimationFrame loop that continuously
// writes the scroll position, so a native window.scrollTo() can be overridden
// and silently do nothing — which is why the commission form/confirmation
// sometimes never came into view. Always go THROUGH Lenis when it's present.

type LenisLike = {
  scrollTo: (target: number | string | HTMLElement, opts?: Record<string, unknown>) => void;
};

function getLenis(): LenisLike | undefined {
  return (window as unknown as { __artspireLenis?: LenisLike }).__artspireLenis;
}

/**
 * Smoothly scrolls an element into view, offset by the fixed header.
 * Retries once after a short delay because layout can still be settling
 * (images sizing, a form being swapped for a confirmation card).
 */
export function smoothScrollToElement(
  target: HTMLElement | null,
  { offset = 88, delay = 120 }: { offset?: number; delay?: number } = {},
): void {
  if (!target) return;

  const run = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target, { offset: -offset, duration: 0.9 });
      return;
    }
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: "smooth",
    });
  };

  // Once after paint, then once more after layout settles.
  requestAnimationFrame(run);
  window.setTimeout(run, delay);
}

/** Convenience: scroll to an element by id. */
export function smoothScrollToId(id: string, opts?: { offset?: number; delay?: number }): void {
  smoothScrollToElement(document.getElementById(id), opts);
}
