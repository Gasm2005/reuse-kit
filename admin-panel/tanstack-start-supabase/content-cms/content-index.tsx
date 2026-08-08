import { createFileRoute } from "@tanstack/react-router";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import {
  HOMEPAGE_SECTIONS,
  ABOUT_SECTIONS,
  CONTACT_SECTIONS,
  FOOTER_SECTIONS,
  WEBSITE_PAGES,
} from "@/lib/website-content";
import { FileText, Home, Info, Mail, Footprints, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/website-content/")({
  component: WebsiteContentPage,
});

const pageConfigs = [
  {
    slug: "homepage",
    name: "Homepage",
    description: "Hero, services, categories, testimonials, CTA sections",
    icon: Home,
    route: "/admin/website-content/homepage",
    sections: HOMEPAGE_SECTIONS,
  },
  {
    slug: "about",
    name: "About Us",
    description: "Hero, story, mission, vision, team",
    icon: Info,
    route: "/admin/website-content/about",
    sections: ABOUT_SECTIONS,
  },
  {
    slug: "contact",
    name: "Contact",
    description: "Phone, email, address, social links, hours",
    icon: Mail,
    route: "/admin/website-content/contact",
    sections: CONTACT_SECTIONS,
  },
  {
    slug: "footer",
    name: "Footer",
    description: "Brand, links, contact, copyright, social icons",
    icon: Footprints,
    route: "/admin/website-content/footer",
    sections: FOOTER_SECTIONS,
  },
];

function WebsiteContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
          Website Content
        </h1>
        <p className="font-body text-[13px] text-stone mt-0.5">
          Manage all text, images, and content on every page
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pageConfigs.map((page) => {
          const Icon = page.icon;
          return (
            <a
              key={page.slug}
              href={page.route}
              className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:border-forest/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-[18px] text-forest font-medium">
                      {page.name}
                    </h2>
                    <ChevronRight
                      size={16}
                      className="text-stone/40 group-hover:text-forest transition-colors"
                    />
                  </div>
                  <p className="font-body text-[13px] text-stone mt-1">{page.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {page.sections.slice(0, 4).map((section) => (
                      <span
                        key={section.slug}
                        className="inline-block px-2 py-0.5 rounded-md bg-cream font-body text-[10px] text-stone font-medium"
                      >
                        {section.name}
                      </span>
                    ))}
                    {page.sections.length > 4 && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-cream font-body text-[10px] text-stone/60 font-medium">
                        +{page.sections.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Global content note */}
      <div className="bg-forest/5 rounded-2xl border border-forest/10 p-5">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-forest mt-0.5 shrink-0" />
          <div>
            <h3 className="font-body text-[14px] font-bold text-forest">
              How Website Content Works
            </h3>
            <p className="font-body text-[13px] text-stone mt-1 leading-relaxed">
              Every piece of text, every image, and every link on your website is stored in the
              database. Click on a page above to edit its content. Changes are reflected immediately
              on the public site. No code changes needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
