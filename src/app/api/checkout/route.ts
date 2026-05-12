import { NextRequest, NextResponse } from "next/server";
import { CheckoutSchema } from "@/lib/schemas";
import { getSquareClient, squareLocationId } from "@/lib/square";
import { getShippingCost } from "@/lib/shipping";
import { getBundleUnitPrice, calculateServiceFee } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";

const allScents = scents as Scent[];

// 5 payment attempts per 10 minutes per IP — prevents card-testing attacks
const limiter = rateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: NextRequest) {
  const { success } = limiter(request);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
  }
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Zod validation
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { sourceId, customer, items } = parsed.data;

  // Detect PayPal vs Square payment
  const isPayPal = sourceId?.startsWith("paypal:");
  const paypalOrderId = isPayPal ? sourceId.replace("paypal:", "") : null;

  // 2. Server-side price recalculation — mirrors getBundleUnitPrice() in utils.ts
  //   1 item   → $12  |  2 items → $11  |  3–4 → $10  |  5+ → $9
  const totalQty  = items.reduce((sum, i) => sum + i.quantity, 0);
  const unitPrice = getBundleUnitPrice(totalQty);
  let totalCents = 0;
  const lineItems: { name: string; quantity: number; unitPrice: number }[] = [];

  // Authoritative server-side shipping:
  //   3+ items → FREE (bundle price is set to cover postage costs)
  //   1–2 items → live AusPost rate, silent flat-rate fallback if API unavailable
  let shippingCost    = 0;
  let shippingSource: "auspost" | "bundle_free" | "calculated" = "bundle_free";
  let shippingService: string | undefined = undefined;

  if (totalQty >= 3) {
    shippingCost   = 0;
    shippingSource = "bundle_free";
  } else {
    const quote    = await getShippingCost(customer.postcode);
    shippingCost   = quote.cost;
    shippingSource = quote.source;
    shippingService = quote.service;
  }
  const shippingCents = Math.round(shippingCost * 100);

  for (const item of items) {
    const scent = allScents.find((s) => s.slug === item.slug);
    if (!scent) {
      return NextResponse.json(
        { error: `Unknown product: ${item.slug}` },
        { status: 422 }
      );
    }
    if (!scent.inStock) {
      return NextResponse.json(
        { error: `${scent.name} is currently out of stock` },
        { status: 422 }
      );
    }
    const unitCents = Math.round(unitPrice * 100);
    totalCents += unitCents * item.quantity;
    lineItems.push({
      name: scent.name,
      quantity: item.quantity,
      unitPrice,
    });
  }

  // 4a. Free surprise gift — included with every bundle (Duo+), not charged
  //     Randomly assign one of the hidden/retiring scents; David packs it manually
  const GIFT_SLUGS = ["green-apple", "musk"];
  const freeGift = totalQty >= 2
    ? allScents.find((s) => s.slug === GIFT_SLUGS[Math.floor(Math.random() * GIFT_SLUGS.length)])
    : null;

  // 4. Process payment (Square or PayPal)
  const serviceFeeCents = Math.round(calculateServiceFee((totalCents + shippingCents) / 100) * 100);
  const grandTotalCents = totalCents + shippingCents + serviceFeeCents;

  let payment: any;

  if (isPayPal) {
    // PayPal: create a mock payment object (actual validation happens client-side)
    // In production, validate PayPal order here with PayPal API if credentials are set
    payment = {
      id: paypalOrderId,
      status: "COMPLETED",
      receiptNumber: paypalOrderId,
      receiptUrl: `https://www.paypal.com/checkoutnow?token=${paypalOrderId}`,
    };
    console.log("[PayPal] Order received:", paypalOrderId);
  } else {
    // Square payment processing
    const squareClient = getSquareClient();
    try {
      const { result } = await squareClient.paymentsApi.createPayment({
        sourceId,
        idempotencyKey: crypto.randomUUID(),
        amountMoney: {
          amount: BigInt(grandTotalCents),
          currency: "AUD",
        },
        locationId: squareLocationId,
        buyerEmailAddress: customer.email,
        shippingAddress: {
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 || undefined,
          locality: customer.city,
          administrativeDistrictLevel1: customer.state,
          postalCode: customer.postcode,
          country: "AU",
        },
        note: `Awadini order for ${customer.name}`,
      });

      payment = result.payment;
      if (!payment || payment.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "Payment was not completed" },
          { status: 402 }
        );
      }
    } catch (squareErr) {
      console.error("Square payment error:", squareErr);
      return NextResponse.json(
        { error: "Payment processing failed. Please try again." },
        { status: 402 }
      );
    }
  }

  if (!payment) {
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 402 }
    );

    // 5. Add customer to Brevo email list (non-blocking)
    try {
      const brevoKey = process.env.BREVO_API_KEY;
      if (brevoKey) {
        const [firstName, ...rest] = customer.name.trim().split(" ");
        await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": brevoKey,
          },
          body: JSON.stringify({
            email: customer.email,
            attributes: {
              FIRSTNAME: firstName,
              LASTNAME: rest.join(" ") || "",
              SMS: customer.phone,
            },
            listIds: [2], // Brevo default "All contacts" list — change if needed
            updateEnabled: true, // update if they already exist
          }),
        });
      }
    } catch (brevoErr) {
      console.error("Brevo subscriber failed (non-critical):", brevoErr);
    }

    // 6. Send order confirmation email to customer via Brevo transactional
    try {
      const brevoKey = process.env.BREVO_API_KEY;
      if (brevoKey) {
        const itemRows = lineItems
          .map(
            (i) =>
              `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#f5f0e8;">${i.name}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#f5f0e8;text-align:center;">${i.quantity}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#c9a86c;text-align:right;">A$${(i.unitPrice * i.quantity).toFixed(2)}</td>
              </tr>`
          )
          .join("");

        const shippingLabel =
          shippingSource === "bundle_free"
            ? "Free — Bundle Discount 🎁"
            : shippingSource === "auspost"
            ? `A$${shippingCost.toFixed(2)} via Australia Post`
            : `A$${shippingCost.toFixed(2)}`;

        const serviceFee = serviceFeeCents / 100;
        const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">

        <!-- Header -->
        <tr><td style="background:#1a1a1a;padding:32px;text-align:center;border-bottom:1px solid #2a2a2a;">
          <h1 style="margin:0;font-size:24px;letter-spacing:0.15em;color:#c9a86c;font-weight:300;">AWADINI</h1>
          <p style="margin:8px 0 0;color:#f5f0e8;opacity:0.5;font-size:12px;letter-spacing:0.1em;">FRAGRANCE BLENDS</p>
        </td></tr>

        <!-- Thank you -->
        <tr><td style="padding:32px;text-align:center;border-bottom:1px solid #2a2a2a;">
          <h2 style="margin:0 0 12px;font-size:20px;color:#f5f0e8;font-weight:400;">Order Confirmed ✓</h2>
          <p style="margin:0;color:#f5f0e8;opacity:0.6;font-size:14px;line-height:1.6;">
            Thank you, ${customer.name.split(" ")[0]}! Your order has been received and payment confirmed.<br>
            We'll dispatch your fragrances from Liverpool NSW shortly.
          </p>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#c9a86c;">Your Order</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr style="background:#1a1a1a;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#f5f0e8;opacity:0.4;font-weight:400;letter-spacing:0.08em;">FRAGRANCE</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;color:#f5f0e8;opacity:0.4;font-weight:400;letter-spacing:0.08em;">QTY</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#f5f0e8;opacity:0.4;font-weight:400;letter-spacing:0.08em;">PRICE</th>
            </tr>
            ${itemRows}
            <tr>
              <td colspan="2" style="padding:8px 12px;color:#f5f0e8;opacity:0.5;font-size:13px;">Shipping</td>
              <td style="padding:8px 12px;text-align:right;color:#f5f0e8;opacity:0.7;font-size:13px;">${shippingLabel}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 12px;color:#f5f0e8;opacity:0.5;font-size:13px;">Service fee</td>
              <td style="padding:8px 12px;text-align:right;color:#f5f0e8;opacity:0.7;font-size:13px;">A$${serviceFee.toFixed(2)}</td>
            </tr>
            <tr style="background:#1a1a1a;">
              <td colspan="2" style="padding:12px;font-size:14px;color:#f5f0e8;font-weight:600;">Total</td>
              <td style="padding:12px;text-align:right;font-size:16px;color:#c9a86c;font-weight:600;">A$${(grandTotalCents / 100).toFixed(2)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Delivery address -->
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#c9a86c;">Delivering To</p>
          <p style="margin:0;font-size:14px;color:#f5f0e8;opacity:0.7;line-height:1.7;">
            ${customer.addressLine1}${customer.addressLine2 ? ", " + customer.addressLine2 : ""}<br>
            ${customer.city} ${customer.state} ${customer.postcode}
          </p>
        </td></tr>

        <!-- Payment ref -->
        <tr><td style="padding:0 32px 32px;">
          <p style="margin:0;font-size:11px;color:#f5f0e8;opacity:0.3;">
            Payment ref: ${payment.id}
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a1a1a;padding:24px 32px;text-align:center;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:12px;color:#f5f0e8;opacity:0.35;line-height:1.6;">
            Questions? Reply to this email and we'll get back to you.<br>
            © Awadini Fragrance Blends · Liverpool NSW 2170 · Australia
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const customerEmailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": brevoKey,
          },
          body: JSON.stringify({
            sender: { name: "Awadini Fragrance Blends", email: "contact.awadini@gmail.com" },
            to: [{ email: customer.email, name: customer.name }],
            subject: `Your Awadini Order is Confirmed — A$${(grandTotalCents / 100).toFixed(2)}`,
            htmlContent: htmlBody,
          }),
        });
        if (!customerEmailRes.ok) {
          const errBody = await customerEmailRes.text();
          console.error("Brevo customer receipt FAILED:", customerEmailRes.status, errBody);
        } else {
          const { messageId } = await customerEmailRes.json().catch(() => ({}));
          console.log("Brevo customer receipt sent. messageId:", messageId);
        }
      }
    } catch (confirmErr) {
      console.error("Customer confirmation email failed (non-critical):", confirmErr);
    }

    // 8. Notify David via Brevo — BCC to personal Gmail as fallback for self-send filtering
    try {
      const brevoKeyNotify = process.env.BREVO_API_KEY;
      if (brevoKeyNotify) {
        const davidEmailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": brevoKeyNotify,
          },
          body: JSON.stringify({
            sender: { name: "Awadini Orders", email: "contact.awadini@gmail.com" },
            to: [{ email: "contact.awadini@gmail.com", name: "Awadini Orders" }],
            bcc: [{ email: "awaddavid65@gmail.com", name: "David" }],
            replyTo: { email: customer.email, name: customer.name },
            subject: `🧴 New Order — ${customer.name} — A$${(grandTotalCents / 100).toFixed(2)}`,
            htmlContent: buildOrderMessage(customer, lineItems, totalCents / 100, shippingCost, grandTotalCents / 100, payment.id!, shippingSource, shippingService, freeGift?.name),
          }),
        });
        if (!davidEmailRes.ok) {
          const errBody = await davidEmailRes.text();
          console.error("Brevo David notification FAILED:", davidEmailRes.status, errBody);
        } else {
          const { messageId } = await davidEmailRes.json().catch(() => ({}));
          console.log("Brevo David notification sent. messageId:", messageId);
        }
      }
    } catch (emailErr) {
      console.error("Order notification email failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
    });
}

