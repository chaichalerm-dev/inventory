import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained .next/standalone server (only the node_modules
  // it actually needs) — what the Dockerfile copies into the runtime image.
  output: "standalone",
};

export default nextConfig;
