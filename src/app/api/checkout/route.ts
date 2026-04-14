import { NextRequest, NextResponse } from "next/server";
import { CheckoutSchema } from "@/lib/schemas";
import { getSquareClient, squareLocationId } from "@/lib/square";
import { getTransporter, BUSINESS_EMAIL } from "@/lib/mailer";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";

const allScents = scents as Scent[];

export async function POST(request: NextRequest) {
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

  // 2. Server-side price recalculation (never trust client totals)
  let totalCents = 0;
  const lineItems: { name: string; quantity: number; unitPrice: number }[] = [];

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
    const unitCents = Math.round(scent.price * 100);
    totalCents += unitCents * item.quantity;
    lineItems.push({
      name: scent.name,
      quantity: item.quantity,
      unitPrice: scent.price,
    });
  }

  // 4. Create Square payment
  const squareClient = getSquareClient();

  try {
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(totalCents),
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

    const payment = result.payment;
    if (!payment || payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment was not completed" },
        { status: 402 }
      );
    }

    // 5. Notify business via Gmail
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Awadini Orders" <${process.env.GMAIL_USER}>`,
        to: BUSINESS_EMAIL,
        replyTo: customer.email,
        subject: `New Order — ${customer.name} — A$${(totalCents / 100).toFixed(2)}`,
        html: buildBusinessEmailHtml(customer, lineItems, totalCents / 100, payment.id!),
      });
    } catch (emailErr) {
      // Log but don't fail the request — payment already succeeded
      console.error("Order notification email failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
    });
  } catch (err) {
    console.error("Square payment error:", err);
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 500 }
    );
  }
}

function buildBusinessEmailHtml(
  customer: { name: string; email: string; phone: string; addressLine1: string; addressLine2?: string; city: string; state: string; postcode: string },
  items: { name: string; quantity: number; unitPrice: number }[],
  total: number,
  paymentId: string
): string {
  const itemList = items
    .map((i) => `<li>${i.name} × ${i.quantity} — A$${(i.unitPrice * i.quantity).toFixed(2)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f5f5;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:8px;">
    <h2 style="margin:0 0 16px;color:#1a1a1a;">New Order Received</h2>
    <p><strong>Customer:</strong> ${customer.name}<br>
    <strong>Email:</strong> ${customer.email}<br>
    <strong>Phone:</strong> ${customer.phone}</p>
    <p><strong>Deliver to:</strong><br>
    ${customer.addressLine1}${customer.addressLine2 ? ", " + customer.addressLine2 : ""}<br>
    ${customer.city} ${customer.state} ${customer.postcode}</p>
    <h3 style="margin:16px 0 8px;">Items</h3>
    <ul>${itemList}</ul>
    <p><strong>Total: A$${total.toFixed(2)}</strong></p>
    <p style="color:#666;font-size:12px;">Square Payment ID: ${paymentId}</p>
  </div>
</body>
</html>`;
}
