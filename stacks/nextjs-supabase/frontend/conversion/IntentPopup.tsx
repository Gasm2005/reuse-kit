"use client";

import { useState, useEffect, useRef } from "react";
import { IconButton } from "./Button";
import { IconHouse, IconKey, IconDoc, IconBuilding } from "./Icons";

const options = [
  { label: "I want to Buy", service: "Buy Property", Icon: IconHouse },
  { label: "I want to Sell", service: "Sell Property", Icon: IconKey },
  { label: "I want to Rent", service: "Rent Property (Looking to Rent)", Icon: IconDoc },
  { label: "I want to List for Rent", service: "List Property for Rent", Icon: IconBuilding },
];

export default function IntentPopup() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Uses sessionStorage only (browser memory, cleared when the tab closes).
    // Nothing is sent to a server and no tracking cookie is set, so no
    // cookie-consent banner is required for this.
    const alreadyShown = sessionStorage.getItem("beig_intent_shown");
    if (alreadyShown) return;

    let triggered = false;

    function trigger() {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
    }

    // Trigger on scroll intent (~25% down the page) instead of immediately,
    // with a longer fallback timer for visitors who don't scroll at all.
    function onScroll() {
      const scrolled = window.scrollY;
      const threshold = window.innerHeight * 0.25;
      if (scrolled > threshold) trigger();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    const fallback = setTimeout(trigger, 4000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fallback);
    };
  }, []);

  // Focus the close button when opened, and handle Escape to close
  useEffect(() => {
    if (!visible) return;
    closeBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
      // Basic focus trap within the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    sessionStorage.setItem("beig_intent_shown", "true");
    setVisible(false);
  }

  function choose(service: string) {
    sessionStorage.setItem("beig_intent_shown", "true");
    sessionStorage.setItem("beig_intent_service", service);
    setVisible(false);
    window.location.href = "/contact";
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-[2px] px-4 pb-4 sm:pb-4"
      onClick={dismiss}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intent-popup-title"
        className="w-full max-w-md surface-raised rounded-xl p-7 relative animate-[fadeIn_0.2s_ease-out]"
      >
        <IconButton
          ref={closeBtnRef}
          label="Close"
          onClick={dismiss}
          size="sm"
          className="absolute top-4 right-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </IconButton>

        <p className="label text-brass mb-2">Quick question</p>
        <h3 id="intent-popup-title" className="font-extrabold text-xl mb-6">
          What brings you here today?
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {options.map(({ label, service, Icon }) => (
            <button
              key={service}
              onClick={() => choose(service)}
              className="text-left p-4 rounded-lg border-[1.5px] border-ink/12 hover:border-brass hover:bg-brass/5 transition-colors"
            >
              <Icon className="w-6 h-6 text-brass mb-2" />
              <div className="text-sm font-bold">{label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={dismiss}
          className="w-full mt-4 text-sm text-ink-soft hover:text-ink py-2 transition-colors"
        >
          Just browsing, skip this
        </button>
      </div>
    </div>
  );
}
