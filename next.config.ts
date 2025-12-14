import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable static optimization for better SEO
  output: "standalone",
  // Optimize images for better performance and SEO
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Headers for better SEO and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
