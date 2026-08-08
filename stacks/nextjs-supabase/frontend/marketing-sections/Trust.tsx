import { SectionLabel } from "./ProblemSolution";

const items = [
  {
    title: "One Dedicated Contact",
    desc: "You deal directly with us throughout — no handoffs between multiple agents.",
  },
  {
    title: "Verified Listings",
    desc: "Every property listed is genuine and currently available — no outdated or already-sold listings.",
  },
  {
    title: "Direct Line to Us",
    desc: "Questions along the way? You reach a person, not a support ticket queue.",
  },
];

export default function Trust() {
  return (
    <section id="trust" className="py-20">
      <div className="container-page">
        <SectionLabel>Why Trust This</SectionLabel>
        <h2 className="font-extrabold text-3xl mb-4 max-w-xl">
          Built for accountability, not volume.
        </h2>
        <p className="text-ink-soft max-w-xl leading-relaxed mb-12">
          We&apos;re not a listings portal flooding you with unqualified
          options. Every client is handled individually.
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.title}>
              <h4 className="text-base font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-brass rounded-full inline-block shrink-0" />
                {item.title}
              </h4>
              <p className="text-sm text-ink-soft leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
