import { SITE } from "@/lib/site";
import { IconHandshake, IconPin, IconEye, IconDoc } from "./Icons";
import Reveal from "./Reveal";

// Four tan cards with a large icon tile, matching the reference's "Why Choose
// Us" block. The previous version was loose text with 24px icons floating
// beside it, which read as a bulleted list rather than a section.
//
// Each reason is something a visitor can check for themselves — an address
// they can walk to, numbers they can dial, listings they can open — rather
// than an unbacked claim like "verified listings".
const reasons = [
  {
    Icon: IconHandshake,
    title: "One person, start to finish",
    desc: "The same person who picks up your first call handles the site visits, the negotiation, and the paperwork.",
  },
  {
    Icon: IconPin,
    title: "An office you can walk into",
    desc: `We work out of ${SITE.address.line}, ${SITE.address.city}. Come by, or ask us to meet you at the property.`,
  },
  {
    Icon: IconEye,
    title: "Only what we're handling",
    desc: "Everything here is a property we're currently working on — not a scraped feed of listings that sold last season.",
  },
  {
    Icon: IconDoc,
    title: "Terms before money moves",
    desc: "Brokerage, timelines, and what's included get spelled out upfront, so nothing is renegotiated later.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 sm:py-24 bg-paper">
      <div className="container-page">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-extrabold text-4xl sm:text-5xl leading-[1.15] tracking-tight mb-5">
              Why Work With Us
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Elevating your property search with local knowledge, straight
              answers, and one point of contact who has to see it through.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className="surface-tan lift rounded-xl p-7 h-full">
                <div className="w-[68px] h-[68px] rounded-lg bg-shell text-ink flex items-center justify-center mb-7">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 leading-snug">{title}</h3>
                <p className="text-ink-soft leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-14 surface rounded-xl px-8 py-7 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
            <p className="text-ink-soft">
              Two direct lines — no call centre, no extension.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {SITE.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="text-lg font-bold hover:text-brass transition-colors"
                >
                  {p.display}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
