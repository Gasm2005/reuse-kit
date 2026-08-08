import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Beig Estates collects, uses, and protects your information.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main id="main-content">
      <section className="py-16">
        <div className="container-page">
          <h1 className="font-extrabold text-3xl mb-2">Privacy Policy</h1>
          <p className="text-sm text-ink-soft mb-10">Last updated: July 2026</p>

          <div className="space-y-6 text-sm leading-relaxed">
            <div>
              <h2 className="font-semibold text-base mb-2">What We Collect</h2>
              <p>
                When you submit an enquiry through our website, we collect
                your name, mobile number, city, the service you&apos;re
                interested in, your budget range, timeline, and any
                additional notes you choose to share.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">How We Use It</h2>
              <p>
                We use this information solely to understand your property
                requirement and connect you with the right listing or
                consultation. We do not sell or share your information with
                unrelated third parties.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">How We Store It</h2>
              <p>
                Your enquiry details are stored securely in our database
                (Supabase) and are only accessible to authorized Beig Estates
                team members through a password-protected admin panel.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Contact Methods</h2>
              <p>
                We may reach out to you via the mobile number, email, or
                WhatsApp you provide to discuss your requirement further.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Your Rights</h2>
              <p>
                You can request that we delete your enquiry data at any time
                by contacting us directly via WhatsApp, phone, or email — see
                our Contact section on the homepage.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">Contact Us</h2>
              <p>
                For any questions about this policy or your data, reach out
                at{" "}
                <a href="mailto:kaifbegmirza7497@gmail.com" className="text-brass">
                  kaifbegmirza7497@gmail.com
                </a>{" "}
                or call{" "}
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
