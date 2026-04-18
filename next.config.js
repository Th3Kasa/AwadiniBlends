/** @type {import('next').NextConfig} */
const nextConfig = {
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com",
              // Square card iframe
              "frame-src https://web.squarecdn.com https://sandbox.web.squarecdn.com",
              // Square API endpoints — connect.squareup.com is required by vanilla SDK
              "connect-src 'self'"
                + " https://connect.squareup.com"
                + " https://pci-connect.squareup.com"
                + " https://api.squareup.com"
                + " https://connect.squareupsandbox.com"
                + " https://pci-connect.squareupsandbox.com"
                + " https://api.web3forms.com"
                + " https://api.geoapify.com"
                + " https://nominatim.openstreetmap.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://web.squarecdn.com",
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
