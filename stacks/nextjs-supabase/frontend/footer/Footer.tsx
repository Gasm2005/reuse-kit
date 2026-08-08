import Link from "next/link";
import { SITE } from "@/lib/site";
import { IconPin, IconPhone, IconMail } from "./Icons";

const explore = [
  { href: "/listings?type=Flat", label: "Flats" },
  { href: "/listings?type=Villa", label: "Villas" },
  { href: "/listings?type=Plot", label: "Plots" },
  { href: "/listings?type=Rent", label: "For Rent" },
  { href: "/listings?type=Interior", label: "Interiors" },
];

const company = [
  { href: "/about", label: "About Us" },
  { href: "/about#process", label: "How It Works" },
  { href: "/about#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-blueprint-deep text-paper mt-auto">
      <div className="container-page py-16 sm:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          <div className="lg:col-span-2 max-w-sm">
            <div className="font-extrabold text-2xl mb-4">
              {SITE.name}
            </div>
            <p className="text-paper/55 leading-relaxed mb-7">
              Real estate and property advisory in Lucknow — buying, selling,
              renting, and interior coordination, handled by one point of
              contact.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-paper/70">
                <IconPin className="w-[18px] h-[18px] text-brass-bright shrink-0 mt-1" />
                <span className="text-sm">
                  {SITE.address.line}
                  <br />
                  {SITE.address.city}, {SITE.address.state}
                </span>
              </div>
              {SITE.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="flex items-center gap-3 text-paper/70 hover:text-brass-bright transition-colors"
                >
                  <IconPhone className="w-[18px] h-[18px] text-brass-bright shrink-0" />
                  <span className="text-sm">{p.display}</span>
                </a>
              ))}
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 text-paper/70 hover:text-brass-bright transition-colors"
              >
                <IconMail className="w-[18px] h-[18px] text-brass-bright shrink-0" />
                <span className="text-sm break-all">{SITE.email}</span>
              </a>
            </div>
          </div>

          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Company" links={company} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-paper/40">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-paper/40 hover:text-paper/80 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-paper/40 hover:text-paper/80 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="label text-brass-bright mb-5">{title}</p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-2 text-sm text-paper/60 hover:text-paper transition-colors"
            >
              <span className="w-0 h-px bg-brass-bright transition-all duration-300 group-hover:w-3" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
