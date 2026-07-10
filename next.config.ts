import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained .next/standalone server (only the node_modules
  // it actually needs) — what the Dockerfile copies into the runtime image.
  output: "standalone",
  poweredByHeader: false,
  // The per-request Content-Security-Policy lives in src/proxy.ts (it needs
  // a fresh nonce per render); everything static enough to declare once
  // lives here.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Browsers ignore HSTS over plain http, so this is inert in local
          // dev and takes effect on the HTTPS deployment.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
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
