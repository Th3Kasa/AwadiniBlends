import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Awadini. Questions about our luxury car fragrance oils, orders, or stockist enquiries — we reply within 24–48 hours.",
  alternates: {
    canonical: "https://awadini.vercel.app/contact",
  },
  openGraph: {
    type: "website",
    url: "https://awadini.vercel.app/contact",
    title: "Contact Us | Awadini",
    description:
      "Get in touch with Awadini. Questions about our luxury car fragrance oils, orders, or stockist enquiries.",
  },
};

export default function ContactPage() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Get in Touch
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-mahogany tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-mahogany/90 text-sm leading-relaxed">
            Questions about our collection, custom orders, or stockist
            enquiries? We'd love to hear from you.
          </p>
        </div>

        <ContactForm />

        <div className="mt-12 pt-10 border-t border-mahogany/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gold"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <h3 className="font-sans font-semibold text-sm text-mahogany tracking-wider uppercase">Based In</h3>
            </div>
            <p className="text-mahogany/90 text-sm">
              Australia
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gold"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h3 className="font-sans font-semibold text-sm text-mahogany tracking-wider uppercase">Response Time</h3>
            </div>
            <p className="text-mahogany/90 text-sm">
              We respond within 24–48 hours
              <br />
              Mon–Fri, AEST
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
