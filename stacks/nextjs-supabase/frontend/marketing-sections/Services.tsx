import { SectionLabel } from "./ProblemSolution";
import { IconHouse, IconHandshake, IconKey, IconSofa } from "./Icons";

const services = [
  {
    Icon: IconHouse,
    title: "Buying Assistance",
    desc: "From shortlisting to site visits to closing — we help you buy the right flat, villa, or plot with confidence.",
  },
  {
    Icon: IconHandshake,
    title: "Selling & Listing",
    desc: "List your property with us and reach genuinely interested buyers, with support through negotiation and paperwork.",
  },
  {
    Icon: IconKey,
    title: "Rental Services",
    desc: "Whether you're looking to rent or list a property for rent, we match tenants and owners without the usual runaround.",
  },
  {
    Icon: IconSofa,
    title: "Interior Coordination",
    desc: "Need interior work done on a new or existing property? We help connect and coordinate the right people for it.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-paper">
      <div className="container-page">
        <SectionLabel>Our Services</SectionLabel>
        <h2 className="font-extrabold text-3xl mb-4 max-w-xl">
          What we help you with.
        </h2>
        <p className="text-ink-soft max-w-xl leading-relaxed mb-12">
          Whether you&apos;re buying, selling, renting, or getting a space
          fitted out — here&apos;s where we come in.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {services.map(({ Icon, title, desc }) => (
            <div key={title} className="surface lift rounded-md p-7">
              <div className="w-12 h-12 rounded-md bg-brass/10 text-brass flex items-center justify-center mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2.5">{title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
