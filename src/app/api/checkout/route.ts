import { NextRequest, NextResponse } from "next/server";
import { CheckoutSchema } from "@/lib/schemas";
import { getSquareClient, squareLocationId } from "@/lib/square";
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

  // 2. Server-side price recalculation with bundle tier pricing
  // Tiers (based on total quantity ordered):
  //   1 item  → $12 each
  //   2 items → $11 each (Duo)
  //   3–4     → $10 each (Trio)
  //   5+      → $9  each (Collection)
  const BASE_PRICE = 12; // matches scents.json
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  function getBundleUnitPrice(): number {
    if (totalQty >= 5) return 9;
    if (totalQty >= 3) return 10;
    if (totalQty >= 2) return 11;
    return BASE_PRICE;
  }

  const unitPrice = getBundleUnitPrice();
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
    const unitCents = Math.round(unitPrice * 100);
    totalCents += unitCents * item.quantity;
    lineItems.push({
      name: scent.name,
      quantity: item.quantity,
      unitPrice,
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

    // 5. Notify business via Web3Forms
    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      if (accessKey) {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `New Order — ${customer.name} — A$${(totalCents / 100).toFixed(2)}`,
            from_name: "Awadini Orders",
            replyto: customer.email,
            message: buildOrderMessage(customer, lineItems, totalCents / 100, payment.id!),
          }),
        });
      }
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

function buildOrderMessage(
  customer: { name: string; email: string; phone: string; addressLine1: string; addressLine2?: string; city: string; state: string; postcode: string },
  items: { name: string; quantity: number; unitPrice: number }[],
  total: number,
  paymentId: string
): string {
  const itemList = items
    .map((i) => `  - ${i.name} x ${i.quantity} = A$${(i.unitPrice * i.quantity).toFixed(2)}`)
    .join("\n");

  return [
    `New Order Received`,
    ``,
    `Customer: ${customer.name}`,
    `Email: ${customer.email}`,
    `Phone: ${customer.phone}`,
    ``,
    `Deliver to:`,
    `${customer.addressLine1}${customer.addressLine2 ? ", " + customer.addressLine2 : ""}`,
    `${customer.city} ${customer.state} ${customer.postcode}`,
    ``,
    `Items:`,
    itemList,
    ``,
    `Total: A$${total.toFixed(2)}`,
    `Square Payment ID: ${paymentId}`,
  ].join("\n");
}
