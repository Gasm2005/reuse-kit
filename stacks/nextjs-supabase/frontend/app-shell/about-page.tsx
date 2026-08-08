import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Trust from "@/components/Trust";
import FAQ from "@/components/FAQ";
import { SectionLabel } from "@/components/ProblemSolution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "How Beig Estates works, and why clients trust us for property advisory in Lucknow.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    url: "/about",
    title: "About Beig Estates",
    description: "How Beig Estates works, and why clients trust us for property advisory in Lucknow.",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* A short, calm intro instead of a breadcrumb block plus the old
            combative "typical search vs. us" comparison table — that read
            as a landing-page pitch, not company information. */}
        <section className="py-16 sm:py-20 bg-paper">
          <div className="container-page max-w-2xl">
            <SectionLabel>About</SectionLabel>
            <h1 className="font-extrabold text-3xl sm:text-4xl mb-5">
              One dedicated point of contact, from first call to keys.
            </h1>
            <p className="text-ink-soft leading-relaxed">
              Beig Estates handles property buying, selling, renting, and
              interior coordination in Lucknow. No handing your enquiry
              between five agents — the person who answers your first call
              sees it through to the end.
            </p>
          </div>
        </section>

        <Services />
        <HowItWorks />
        <Trust />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