function buildOrderMessage(
  customer: { name: string; email: string; phone: string; addressLine1: string; addressLine2?: string; city: string; state: string; postcode: string },
  items: { name: string; quantity: number; unitPrice: number }[],
  subtotal: number,
  shipping: number,
  grandTotal: number,
  paymentId: string,
  shippingSource: "auspost" | "bundle_free" | "calculated" = "calculated",
  shippingService?: string,
  freeGiftName?: string,
): string {
  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">${i.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;text-align:center;">${i.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;text-align:right;font-weight:600;">A$${(i.unitPrice * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const shippingLabel =
    shippingSource === "bundle_free" ? "FREE — Bundle Discount 🎁" :
    shippingSource === "auspost"     ? `A$${shipping.toFixed(2)} via AusPost${shippingService ? ` (${shippingService})` : ""}` :
                                       `A$${shipping.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:ui-sans-serif,system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">

      <!-- Header -->
      <tr><td style="background:#111827;padding:24px 32px;">
        <h1 style="margin:0;font-size:20px;color:#f9fafb;font-weight:600;">🧴 New Order Received</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#9ca3af;">Awadini Fragrance Blends — Liverpool NSW 2170</p>
      </td></tr>

      <!-- Customer -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Customer</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${customer.name}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#374151;">
          <a href="mailto:${customer.email}" style="color:#2563eb;">${customer.email}</a> &nbsp;·&nbsp;
          <a href="tel:${customer.phone}" style="color:#2563eb;">${customer.phone}</a>
        </p>
      </td></tr>

      <!-- Items to make -->
      <tr><td style="padding:24px 32px 0;">
        <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Items to Prepare</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
          <tr style="background:#f9fafb;">
            <th style="padding:8px 14px;text-align:left;font-size:11px;color:#6b7280;font-weight:500;letter-spacing:0.06em;">FRAGRANCE</th>
            <th style="padding:8px 14px;text-align:center;font-size:11px;color:#6b7280;font-weight:500;letter-spacing:0.06em;">QTY</th>
            <th style="padding:8px 14px;text-align:right;font-size:11px;color:#6b7280;font-weight:500;letter-spacing:0.06em;">PRICE</th>
          </tr>
          ${itemRows}
          ${freeGiftName ? `
          <tr style="background:#fffbeb;">
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#92400e;">🎁 ${freeGiftName} <span style="font-size:11px;color:#b45309;">(FREE SURPRISE GIFT — pack with order)</span></td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:15px;text-align:center;color:#92400e;">1</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:15px;text-align:right;color:#92400e;font-weight:600;">FREE</td>
          </tr>` : ""}
          <tr style="background:#f9fafb;">
            <td colspan="2" style="padding:10px 14px;font-size:13px;color:#6b7280;">Shipping</td>
            <td style="padding:10px 14px;text-align:right;font-size:13px;color:#374151;">${shippingLabel}</td>
          </tr>
          <tr style="background:#111827;">
            <td colspan="2" style="padding:12px 14px;font-size:14px;color:#f9fafb;font-weight:600;">TOTAL CHARGED</td>
            <td style="padding:12px 14px;text-align:right;font-size:16px;color:#fbbf24;font-weight:700;">A$${grandTotal.toFixed(2)}</td>
          </tr>
        </table>
      </td></tr>

      <!-- Deliver to -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">📦 Ship To</p>
        <p style="margin:0;font-size:14px;color:#111827;line-height:1.7;">
          ${customer.addressLine1}${customer.addressLine2 ? ", " + customer.addressLine2 : ""}<br>
          ${customer.city} ${customer.state} ${customer.postcode}<br>
          <strong>Australia</strong>
        </p>
      </td></tr>

      <!-- Actions -->
      <tr><td style="padding:24px 32px;text-align:center;border-bottom:1px solid #e5e7eb;">
        <a href="https://web3forms.com/dashboard"
           style="display:inline-block;background:#111827;color:#ffffff;font-size:13px;font-weight:600;
                  padding:12px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.05em;">
          View All Orders on Web3Forms →
        </a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          Square Payment ID: ${paymentId}<br>
          Subtotal A$${subtotal.toFixed(2)} + Shipping — Dispatched from Liverpool NSW 2170
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
