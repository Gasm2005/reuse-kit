"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SITE, waLink } from "@/lib/site";
import { IconPhone, IconPin, IconMail, IconWhatsApp } from "./Icons";
import { IconButton } from "./Button";

const links = [
  { href: "/", label: "Home" },
  {
    href: "/listings",
    label: "Listings",
    submenu: [
      { href: "/listings?type=Flat", label: "Flats" },
      { href: "/listings?type=Villa", label: "Villas" },
      { href: "/listings?type=Plot", label: "Plots" },
      { href: "/listings?type=Rent", label: "For Rent" },
      { href: "/listings?type=Interior", label: "Interiors" },
    ],
  },
  // Used to carry a submenu of four in-page anchors. About is a short page
  // now — a dropdown to scroll to a spot on the page you're already one
  // click from was solving a problem that no longer exists.
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The bar is sticky from the start, so this only deepens the background
  // and adds a shadow once you leave the top — no layout shift either way.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    // Light header on the blush page, matching the reference. Possible now
    // that there's a dark logo variant — the gold-on-cream original was
    // invisible against this background.
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled
          ? "bg-paper/92 backdrop-blur-md shadow-e2"
          : "bg-paper"
      }`}
    >
      {/* Utility strip. Address and a direct line above the fold, on every
          page — for a local agency that's a trust signal, and it gives the
          bar below it something to sit against. */}
      <div
        className={`hidden lg:block border-b border-ink/8 transition-all duration-300 ${
          scrolled ? "h-0 opacity-0 overflow-hidden" : "h-11 opacity-100"
        }`}
      >
        <div className="container-page h-11 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5 text-ink-soft/80">
            <IconPin className="w-4 h-4 text-brass shrink-0" />
            {SITE.address.line}, {SITE.address.city}
          </div>
          <div className="flex items-center gap-7">
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-2.5 text-ink-soft/80 hover:text-brass transition-colors"
            >
              <IconMail className="w-4 h-4 shrink-0" />
              {SITE.email}
            </a>
            <a
              href={waLink(SITE.phones[0].wa)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-ink-soft/80 hover:text-brass transition-colors"
            >
              <IconWhatsApp className="w-4 h-4 shrink-0" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Same container as the page content, so the logo's left edge lines up
          with the hero headline and the CTA lines up with the right gutter. */}
      <nav className="container-page">
        {/* Three real columns rather than an absolutely-centred nav. Absolute
            positioning took the nav out of flow, so once it grew it ran
            straight underneath the buttons on the right. */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 h-20 sm:h-[6.5rem]">
          <Link href="/" className="flex items-center shrink-0 group">
            {/* logo-dark.webp is the mark recoloured to a solid #2B1B12
                silhouette — the original is gold-on-cream and disappears
                against a light background. */}
            <Image
              src="/logo-dark.webp"
              alt="Beig Estates"
              width={400}
              height={355}
              className="h-14 sm:h-[4.75rem] w-auto transition-transform duration-300 group-hover:scale-[1.04]"
              priority
            />
          </Link>

          {/* Centred, widely spaced, bold — the reference sets its nav in
              Montserrat Bold at 18px with roughly 56px between items. */}
          <div className="hidden md:flex items-center justify-center gap-2 lg:gap-6">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);

              return (
                <div key={l.href} className="relative group">
                  <Link
                    href={l.href}
                    className={`relative flex items-center gap-2 px-5 py-4 text-base font-bold rounded-md transition-colors duration-300 ${
                      active ? "text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {/* Pill grows in behind the label on hover. */}
                    <span
                      className={`absolute inset-0 rounded-md bg-ink/5 origin-center transition-all duration-300 ease-out ${
                        active
                          ? "scale-100 opacity-100"
                          : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                      }`}
                    />
                    <span className="relative">{l.label}</span>
                    {l.submenu && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="relative mt-px transition-transform duration-300 group-hover:rotate-180"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    )}
                    <span
                      className={`absolute left-5 right-5 bottom-1.5 h-0.5 origin-left rounded-full bg-ink transition-transform duration-300 ease-out ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>

                  {l.submenu && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible transition-all duration-300 ease-out group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible">
                      <div className="surface-raised rounded-xl p-2 min-w-[248px] origin-top scale-95 -translate-y-1 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        {l.submenu.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            // Rounded inset row rather than a full-bleed beige
                            // band, and no sliding dash — it read as a glitch.
                            className="group/item flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-base font-medium text-ink-soft transition-colors duration-200 hover:bg-paper hover:text-ink"
                          >
                            {s.label}
                            <span
                              aria-hidden="true"
                              className="text-brass opacity-0 -translate-x-1 transition-all duration-200 group-hover/item:opacity-100 group-hover/item:translate-x-0"
                            >
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pinned to column 3. Without col-start-3 it auto-placed into the
              middle track on mobile — where the nav is display:none — so the
              buttons drifted to the centre of the bar. */}
          <div className="col-start-3 flex items-center justify-end gap-3">
            <a
              href={`tel:${SITE.phones[0].tel}`}
              className="group hidden md:inline-flex items-center gap-2.5 px-7 py-4 rounded-lg bg-ink text-paper text-base font-bold transition-colors duration-300 hover:bg-[#1C1009]"
            >
              <IconPhone className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
              {SITE.phones[0].display}
            </a>

            {/* Mobile trigger */}
            <div className="flex md:hidden items-center gap-2">
              {/* IconButton is button-only; this stays a plain anchor with
                  the same tone-solid treatment. */}
              <a
                href={`tel:${SITE.phones[0].tel}`}
                aria-label={`Call ${SITE.phones[0].display}`}
                className="w-11 h-11 rounded-lg bg-ink text-paper flex items-center justify-center active:scale-95 transition-transform"
              >
                <IconPhone className="w-5 h-5" />
              </a>
              <IconButton
                onClick={() => setOpen((v) => !v)}
                label="Toggle menu"
                aria-expanded={open}
                tone="outline"
                className="!border-0 flex-col gap-[5px] !rounded-lg"
              >
                <span
                  className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-opacity duration-200 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </IconButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile panel — animates its height so it slides rather than snaps. */}
      <div
        className={`md:hidden overflow-hidden bg-paper transition-[max-height,opacity] duration-400 ease-out ${
          open ? "max-h-[80vh] opacity-100 border-t border-ink/10 shadow-e2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-5 overflow-y-auto max-h-[76vh]">
          {links.map((l, i) => (
            <div
              key={l.href}
              className={`transition-all duration-300 ${
                open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : "0ms" }}
            >
              <Link
                href={l.href}
                className="block py-3 text-ink text-lg font-bold border-b border-ink/10"
              >
                {l.label}
              </Link>
              {l.submenu && (
                <div className="pl-4 border-l border-brass/40 ml-1 my-2 flex flex-col gap-0.5">
                  {l.submenu.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="py-2 text-ink-soft text-sm active:text-brass"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
