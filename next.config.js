/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    imageSizes: [64, 128, 256, 384, 512],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Square CDN + Geoapify autocomplete (called from browser)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://pay.google.com https://applepay.cdn-apple.com",
              // Square card iframe + Google Pay / Apple Pay iframes
              "frame-src https://web.squarecdn.com https://sandbox.web.squarecdn.com https://pay.google.com https://applepay.cdn-apple.com",
              // Square API endpoints — connect.squareup.com is required by vanilla SDK
              "connect-src 'self'"
                + " https://connect.squareup.com"
                + " https://pci-connect.squareup.com"
                + " https://api.squareup.com"
                + " https://connect.squareupsandbox.com"
                + " https://pci-connect.squareupsandbox.com"
                + " https://api.web3forms.com"
                + " https://api.geoapify.com"
                + " https://nominatim.openstreetmap.org"
                + " https://o160250.ingest.sentry.io"
                + " https://pay.google.com"
                + " https://google.com"
                + " https://www.google.com"
                + " https://applepay.cdn-apple.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://web.squarecdn.com https://sandbox.web.squarecdn.com",
              "font-src 'self' https://fonts.gstatic.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://cash-f.squarecdn.com",
              "img-src 'self' data: blob: https://web.squarecdn.com https://www.gstatic.com https://pay.google.com",
            ].join("; "),
          },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
