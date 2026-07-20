import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first — meaningfully smaller than WebP for photographic content.
    formats: ["image/avif", "image/webp"],
    qualities: [70, 85, 95],
    remotePatterns: [],
  },
};

export default nextConfig;
