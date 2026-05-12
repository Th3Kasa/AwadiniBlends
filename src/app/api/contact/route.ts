import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// 3 contact submissions per hour per IP — prevents spam
const limiter = rateLimit({ limit: 3, windowMs: 60 * 60 * 1000 });

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB decoded

// Allowed MIME types (whitelist only)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Magic byte signatures for each allowed type
// Prevents renaming a .exe to .jpg and uploading it
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 && // P
      buffer[2] === 0x4e && // N
      buffer[3] === 0x47 && // G
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    // RIFF....WEBP
    return (
      buffer[0] === 0x52 && // R
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x46 && // F
      buffer[8] === 0x57 && // W
      buffer[9] === 0x45 && // E
      buffer[10] === 0x42 && // B
      buffer[11] === 0x50   // P
    );
  }
  if (mimeType === "image/gif") {
    // GIF87a or GIF89a
    return (
      buffer[0] === 0x47 && // G
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x38 && // 8
      (buffer[4] === 0x37 || buffer[4] === 0x39) && // 7 or 9
      buffer[5] === 0x61   // a
    );
  }
  return false;
}

export async function POST(request: NextRequest) {
  const { success } = limiter(request);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please wait before sending another message." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message, imageBase64, imageType, imageName } = body as {
    name?: string;
    email?: string;
    message?: string;
    imageBase64?: string | null;
    imageType?: string | null;
    imageName?: string | null;
  };

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 422 });
  }

  // Sanitise text fields — strip null bytes
  const safeName    = name.replace(/\0/g, "").slice(0, 200);
  const safeEmail   = email.replace(/\0/g, "").slice(0, 254);
  const safeMessage = message.replace(/\0/g, "").slice(0, 2000);

  // ── Image validation ─────────────────────────────────────────────────────────
  let attachment: { content: string; name: string; type: string } | null = null;

  if (imageBase64 && imageType && imageName) {
    // 1. Whitelist MIME type
    if (!ALLOWED_MIME_TYPES.has(imageType)) {
      return NextResponse.json({ error: "Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed." }, { status: 422 });
    }

    // 2. Decode base64 and check size (zip bomb / large file protection)
    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(imageBase64, "base64");
    } catch {
      return NextResponse.json({ error: "Invalid image data." }, { status: 422 });
    }

    if (imageBuffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image exceeds 5MB limit." }, { status: 422 });
    }

    if (imageBuffer.length < 12) {
      return NextResponse.json({ error: "Invalid image file." }, { status: 422 });
    }

    // 3. Magic byte check — confirms file is actually what it claims to be
    if (!validateMagicBytes(imageBuffer, imageType)) {
      return NextResponse.json({ error: "File content does not match the declared image type." }, { status: 422 });
    }

    // 4. Sanitise filename — strip path traversal and dangerous chars
    const safeImageName = imageName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, "_")
      .slice(0, 100);

    attachment = { content: imageBase64, name: safeImageName, type: imageType };
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  try {
    const emailPayload: Record<string, unknown> = {
      sender: { name: "Awadini Contact Form", email: "contact.awadini@gmail.com" },
      to: [{ email: "contact.awadini@gmail.com", name: "Awadini" }],
      replyTo: { email: safeEmail, name: safeName },
      subject: `📩 New Contact Message — ${safeName}`,
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
        <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${safeName}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#374151;">
          <a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a>
        </p>
      </td></tr>
      <tr><td style="padding:24px 32px;">
        <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Message</p>
        <p style="margin:0;font-size:15px;color:#111827;line-height:1.7;white-space:pre-wrap;">${safeMessage}</p>
      </td></tr>
      ${attachment ? `
      <tr><td style="padding:0 32px 24px;">
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Attached Image</p>
        <p style="margin:0;font-size:13px;color:#6b7280;">📎 ${attachment.name} (see attachment)</p>
      </td></tr>` : ""}
      <tr><td style="padding:16px 32px;background:#f9fafb;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Hit reply to respond directly to ${safeName}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    };

    if (attachment) {
      emailPayload.attachment = [{ content: attachment.content, name: attachment.name }];
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": brevoKey,
      },
      body: JSON.stringify(emailPayload),
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
