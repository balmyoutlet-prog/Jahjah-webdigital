import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Assets are pre-optimized at commit time, so no paid/quota-based image optimization is used.
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
