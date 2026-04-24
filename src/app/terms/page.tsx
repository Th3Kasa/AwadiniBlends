import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using the Awadini website and purchasing our handcrafted luxury car fragrance oils. Governed by NSW, Australia law.",
  alternates: {
    canonical: "https://awadini.vercel.app/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Legal
          </p>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-cream mb-2 tracking-wider uppercase">
            Terms &amp; Conditions
          </h1>
          <p className="text-cream/85 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-AU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-8 text-cream/90 leading-relaxed">
          <div className="glass-card p-6">
            <p className="text-cream/90 text-sm leading-relaxed">
              These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your
              use of the Awadini Fragrance Blends website and your purchase of
              products from us. By accessing this website or placing an order,
              you agree to be bound by these Terms. These Terms are governed by
              the laws of New South Wales, Australia.
            </p>
            <p className="text-cream/85 text-sm mt-3">
              Operated by:{" "}
              <strong className="text-cream">
                AWAD, DAVID MAHIR (Sole Trader)
              </strong>{" "}
              · ABN 60 669 962 543 · Liverpool NSW 2170
            </p>
          </div>

          <TermsSection title="1. Acceptance of Terms">
            <p>
              By visiting this website, browsing our products, or completing a
              purchase, you confirm that you are at least 18 years of age and
              that you accept these Terms in full. If you do not agree with
              these Terms, you must not use this website.
            </p>
            <p className="mt-2">
              We reserve the right to amend these Terms at any time. Updated
              Terms take effect from the date they are posted on this website.
              Continued use of the website after changes constitutes acceptance
              of the revised Terms.
            </p>
          </TermsSection>

          <TermsSection title="2. Products & Descriptions">
            <p>
              All Awadini Fragrance Blends products are handcrafted, 100%
              homemade perfume oils manufactured in small batches in South West
              Sydney, NSW, Australia. Products are{" "}
              <strong className="text-cream">made to order</strong> — each
              bottle is freshly blended and poured upon receipt of your
              confirmed order.
            </p>
            <p className="mt-2">
              We make every effort to accurately describe each product,
              including scent notes, concentration, and volume. However, scent
              perception is subjective and may vary between individuals. Product
              photographs are for illustrative purposes and actual products may
              vary slightly in appearance.
            </p>
            <p className="mt-2">
              Our perfume oils are not alcohol-based. They are designed for
              application directly to skin. Keep out of reach of children. Avoid
              contact with eyes. Discontinue use if irritation occurs. We
              recommend a patch test prior to full use.
            </p>
          </TermsSection>

          <TermsSection title="3. Pricing & Payment">
            <p>
              All prices are displayed in Australian Dollars (AUD) and are
              inclusive of GST where applicable. Prices are subject to change
              without notice. The price charged will be the price displayed at
              the time your order is placed.
            </p>
            <p className="mt-2">
              We offer free standard shipping to all addresses within Australia.
              No additional shipping fees will be added at checkout.
            </p>
            <p className="mt-2">
              Payment is processed securely via{" "}
              <strong className="text-cream">Square Payments</strong>. We
              accept major credit and debit cards. Your card details are
              tokenised and processed directly by Square — we never store or
              have access to your full card number. Square&rsquo;s processing is
              PCI-DSS compliant.
            </p>
            <p className="mt-2">
              Payment is taken in full at the time of order. Your order is
              confirmed only once payment has been successfully processed.
            </p>
          </TermsSection>

          <TermsSection title="4. Order Confirmation & Dispatch">
            <p>
              Upon successful payment, you will receive an order confirmation
              email. This email constitutes our acceptance of your order.
            </p>
            <p className="mt-2">
              As all products are made to order, please allow{" "}
              <strong className="text-cream">1–2 business days</strong> for
              preparation before dispatch. Orders placed before 2:00 PM AEST on
              a business day will typically be dispatched the following business
              day.
            </p>
            <p className="mt-2">
              Standard delivery within Australia is estimated at 3–7 business
              days depending on your location, subject to the carrier&rsquo;s
              conditions. We are not responsible for delays caused by the
              carrier or circumstances beyond our control.
            </p>
          </TermsSection>

          <TermsSection title="5. Returns & Refunds">
            <p>
              Our returns and refunds process is governed by our separate{" "}
              <Link
                href="/refund-policy"
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                Refund Policy
              </Link>
              , which forms part of these Terms and is incorporated herein by
              reference. In summary, as our products are made to order, we do
              not accept change-of-mind returns. Your rights under the
              Australian Consumer Law are preserved in full.
            </p>
          </TermsSection>

          <TermsSection title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, our total liability to
              you for any claim arising from your use of this website or
              purchase of our products is limited to the amount paid by you for
              the specific product(s) giving rise to the claim.
            </p>
            <p className="mt-2">
              We exclude all implied terms and warranties except those that
              cannot be excluded under the Australian Consumer Law. We are not
              liable for any indirect, incidental, consequential, or special
              loss or damage.
            </p>
            <p className="mt-2">
              Nothing in these Terms limits any right you have under the
              Australian Consumer Law.
            </p>
          </TermsSection>

          <TermsSection title="7. Intellectual Property">
            <p>
              All content on this website — including text, images, logos,
              product names, scent descriptions, design, and code — is the
              property of AWAD, DAVID MAHIR or its licensors and is protected
              by Australian and international intellectual property laws. You
              may not reproduce, distribute, or create derivative works from any
              content without our prior written consent.
            </p>
          </TermsSection>

          <TermsSection title="8. Privacy">
            <p>
              We collect personal information (name, email, address, phone
              number) solely for the purpose of processing your order,
              communicating with you, and fulfilling legal obligations. We do
              not sell or share your personal information with third parties
              except as required to process payment (Square), deliver your
              order (Australia Post or equivalent carrier), or comply with law.
            </p>
            <p className="mt-2">
              By placing an order, you consent to this use of your personal
              information. You may contact us at any time to access, correct,
              or request deletion of your personal data.
            </p>
          </TermsSection>

          <TermsSection title="9. Website Use">
            <p>
              You agree to use this website only for lawful purposes and in a
              manner that does not infringe the rights of others. You must not
              attempt to gain unauthorised access to any part of this website,
              use automated tools to scrape or index content, or engage in any
              conduct that could damage, disable, or impair the website.
            </p>
          </TermsSection>

          <TermsSection title="10. Third-Party Services">
            <p>
              This website uses third-party services including Square (payment
              processing), Cloudflare (bot protection), and Resend (email).
              These services are subject to their own terms of service and
              privacy policies. We are not responsible for the conduct or
              availability of third-party services.
            </p>
          </TermsSection>

          <TermsSection title="11. Governing Law & Jurisdiction">
            <p>
              These Terms are governed by and construed in accordance with the
              laws of New South Wales, Australia. Any dispute arising out of or
              in connection with these Terms shall be subject to the exclusive
              jurisdiction of the courts of New South Wales.
            </p>
          </TermsSection>

          <TermsSection title="12. Contact">
            <p>
              For any questions regarding these Terms, please contact us via our{" "}
              <Link
                href="/contact"
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                contact form
              </Link>{" "}
              or write to:
            </p>
            <div className="mt-3 p-4 bg-smoke/50 rounded-lg text-cream/85 text-sm">
              <p>AWAD, DAVID MAHIR (Sole Trader)</p>
              <p>Awadini Fragrance Blends</p>
              <p>ABN: 60 669 962 543</p>
              <p>Liverpool, NSW 2170, Australia</p>
            </div>
          </TermsSection>
        </div>
      </div>
    </section>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-sans font-semibold text-base text-cream mb-3 tracking-wider uppercase">{title}</h2>
      <div className="text-cream/85 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
