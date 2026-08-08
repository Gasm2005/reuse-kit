import { SectionLabel } from "./ProblemSolution";

const faqs = [
  {
    q: "What areas in Lucknow does Beig Estates cover?",
    a: "Beig Estates currently serves clients across Lucknow, including areas like Gomti Nagar, Hazratganj, and Sushant Golf City, for buying, renting, and selling flats, plots, and villas.",
  },
  {
    q: "Does Beig Estates charge buyers or renters any upfront fee?",
    a: "No. Sharing your property requirement with Beig Estates is completely free. There is no fee to browse listings or submit an enquiry.",
  },
  {
    q: "What types of properties does Beig Estates handle?",
    a: "Beig Estates handles residential flats, villas, and plots for both buying/selling and renting, as well as coordination for interior design requirements.",
  },
  {
    q: "How does the process work with Beig Estates?",
    a: "You share your requirement (property type, city, and budget), Beig Estates shortlists matching listings and arranges a visit or consultation, then handles negotiation and paperwork through to closing.",
  },
  {
    q: "How can I contact Beig Estates?",
    a: "You can reach Beig Estates via WhatsApp, phone call, email, or by submitting the enquiry form directly on the website.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-shell">
      <div className="max-w-3xl mx-auto px-6">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="font-extrabold text-3xl mb-10">
          Common questions.
        </h2>

        <div className="space-y-6">
          {faqs.map((item) => (
            <div key={item.q} className="border-b border-ink/10 pb-6">
              <h3 className="font-semibold text-base mb-2">{item.q}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
