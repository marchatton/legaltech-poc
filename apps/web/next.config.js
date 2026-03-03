/** @type {import('next').NextConfig} */
const path = require("node:path");

const FRAME_ANCESTORS_ONLY_CSP = "frame-ancestors 'none'";

// Staged CSP rollout:
// 1) Enforce clickjacking protection immediately via `frame-ancestors`.
// 2) Roll out the rest of the policy via report-only and tighten iteratively.
const REPORT_ONLY_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  // Ensure Next's output file tracing is rooted at the monorepo, not an inferred dir.
  // This avoids picking up unrelated lockfiles on the machine.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@legaltech-poc/core"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Clickjacking defense (enforced).
          { key: "Content-Security-Policy", value: FRAME_ANCESTORS_ONLY_CSP },
          // Start CSP rollout in report-only mode to avoid breaking changes.
          { key: "Content-Security-Policy-Report-Only", value: REPORT_ONLY_CSP },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
