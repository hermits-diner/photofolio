import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first — meaningfully smaller than WebP for photographic content.
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 85, 95],
    // Scans are served from Sanity's asset CDN. Next optimises them once and
    // caches the result, which keeps the metered Sanity bandwidth low.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
