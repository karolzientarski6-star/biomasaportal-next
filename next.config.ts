import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/product-category/:slug*",
        destination: "/biomasa-w-polsce/:slug/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
