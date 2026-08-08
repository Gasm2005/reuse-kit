import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | The Artspire" },
      {
        name: "description",
        content: "Shipping, returns, care, and how commissions work at The Artspire.",
      },
    ],
    // FAQPage structured data — lets Google show FAQ rich results and helps
    // answer engines (SearchGPT, Perplexity, AI Overviews) extract Q&A.
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does a commission take?",
    a: "It depends on the medium — pencil sketches take 5–7 days, paintings 10–14. You'll always get a timeline with your quote before we begin.",
  },
  {
    q: "Do you ship across India? Internationally?",
    a: "Yes — insured shipping across India, dispatched in 3–5 business days for ready-made pieces. Shipping is calculated at checkout from the weight and size of your piece. We do not ship internationally yet.",
  },
  {
    q: "How are fragile pieces packed?",
    a: "Clay, cement, mirror and glass pieces are hand-packed in protective, recyclable materials and shipped insured, so they arrive exactly as they left the studio.",
  },
  {
    q: "What is your return policy?",
    a: "Ready-made shop pieces can be returned within 7 days if unused and undamaged. Bespoke commissions are made to order and can't be returned, which is why we approve every detail with you before starting.",
  },
  {
    q: "How do I care for my piece?",
    a: "Most pieces need only a gentle wipe with a dry, soft cloth. Avoid moisture and direct sunlight. Specific care notes come with each order.",
  },
  {
    q: "How do payments work?",
    a: "Shop pieces are paid at checkout. For commissions, you approve the approach and quote first — no payment until you're happy with the plan.",
  },
  {
    q: "Can I order in bulk or for an event?",
    a: "Absolutely. We take corporate and gifting programmes with dedicated timelines — reach out via the contact page.",
  },
];

function FaqPage() {
  return (
    <SiteChrome>
      <div className="wrap page-hero">
        <span className="eyebrow rv">Good to know</span>
        <h1 className="reveal-words">
          Questions, <em>answered</em>.
        </h1>
        <p className="rv d2">Shipping, returns, care, and how commissions work.</p>
      </div>

      <section style={{ paddingTop: 10 }}>
        <div className="wrap faq rv">
          {FAQS.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <div className="body">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="exclusive">
        <div className="exc-border"></div>
        <div className="wrap" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <span className="eyebrow rv">Still curious?</span>
          <h2 className="reveal-words" style={{ margin: "14px 0 26px" }}>
            We're a message away.
          </h2>
          <Link className="btn btn-gold rv d2" to="/contact">
            <span>Contact the studio</span>
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
