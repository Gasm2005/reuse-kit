import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getCartCount, getOrCreateSessionId } from "@/lib/cart";

// Shared "The Artspire" premium chrome (charcoal design system, scoped under .tas)
// Wrap any page: <SiteChrome>...sections...</SiteChrome>

export function useSiteMotion() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    // Signal the reveal-bootstrap safety net (see __root) that hydration ran,
    // so it won't force-reveal everything after its timeout.
    (window as unknown as { __artspireRevealed?: boolean }).__artspireRevealed = true;
    const hdr = document.getElementById("hdr");
    const totop = document.getElementById("totop");
    const onScroll = () => {
      const y = window.scrollY;
      if (hdr) hdr.classList.toggle("scrolled", y > 20);
      if (totop) totop.classList.toggle("show", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            // Mark revealed with a DATA ATTRIBUTE, not a class. React owns
            // className: when it re-renders an element (e.g. a soft navigation
            // to /services?service=… changes a card's stagger class) it rewrites
            // className from JSX and silently strips an imperatively-added "in",
            // sending an already-revealed element back to opacity 0 — and the
            // observer has already unobserved it, so it stays invisible forever.
            // React never touches data-rv (it isn't in the JSX), so the reveal
            // is genuinely one-way. The class is still set for any legacy CSS.
            (e.target as HTMLElement).dataset.rv = "in";
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      // threshold 0 = reveal as soon as any part enters the viewport (forgiving,
      // so fast scrolls / tall elements never get stuck hidden).
      { threshold: 0 },
    );
    const REVEAL_SELECTOR = ".rv,.clip,.reveal-words";
    const observeIfNeeded = (el: Element) => {
      if (!(el as HTMLElement).dataset.rv) io.observe(el);
    };
    document.querySelectorAll(`.tas .rv,.tas .clip,.tas .reveal-words`).forEach(observeIfNeeded);

    // Elements rendered AFTER mount (a submit confirmation, a lazily-loaded
    // grid, an expanded panel) were never observed by the initial pass, so under
    // html.js they'd sit at opacity 0 forever — exactly how the commission
    // success message (with the lead number) went invisible. Watch for new
    // nodes and observe them too, so no dynamically added content can be
    // permanently hidden.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as HTMLElement;
          if (el.matches?.(REVEAL_SELECTOR)) observeIfNeeded(el);
          el.querySelectorAll?.(REVEAL_SELECTOR).forEach(observeIfNeeded);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    cleanups.push(() => {
      mo.disconnect();
      io.disconnect();
    });

    // The markup already contains each counter's final value, so the count-up is
    // purely decorative — skip it entirely for reduced-motion users rather than
    // animating (and briefly showing 0) against their preference.
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          if (prefersReducedMotion) {
            cio.unobserve(e.target);
            return;
          }
          const el = e.target as HTMLElement;
          const end = +(el.dataset.count || "0");
          const suf = el.dataset.suffix || "";
          let t0: number | null = null;
          const dur = 1500;
          const step = (t: number) => {
            if (!t0) t0 = t;
            const p = Math.min((t - t0) / dur, 1);
            const v = Math.floor((1 - Math.pow(1 - p, 3)) * end);
            el.textContent = v.toLocaleString("en-IN") + suf;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        }),
      { threshold: 0.6 },
    );
    document.querySelectorAll(".tas [data-count]").forEach((c) => cio.observe(c));
    cleanups.push(() => cio.disconnect());

    document.querySelectorAll(".tas .reveal-words").forEach((el) => {
      if ((el as HTMLElement).dataset.split === "1") return;
      (el as HTMLElement).dataset.split = "1";
      const walk = (node: Node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            (n.textContent || "").split(/(\s+)/).forEach((part) => {
              if (part.trim() === "") {
                frag.appendChild(document.createTextNode(part));
                return;
              }
              const w = document.createElement("span");
              w.className = "word";
              const inner = document.createElement("span");
              inner.textContent = part;
              w.appendChild(inner);
              frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
      el.querySelectorAll(".word>span").forEach((sp, i) => {
        (sp as HTMLElement).style.transitionDelay = i * 0.05 + "s";
      });
    });

    const W = window as unknown as {
      Lenis?: new (o: unknown) => { raf: (t: number) => void; destroy: () => void };
    };
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    if (W.Lenis) {
      lenis = new W.Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      // Expose the instance so programmatic scrolling can go THROUGH Lenis.
      // Lenis's RAF loop continuously writes the scroll position, so a native
      // window.scrollTo() gets overridden and silently does nothing — that's why
      // scrolling to the commission form/confirmation didn't work.
      // See src/lib/smooth-scroll.ts.
      (window as unknown as { __artspireLenis?: unknown }).__artspireLenis = lenis;
      const raf = (t: number) => {
        if (lenis) lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      cleanups.push(() => {
        if (lenis) lenis.destroy();
        delete (window as unknown as { __artspireLenis?: unknown }).__artspireLenis;
      });
    }

    document.querySelectorAll<HTMLElement>(".tas .btn").forEach((btn) => {
      const mm = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform =
          "translate(" +
          (e.clientX - (r.left + r.width / 2)) * 0.28 +
          "px," +
          (e.clientY - (r.top + r.height / 2)) * 0.4 +
          "px)";
      };
      const ml = () => {
        btn.style.transform = "";
      };
      btn.addEventListener("mousemove", mm);
      btn.addEventListener("mouseleave", ml);
      cleanups.push(() => {
        btn.removeEventListener("mousemove", mm);
        btn.removeEventListener("mouseleave", ml);
      });
    });

    document.querySelectorAll<HTMLElement>(".tas .tilt").forEach((el) => {
      const mm = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width,
          py = (e.clientY - r.top) / r.height;
        el.style.transform =
          "perspective(1200px) rotateX(" +
          (0.5 - py) * 15 +
          "deg) rotateY(" +
          (px - 0.5) * 15 +
          "deg) translateZ(34px) scale(1.045)";
      };
      const ml = () => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", mm);
      el.addEventListener("mouseleave", ml);
      cleanups.push(() => {
        el.removeEventListener("mousemove", mm);
        el.removeEventListener("mouseleave", ml);
      });
    });

    const ring = document.getElementById("cring");
    if (ring) {
      let tx = window.innerWidth / 2,
        ty = window.innerHeight / 2,
        rx = tx,
        ry = ty,
        run = true;
      const move = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
      };
      window.addEventListener("mousemove", move, { passive: true });
      const loop = () => {
        if (!run) return;
        rx += (tx - rx) * 0.18;
        ry += (ty - ry) * 0.18;
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
        requestAnimationFrame(loop);
      };
      loop();
      document
        .querySelectorAll(".tas a,.tas button,.tas .card,.tas .cat-tile,.tas .gift")
        .forEach((el) => {
          el.addEventListener("mouseenter", () => ring.classList.add("big"));
          el.addEventListener("mouseleave", () => ring.classList.remove("big"));
        });
      cleanups.push(() => {
        run = false;
        window.removeEventListener("mousemove", move);
      });
    }

    if (totop) totop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    return () => cleanups.forEach((fn) => fn());
    // Run once per mount (i.e. once per page). Previously there was no dependency
    // array, so this re-ran on every render — tearing down and recreating the
    // observers and Lenis, which could restart a delayed opacity transition so
    // it never settled and left content stuck at opacity 0.
  }, []);
}

