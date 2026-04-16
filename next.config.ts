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

  async redirects() {
    return [
      {
        source: "/product-category/:slug*",
        destination: "/biomasa-w-polsce/:slug/",
        permanent: true,
      },
    ];
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
        // Obrazy WP — długi cache, treść się nie zmienia po URL
        source: "/wp-content/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Elementor CSS / JS — krótki cache, pliki mogą być aktualizowane
        source: "/wp-content/uploads/elementor/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        // Pozostałe assety WP (themes, plugins) — umiarkowany cache
        source: "/wp-content/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
