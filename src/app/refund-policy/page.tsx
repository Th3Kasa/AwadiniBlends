import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Awadini Fragrance Blends refund and returns policy for made-to-order perfume oils.",
};

export default function RefundPolicyPage() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Legal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-cream mb-2">
            Refund Policy
          </h1>
          <p className="text-cream/85 text-sm">
            Last updated: {new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-cream/90 leading-relaxed">

          <div className="glass-card p-6">
            <p className="text-cream/90 text-sm leading-relaxed">
              This Refund Policy applies to all purchases made from Awadini
              Fragrance Blends, operated by{" "}
              <strong className="text-cream">AWAD, DAVID MAHIR</strong> (Sole
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
              <strong className="text-cream">made to order</strong>. Each bottle
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
            <ul className="mt-2 ml-4 space-y-1 list-disc list-outside text-cream/85">
              <li>The product is not of acceptable quality (e.g., contaminated, spoiled, or has an abnormal smell inconsistent with the product description).</li>
              <li>The product does not match its description on our website.</li>
              <li>The product arrives damaged due to a fault in packaging or transit handling on our part.</li>
              <li>The product leaks due to a manufacturing defect in the bottle or applicator.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. How to Make a Claim">
            <p>
              If you believe your product is defective or does not match its
              description, you must notify us within{" "}
              <strong className="text-cream">7 calendar days</strong> of
              receiving your order. To make a claim:
            </p>
            <ol className="mt-3 ml-4 space-y-2 list-decimal list-outside text-cream/85">
              <li>
                Contact us at{" "}
                <Link
                  href="/contact"
                  className="text-gold hover:text-gold-light underline underline-offset-2"
                >
                  awadini.com.au/contact
                </Link>{" "}
                or email us directly.
              </li>
              <li>
                Provide your order number, a description of the issue, and
                clear photographs of the product and packaging.
              </li>
              <li>
                We will assess your claim within 3 business days and advise
                you of the outcome.
              </li>
            </ol>
          </PolicySection>

          <PolicySection title="4. Remedies">
            <p>
              Upon assessment, we will offer one of the following remedies
              based on the nature of the defect:
            </p>
            <ul className="mt-3 ml-4 space-y-2 list-disc list-outside text-cream/85">
              <li>
                <strong className="text-cream">Major failure:</strong> You may
                choose a full refund to your original payment method or a
                replacement product of equal value.
              </li>
              <li>
                <strong className="text-cream">Minor defect:</strong> We will
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
            <ul className="mt-3 ml-4 space-y-1 list-disc list-outside text-cream/85">
              <li>You have changed your mind about the purchase.</li>
              <li>You chose the wrong scent.</li>
              <li>The product has been used (partially or fully).</li>
              <li>
                The issue arises from abnormal use, storage, or application
                (e.g., extreme heat exposure, mixing with other products).
              </li>
              <li>
                You were aware of the defect before purchasing.
              </li>
              <li>The claim is made more than 7 days after delivery.</li>
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
              <strong className="text-cream">5–10 business days</strong> of
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
            <div className="mt-3 p-4 bg-smoke/50 rounded-lg text-cream/85 text-sm">
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
      <h2 className="font-serif text-lg text-cream mb-3">{title}</h2>
      <div className="text-cream/85 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
