import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages; the deploy workflow sets the base path.
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  images: { unoptimized: true },
  // Let phones on the local network use the dev server (`next dev` only).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
