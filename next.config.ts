import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained .next/standalone server (only the node_modules
  // it actually needs) — what the Dockerfile copies into the runtime image.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // No page in this app has a legitimate reason to be framed.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The app uses none of these browser capabilities.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
