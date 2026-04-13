import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Obrazy z /public/wp-content/ serwowane lokalnie przez Next.js/Vercel CDN
    // Dodatkowe hostname-y na wypadek gdyby były referencje absolutne w treści
    remotePatterns: [
      {
        protocol: "https",
        hostname: "biomasaportal.pl",
        pathname: "/wp-content/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Długi cache dla statycznych assetów WP (obrazy, CSS, JS)
        // serwowanych z /public/wp-content/
        source: "/wp-content/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
