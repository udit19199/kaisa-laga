import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // liquidGL snapshots need modern CSS color support (oklch → lab in computed styles)
      html2canvas: "html2canvas-pro",
    },
  },
  // @ts-ignore - Supress TS error if allowedDevOrigins isn't in types yet
  allowedDevOrigins: ['192.168.1.48'],
};

export default nextConfig;
