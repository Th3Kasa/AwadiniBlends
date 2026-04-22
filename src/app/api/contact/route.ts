import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message } = body as { name?: string; email?: string; message?: string };

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 422 });
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": brevoKey,
      },
      body: JSON.stringify({
        sender: { name: "Awadini Contact Form", email: "contact.awadini@gmail.com" },
        to: [{ email: "contact.awadini@gmail.com", name: "Awadini" }],
        replyTo: { email, name },
        subject: `📩 New Contact Message — ${name}`,
        htmlContent: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:ui-sans-serif,system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr><td style="background:#111827;padding:24px 32px;">
        <h1 style="margin:0;font-size:20px;color:#f9fafb;font-weight:600;">📩 New Contact Message</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#9ca3af;">Awadini Fragrance Blends</p>
      </td></tr>
      <tr><td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">From</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${name}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#374151;">
          <a href="mailto:${email}" style="color:#2563eb;">${email}</a>
        </p>
      </td></tr>
      <tr><td style="padding:24px 32px;">
        <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Message</p>
        <p style="margin:0;font-size:15px;color:#111827;line-height:1.7;white-space:pre-wrap;">${message}</p>
      </td></tr>
      <tr><td style="padding:16px 32px;background:#f9fafb;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Hit reply to respond directly to ${name}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Brevo contact email error:", err);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
