import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // liquidGL snapshots need modern CSS color support (oklch → lab in computed styles)
      html2canvas: "html2canvas-pro",
    },
  },
};

export default nextConfig;
