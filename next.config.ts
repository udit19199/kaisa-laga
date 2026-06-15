import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local browser surfaces to reach the dev server during design review.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.48"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
