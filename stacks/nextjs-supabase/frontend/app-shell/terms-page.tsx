import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing the use of the Beig Estates website and services.",
  alternates: {
    canonical: "/terms",
  },
};

export default function Terms() {
  return (
    <>
      <Navbar />
      <main id="main-content">
      <section className="py-16">
        <div className="container-page">
          <h1 className="font-extrabold text-3xl mb-2">Terms of Service</h1>
          <p className="text-sm text-ink-soft mb-10">Last updated: July 2026</p>

          <div className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="font-semibold text-base mb-2">About This Website</h2>
              <p>
                This website is operated by Beig Estates, a real estate and
                property advisory service based in Lucknow, India. By
                submitting an enquiry through this site, you agree to these
                terms.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Listings</h2>
              <p>
                Property listings shown on this site are provided for
                informational purposes and are subject to availability.
                Prices, availability, and details may change without notice.
                Please confirm all details directly with us before making
                any decisions.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">No Guarantee of Outcome</h2>
              <p>
                Submitting an enquiry does not guarantee a successful
                transaction. Beig Estates acts as an advisory and
                facilitation service; all final agreements are between the
                buyer, seller, or renting parties involved.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Accurate Information</h2>
              <p>
                You agree to provide accurate contact and requirement details
                when submitting an enquiry, so we can assist you effectively.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Changes</h2>
              <p>
                We may update these terms from time to time. Continued use of
                this website after changes means you accept the updated
                terms.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Contact Us</h2>
              <p>
                Questions about these terms can be directed to{" "}
                <a href="mailto:kaifbegmirza7497@gmail.com" className="text-brass">
                  kaifbegmirza7497@gmail.com
                </a>{" "}
                or{" "}
                <a href="tel:+917497937625" className="text-brass">
                  +91 74979 37625
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
