import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Share your property requirement with Beig Estates — WhatsApp, call, email, or the form below.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    url: "/contact",
    title: "Contact Beig Estates",
    description: "Share your property requirement with Beig Estates — WhatsApp, call, email, or the form below.",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* Contact's own heading is the page's h1 now that PageHeader's
            breadcrumb block is gone — no longer rendered headless. The
            homepage's copy of this section stays an h2 (its default). */}
        <Contact headingTag="h1" />
      </main>
      <Footer />
    </>
  );
}
