import { NextRequest, NextResponse } from "next/server";
import { ContactSchema } from "@/lib/schemas";
import { getTransporter, BUSINESS_EMAIL } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Zod validation
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, email, message } = parsed.data;

  // 2. Send email via Gmail
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Awadini Website" <${process.env.GMAIL_USER}>`,
      to: BUSINESS_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${name}`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f5f5;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:8px;">
    <h2 style="margin:0 0 16px;color:#1a1a1a;">New Contact Form Message</h2>
    <p style="margin:0 0 4px;"><strong>Name:</strong> ${name}</p>
    <p style="margin:0 0 16px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;">
    <p style="white-space:pre-wrap;color:#333;line-height:1.6;margin:0;">${message}</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;">
    <p style="color:#999;font-size:12px;margin:0;">Hit reply to respond directly to ${name}.</p>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gmail send error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
