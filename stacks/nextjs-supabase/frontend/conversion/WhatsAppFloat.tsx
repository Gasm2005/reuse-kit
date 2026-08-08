"use client";

import { usePathname } from "next/navigation";
import { SITE, waLink } from "@/lib/site";
import { IconPhone, IconWhatsApp } from "./Icons";

// WhatsApp brand green next to a gold-and-champagne palette was the loudest
// thing on the page. Both buttons use the site's own colours instead — the
// icon still says WhatsApp without importing the green.
export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const phone = SITE.phones[0];

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3">
      <a
        href={`tel:${phone.tel}`}
        aria-label={`Call ${phone.display}`}
        className="group w-13 h-13 p-3.5 rounded-full surface-dark text-brass-bright flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:text-paper"
      >
        <IconPhone className="w-6 h-6 transition-transform duration-300 group-hover:-rotate-12" />
      </a>
      <a
        href={waLink(phone.wa)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group w-13 h-13 p-3.5 rounded-full bg-ink text-paper flex items-center justify-center shadow-e3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brass"
      >
        <IconWhatsApp className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
}
