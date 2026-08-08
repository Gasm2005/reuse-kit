"use client";

import { SITE, waLink } from "@/lib/site";
import { Button, ButtonLink } from "./Button";
import { IconWhatsApp, IconMail } from "./Icons";

export default function EnquireAboutProperty({
  propertyTitle,
  propertyType,
}: {
  propertyTitle: string;
  propertyType: string;
}) {
  const waMessage = encodeURIComponent(
    `Hi, I'm interested in "${propertyTitle}" listed on Beig Estates. Could you share more details?`
  );

  function goToForm() {
    const service = propertyType === "Plot" ? "Buy Plot" : "Buy Property";
    sessionStorage.setItem("beig_intent_service", service);
    sessionStorage.setItem(
      "beig_intent_notes",
      `Interested in: ${propertyTitle}`
    );
    window.location.href = "/contact";
  }

  return (
    // Uses the shared Button so these match every other control on the site —
    // they were three differently-styled hand-rolled buttons before.
    <div className="surface rounded-xl p-7">
      <p className="label text-ink-soft mb-5">Interested in this property?</p>

      <div className="space-y-3">
        <Button onClick={goToForm} variant="secondary" className="w-full">
          Request full details
        </Button>

        <ButtonLink
          href={waLink(SITE.phones[0].wa, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          className="w-full"
        >
          <IconWhatsApp className="w-[18px] h-[18px]" />
          WhatsApp us
        </ButtonLink>

        <ButtonLink
          href={`mailto:${SITE.email}?subject=${encodeURIComponent(
            `Enquiry: ${propertyTitle}`
          )}`}
          variant="ghost"
          className="w-full"
        >
          <IconMail className="w-[18px] h-[18px]" />
          Email us
        </ButtonLink>
      </div>
    </div>
  );
}
