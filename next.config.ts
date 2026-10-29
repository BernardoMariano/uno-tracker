import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages; the deploy workflow sets the base path.
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  images: { unoptimized: true },
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
