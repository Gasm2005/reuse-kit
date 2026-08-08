import type { ReactNode } from "react";
import { SiteChrome } from "@/components/site/SiteChrome";

// Shared shell for the policy pages (Task 5). These exist because Razorpay
// KYC/activation and the Consumer Protection (E-Commerce) Rules, 2020 require
// them. Every page carries the same draft notice — they are drafts for the
// owner's review, NOT legal advice.

export const LEGAL_CONTACT = {
  business: "The Artspire",
  city: "Lucknow, Uttar Pradesh, India",
  email: "hello@theartspire.com",
  phone: "+91 74086 90994",
  hours: "Monday–Saturday, 9am–9pm IST",
};

export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <SiteChrome>
      <div className="wrap page-hero">
        <span className="eyebrow rv">Policies</span>
        <h1 className="reveal-words">{title}</h1>
        <p className="rv">{intro}</p>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div
            className="rv"
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#8a6a00",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 12.5,
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            <b>Draft for review — not legal advice.</b> This policy was prepared as a starting point
            and has not been reviewed by a lawyer. Please read it, correct anything that
            doesn&apos;t match how the studio actually operates, and resolve every{" "}
            <code>[NEEDS CONFIRMATION]</code> note before relying on it.
          </div>

          <div className="legal-prose rv">
            {children}

            <h2>Contact us</h2>
            <p>
              {LEGAL_CONTACT.business}
              <br />
              {LEGAL_CONTACT.city}
              <br />
              Email: <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>
              <br />
              Phone / WhatsApp:{" "}
              <a href={`tel:${LEGAL_CONTACT.phone.replace(/\s/g, "")}`}>{LEGAL_CONTACT.phone}</a>
              <br />
              Hours: {LEGAL_CONTACT.hours}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--stone)" }}>Last updated: {updated}</p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
