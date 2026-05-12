import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Awadini refund and returns policy for made-to-order luxury car fragrance oils. Your rights under Australian Consumer Law are fully preserved.",
  alternates: {
    canonical: "https://awadini.vercel.app/refund-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyPage() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Legal
          </p>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-mahogany mb-2 tracking-wider uppercase">
            Refund Policy
          </h1>
          <p className="text-mahogany/70 text-sm">
            Last updated: {new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-mahogany leading-relaxed">

          <div className="glass-card p-6">
            <p className="text-mahogany text-sm leading-relaxed">
              This Refund Policy applies to all purchases made from Awadini
              Fragrance Blends, operated by{" "}
              <strong className="text-mahogany">AWAD, DAVID MAHIR</strong> (Sole
              Trader), ABN 60 669 962 543, Liverpool NSW 2170 (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, or &ldquo;our&rdquo;). Our rights and obligations
              are governed by the{" "}
              <em>Australian Consumer Law</em> (ACL), Schedule 2 of the{" "}
              <em>Competition and Consumer Act 2010</em> (Cth).
            </p>
          </div>

          <PolicySection title="1. Made-to-Order Products">
            <p>
              All Awadini Fragrance Blends products are{" "}
              <strong className="text-mahogany">made to order</strong>. Each bottle
              is individually blended, poured, and sealed by hand in small
              batches specifically upon receipt of your order. Because our
              products are custom-made to your order, we do not accept returns
              or issue refunds for change of mind.
            </p>
            <p className="mt-3">
              This exclusion is consistent with your rights under the Australian
              Consumer Law, which permits merchants to decline change-of-mind
              refunds on goods that are custom-made or personalised to a
              consumer&rsquo;s specifications.
            </p>
          </PolicySection>

          <PolicySection title="2. Your Rights Under Australian Consumer Law">
            <p>
              Notwithstanding the above, our goods come with guarantees that
              cannot be excluded under the Australian Consumer Law. You are
              entitled to a replacement or refund for a major failure, and
              compensation for any other reasonably foreseeable loss or damage.
              You are also entitled to have the goods repaired or replaced if
              the goods fail to be of acceptable quality and the failure does
              not amount to a major failure.
            </p>
            <p className="mt-3">
              A product failure may include (but is not limited to):
            </p>
            <ul className="mt-2 ml-4 space-y-1 list-disc list-outside text-mahogany">
              <li>The product is not of acceptable quality (e.g., contaminated, spoiled, or completely odourless when it should not be).</li>
              <li>
                The product does not match an <strong className="text-mahogany">objective, verifiable</strong> attribute stated on our website — such as volume (e.g., 8ml), bottle type, or the specific named scent delivered. Descriptions of fragrance character (e.g., &ldquo;warm&rdquo;, &ldquo;rich&rdquo;, &ldquo;floral&rdquo;) are illustrative and reflect the experience of the majority of customers. Because scent perception is subjective and varies between individuals, a personal dislike of or difference in scent experience does not constitute a product mismatch and is not grounds for a claim under this clause.
              </li>
              <li>The product arrives damaged due to a fault in packaging or transit handling on our part.</li>
              <li>The product leaks due to a manufacturing defect in the bottle or applicator.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. How to Make a Claim">
            <p>
              If you believe your product is defective or does not match an objective attribute stated on our website, you must notify us within{" "}
              <strong className="text-mahogany">7 calendar days</strong> of
              receiving your order. Claims submitted after this period will not be accepted. To make a valid claim, all of the following are required:
            </p>
            <ol className="mt-3 ml-4 space-y-2 list-decimal list-outside text-mahogany/85">
              <li>
                Contact us via our{" "}
                <Link
                  href="/contact"
                  className="text-gold hover:text-gold-light underline underline-offset-2"
                >
                  contact form
                </Link>{" "}
                with your order number and a clear description of the specific defect.
              </li>
              <li>
                Attach <strong className="text-mahogany">clear photographs</strong> of the product, the label, and the original packaging. Claims submitted without photographic evidence will not be assessed.
              </li>
              <li>
                The product must be <strong className="text-mahogany">substantially unused</strong>. Products that have been used, partially emptied, or tampered with are not eligible for a claim.
              </li>
              <li>
                We reserve the right to request the return of the product before issuing any remedy. Return shipping will be reimbursed only if the claim is upheld.
              </li>
              <li>
                We will assess your claim within 3 business days of receiving all required information and advise you of the outcome.
              </li>
            </ol>
            <p className="mt-3 text-mahogany/70 text-xs italic">
              We take all claims seriously. Submitting a false or misleading claim may result in refusal of the claim and reporting to relevant consumer protection authorities.
            </p>
          </PolicySection>

          <PolicySection title="4. Remedies">
            <p>
              Upon assessment, we will offer one of the following remedies
              based on the nature of the defect:
            </p>
            <ul className="mt-3 ml-4 space-y-2 list-disc list-outside text-mahogany/85">
              <li>
                <strong className="text-mahogany">Major failure:</strong> You may
                choose a full refund to your original payment method or a
                replacement product of equal value.
              </li>
              <li>
                <strong className="text-mahogany">Minor defect:</strong> We will
                offer a replacement product. If replacement is not reasonably
                possible, a partial or full refund will be issued at our
                discretion.
              </li>
            </ul>
            <p className="mt-3">
              Return shipping costs for defective goods will be reimbursed by
              us upon presentation of a receipt.
            </p>
          </PolicySection>

          <PolicySection title="5. Non-Returnable Situations">
            <p>We are unable to offer a refund or replacement where:</p>
            <ul className="mt-3 ml-4 space-y-1 list-disc list-outside text-mahogany/85">
              <li>You have changed your mind about the purchase.</li>
              <li>You chose the wrong scent.</li>
              <li>You dislike the scent, or find it different from your expectation — fragrance perception is personal and subjective.</li>
              <li>The scent strength or character differs from your preference — our descriptions are illustrative and based on the general experience of our customers.</li>
              <li>The product has been used (partially or fully).</li>
              <li>
                The issue arises from abnormal use, storage, or application
                (e.g., extreme heat exposure, direct skin application, mixing with other products).
              </li>
              <li>You were aware of the issue before purchasing.</li>
              <li>The claim is made more than 7 calendar days after delivery.</li>
              <li>Photographic evidence was not provided with the claim.</li>
              <li>The claimed defect is not objectively verifiable.</li>
            </ul>
          </PolicySection>

          <PolicySection title="6. Damaged in Transit">
            <p>
              If your order arrives visibly damaged by the carrier, please
              photograph the outer packaging before opening and contact us
              within 48 hours of delivery. We will liaise with the carrier and
              arrange a replacement or refund as appropriate.
            </p>
          </PolicySection>

          <PolicySection title="7. Processing Refunds">
            <p>
              Approved refunds will be processed to the original payment method
              (Square payment card) within{" "}
              <strong className="text-mahogany">5–10 business days</strong> of
              approval, depending on your card issuer.
            </p>
          </PolicySection>

          <PolicySection title="8. Contact">
            <p>
              For all refund and return enquiries, please use our{" "}
              <Link
                href="/contact"
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                contact form
              </Link>{" "}
              or write to:
            </p>
            <div className="mt-3 p-4 bg-mahogany/5 rounded-lg text-mahogany text-sm">
              <p>AWAD, DAVID MAHIR (Sole Trader)</p>
              <p>Awadini Fragrance Blends</p>
              <p>ABN: 60 669 962 543</p>
              <p>Liverpool, NSW 2170, Australia</p>
            </div>
          </PolicySection>
        </div>
      </div>
    </section>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-sans font-semibold text-base text-mahogany mb-3 tracking-wider uppercase">{title}</h2>
      <div className="text-mahogany/85 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
