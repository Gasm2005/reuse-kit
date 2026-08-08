import { SectionLabel } from "./ProblemSolution";
import EnquiryForm from "./EnquiryForm";
import { SITE, waLink } from "@/lib/site";
import { IconPhone, IconWhatsApp, IconMail, IconPin } from "./Icons";

// This section is used on both the homepage (below Hero's own h1, so this
// heading is an h2) and on /contact (where it's the only heading on the
// page — headingTag="h1" is passed there). `headless` still exists for the
// rare case a caller wants neither.
export default function Contact({
  headless = false,
  headingTag = "h2",
}: {
  headless?: boolean;
  headingTag?: "h1" | "h2";
}) {
  const Heading = headingTag;

  return (
    <section id="contact" className="py-16 sm:py-20 bg-paper">
      <div className="container-page">
        {!headless && (
          <div className="max-w-2xl mb-12">
            <SectionLabel>Get Started</SectionLabel>
            <Heading className="font-extrabold text-3xl sm:text-4xl leading-tight mb-5">
              Tell us what you&apos;re looking for.
            </Heading>
            <p className="text-ink-soft leading-relaxed">
              Fill in the form and we&apos;ll come back to you, or skip it and
              call — whichever&apos;s easier.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-start">
          <div className="surface-raised rounded-lg p-7 sm:p-9">
            <EnquiryForm />
          </div>

          <div className="space-y-4">
            <a
              href={waLink(SITE.phones[0].wa)}
              target="_blank"
              rel="noopener noreferrer"
              // Was bg-brass on paper — the mid gold went muddy against the
              // blush. Solid ink matches every other primary action.
              className="group flex items-center gap-4 p-6 rounded-lg bg-ink text-paper font-bold transition-colors duration-300 hover:bg-[#1C1009]"
            >
              <IconWhatsApp className="w-6 h-6 shrink-0" />
              <span className="flex-1">Message us on WhatsApp</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>

            <div className="surface rounded-lg divide-y divide-ink/8">
              {SITE.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="group flex items-center gap-4 p-5 transition-colors hover:bg-paper/70"
                >
                  <IconPhone className="w-5 h-5 text-brass shrink-0" />
                  <span className="font-semibold transition-colors group-hover:text-brass">
                    {p.display}
                  </span>
                </a>
              ))}
              <a
                href={`mailto:${SITE.email}?subject=Property%20Requirement`}
                className="group flex items-center gap-4 p-5 transition-colors hover:bg-paper/70"
              >
                <IconMail className="w-5 h-5 text-brass shrink-0" />
                <span className="text-sm break-all transition-colors group-hover:text-brass">
                  {SITE.email}
                </span>
              </a>
            </div>

            <div className="rounded-lg overflow-hidden surface">
              <div className="flex items-start gap-4 p-6">
                <IconPin className="w-5 h-5 text-brass shrink-0 mt-1" />
                <div>
                  <p className="font-bold mb-1">{SITE.address.line}</p>
                  <p className="text-sm text-ink-soft">
                    {SITE.address.city}, {SITE.address.state}
                  </p>
                </div>
              </div>

              {/* The bare embed shows Google's own chrome — "Open in Maps",
                  keyboard shortcuts, "Report a map error". Muting it and
                  putting our own link over the top keeps the panel ours,
                  and the overlay passes clicks through to the map. */}
              <div className="relative">
                <iframe
                  src={SITE.mapsEmbed}
                  width="100%"
                  height="240"
                  style={{ border: 0, filter: "saturate(0.75) contrast(0.95)" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Beig Estates location — ${SITE.address.line}, ${SITE.address.city}`}
                  className="block"
                />
                <a
                  href={SITE.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-ink text-paper text-sm font-bold shadow-e2 transition-colors duration-300 hover:bg-[#1C1009]"
                >
                  Get directions
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
