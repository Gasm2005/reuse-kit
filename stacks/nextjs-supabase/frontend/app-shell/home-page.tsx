import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Credentials from "@/components/Credentials";
import FeaturedListings from "@/components/FeaturedListings";
import Localities from "@/components/Localities";
import WhyUs from "@/components/WhyUs";
import Story from "@/components/Story";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const revalidate = 60;

// Order is deliberate: show properties before making claims. The page used to
// go hero → copy → copy → form without a single listing on it, which is the
// first thing anyone actually scrolls for.
export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* QuickExplore used to sit here — five category tiles directly under
            a search bar that already has a Type dropdown. 315px doing the
            same job twice. The footer still links every category. */}
        <Hero />
        <Credentials />
        <FeaturedListings />
        <Localities />
        <WhyUs />
        <Story />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