export function SiteHeader() {
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  // Pulses the badge when the count RISES. Purely additive feedback: the count
  // itself already updated correctly, but it changed silently in a corner the
  // shopper isn't looking at, so "did that work?" had no answer.
  const [bump, setBump] = useState(false);
  const prevCount = useRef(0);
  useEffect(() => {
    const rose = count > prevCount.current;
    prevCount.current = count;
    if (!rose) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [count]);
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      getCartCount(getOrCreateSessionId())
        .then((c) => {
          if (alive) setCount(c);
        })
        .catch(() => {});
    };
    refresh();
    window.addEventListener("artspire:cart-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      alive = false;
      window.removeEventListener("artspire:cart-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  const close = () => setMenuOpen(false);
  return (
    <>
      <div className="announce">
        <div className="wrap arow">
          <span>Handmade in India</span>
          <b>◆</b>
          <span>Insured pan-India shipping · Calculated at checkout</span>
        </div>
      </div>
      <header id="hdr">
        <nav className="wrap">
          <Link to="/" className="logo" onClick={close}>
            <picture>
              <source srcSet="/artspire-logo.webp" type="image/webp" />
              <img
                src="/artspire-logo.png"
                alt="The Artspire"
                className="logo-img"
                width={249}
                height={58}
              />
            </picture>
          </Link>
          <div className="navlinks">
            <Link to="/shop">Shop</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/services">Commissions</Link>
            <Link to="/blog">Journal</Link>
            <Link to="/about">Our Story</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="navicons">
            <Link
              to="/cart"
              className={"cart-dot" + (bump ? " bump" : "")}
              aria-label={count > 0 ? `Cart — ${count} item${count === 1 ? "" : "s"}` : "Cart"}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {count > 0 && <b>{count}</b>}
            </Link>
            <button className="menu-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <div className={"mobnav-overlay" + (menuOpen ? " open" : "")} onClick={close}>
        <div className="mobnav-panel" onClick={(e) => e.stopPropagation()}>
          <div className="top">
            <div className="foot-logo" style={{ color: "var(--forest)" }}>
              <i>The</i>Artspire
            </div>
            <button className="close" aria-label="Close menu" onClick={close}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Link to="/shop" onClick={close}>
            Shop
          </Link>
          <Link to="/portfolio" onClick={close}>
            Portfolio
          </Link>
          <Link to="/services" onClick={close}>
            Commissions
          </Link>
          <Link to="/blog" onClick={close}>
            Journal
          </Link>
          <Link to="/about" onClick={close}>
            Our Story
          </Link>
          <Link to="/contact" onClick={close}>
            Contact
          </Link>
          <Link to="/cart" onClick={close} className="mn-cart">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </div>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        {/* Desktop / tablet — refined, app-like */}
        <div className="foot-desktop">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">
                <i>The</i>Artspire
              </div>
              <p className="foot-tag">
                Handmade objects for the home — made slowly, kept for a lifetime.
              </p>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li>
                  <Link to="/shop">All Pieces</Link>
                </li>
                <li>
                  <Link to="/shop">Collections</Link>
                </li>
                <li>
                  <Link to="/cart">Cart</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Studio</h4>
              <ul>
                <li>
                  <Link to="/services">Commissions</Link>
                </li>
                <li>
                  <Link to="/portfolio">Portfolio</Link>
                </li>
                <li>
                  <Link to="/blog">Journal</Link>
                </li>
                <li>
                  <Link to="/about">Our Story</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li>
                  <Link to="/track-order">Track Order</Link>
                </li>
                <li>
                  <Link to="/faq">Shipping &amp; Returns</Link>
                </li>
                <li>
                  <Link to="/faq">FAQs</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Policies</h4>
              <ul>
                <li>
                  <Link to="/shipping-policy">Shipping</Link>
                </li>
                <li>
                  <Link to="/refund-and-cancellation-policy">Refunds &amp; Cancellation</Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
                </li>
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 The Artspire Studio · Lucknow, India</span>
            <span>Crafting Your Vision</span>
          </div>
        </div>

        {/* Mobile — minimal */}
        <div className="foot-mobile">
          <div className="foot-logo" style={{ textAlign: "center" }}>
            <i>The</i>Artspire
          </div>
          <div className="fm-links">
            <Link to="/shop">Shop</Link>
            <Link to="/services">Commissions</Link>
            <Link to="/track-order">Track Order</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/shipping-policy">Shipping</Link>
            <Link to="/refund-and-cancellation-policy">Refunds</Link>
            <Link to="/terms-and-conditions">Terms</Link>
            <Link to="/privacy-policy">Privacy</Link>
          </div>
          <div className="fm-copy">© 2026 The Artspire · Lucknow, India</div>
        </div>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  useSiteMotion();
  return (
    <div className="tas">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <div className="totop" id="totop">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <div className="cursor-ring" id="cring"></div>
    </div>
  );
}
