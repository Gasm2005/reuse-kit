import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beig Estates — Real Estate & Property Advisory in Lucknow",
    template: "%s | Beig Estates",
  },
  description:
    "Buying, renting, or selling property in Lucknow? Beig Estates helps you find flats, plots, and villas, negotiate the right price, and close without the runaround.",
  keywords: [
    "real estate agent Lucknow",
    "property dealer Lucknow",
    "flats for sale Lucknow",
    "plots for sale Lucknow",
    "buy property Lucknow",
    "rent property Lucknow",
    "Beig Estates",
  ],
  authors: [{ name: "Beig Estates" }],
  openGraph: {
    title: "Beig Estates — Real Estate & Property Advisory in Lucknow",
    description:
      "Find flats, plots, and villas in Lucknow with a dedicated point of contact from enquiry to closed deal.",
    url: SITE_URL,
    siteName: "Beig Estates",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beig Estates — Real Estate & Property Advisory in Lucknow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beig Estates — Real Estate & Property Advisory in Lucknow",
    description:
      "Find flats, plots, and villas in Lucknow with a dedicated point of contact from enquiry to closed deal.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Beig Estates",
              description:
                "Real estate and property advisory helping clients buy, rent, and sell flats, plots, and villas in Lucknow.",
              url: SITE_URL,
              telephone: "+91-7497937625",
              areaServed: {
                "@type": "City",
                name: "Lucknow",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lucknow",
                addressRegion: "Uttar Pradesh",
                addressCountry: "IN",
              },
              sameAs: [],
            }),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-paper focus:text-ink focus:px-4 focus:py-2 focus:rounded font-bold text-sm"
        >
          Skip to main content
        </a>
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  );
}
