"use client";

import { forwardRef } from "react";
import Link from "next/link";

// One button system for the whole site.
//
// Before this, a "button" might be gold-filled, outlined, or just brass text
// with an arrow after it, at four different sizes — so nothing read as
// reliably clickable. Three variants, two sizes, and every one of them has a
// solid shape, a real label, and a visible hover and pressed state.
//
//   primary   — the one action we want on this screen (gold, filled)
//   secondary — equally valid alternative (solid dark)
//   ghost     — low emphasis, still clearly a control (bordered)

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-md font-semibold " +
  "whitespace-nowrap transition-all duration-300 select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper " +
  "active:translate-y-0 active:scale-[0.985] disabled:opacity-55 " +
  "disabled:pointer-events-none";

// Flat, solid fills. The gradient-plus-glow version read as a template
// download — the shimmer and the drop-shadow were doing the work that the
// label and the shape should do. Colour shift on hover, nothing else.
const variants: Record<Variant, string> = {
  primary: "bg-brass text-paper hover:bg-[#6F521F]",
  secondary: "bg-ink text-paper hover:bg-blueprint-deep",
  // 1.5px so the edge is unmistakable — a 1px hairline at low opacity was
  // reading as decoration rather than a control.
  ghost:
    "border-[1.5px] border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-paper",
};

// The reference's primary CTA is roughly 176×58 — noticeably bigger than the
// 8×4 padding this had. xl matches that.
const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4",
  xl: "px-10 py-5 text-lg",
};

function classes(variant: Variant, size: Size, className: string) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  /** Adds a nudging arrow. Use for navigation, not for submit actions. */
  arrow?: boolean;
};

function Inner({ children, arrow }: { children: React.ReactNode; arrow?: boolean }) {
  return (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "lg",
  className = "",
  children,
  arrow,
  ...rest
}: Common & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isHashLink = href.startsWith("#");
  const isExternal =
    href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  const cls = `group ${classes(variant, size, className)}`;

  // Same-page anchors scroll themselves instead of relying on the browser's
  // default fragment-navigation. Next's App Router intercepts every <a>
  // click app-wide for its own client transitions — true even for a plain
  // <a>, not just next/link's <Link> — and that interception updates
  // location.hash without performing the actual scroll. Taking over the
  // scroll here is the only way this reliably moves the page.
  if (isHashLink) {
    return (
      <a
        href={href}
        className={cls}
        onClick={(e) => {
          e.preventDefault();
          const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          document
            .getElementById(href.slice(1))
            ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          history.pushState(null, "", href);
        }}
        {...rest}
      >
        <Inner arrow={arrow}>{children}</Inner>
      </a>
    );
  }

  if (isExternal) {
    return (
      <a href={href} className={cls} {...rest}>
        <Inner arrow={arrow}>{children}</Inner>
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}

/**
 * Circular icon-only control — carousel arrows, gallery next/prev, the
 * floating call and WhatsApp buttons. These were hand-rolled at four
 * different sizes with four different hover treatments.
 * `label` is required because there's no visible text to read.
 */
export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    tone?: "outline" | "solid" | "onDark";
    size?: "sm" | "md";
    children: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function IconButton(
  { label, tone = "outline", size = "md", className = "", children, ...rest },
  ref
) {
  const tones = {
    outline:
      "border-[1.5px] border-ink/25 text-ink hover:bg-ink hover:text-paper hover:border-ink",
    solid: "bg-ink text-paper hover:bg-[#1C1009]",
    onDark: "bg-paper/12 text-paper backdrop-blur-sm hover:bg-paper/25",
  };
  const sizes = { sm: "w-10 h-10", md: "w-12 h-12" };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      {...rest}
      className={`inline-flex items-center justify-center rounded-full shrink-0
        transition-all duration-300 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-brass
        disabled:opacity-30 disabled:pointer-events-none
        ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
});

export function Button({
  variant = "primary",
  size = "lg",
  className = "",
  children,
  arrow,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`group ${classes(variant, size, className)}`} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}
