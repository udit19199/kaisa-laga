import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // liquidGL snapshots need modern CSS color support (oklch → lab in computed styles)
      html2canvas: "html2canvas-pro",
    },
  },
  // Allow local browser surfaces to reach the dev server during design review.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.48"],
};

export default nextConfig;
