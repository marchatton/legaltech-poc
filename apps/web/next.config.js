/** @type {import('next').NextConfig} */
const path = require("node:path");

const nextConfig = {
  reactStrictMode: true,
  // Ensure Next's output file tracing is rooted at the monorepo, not an inferred dir.
  // This avoids picking up unrelated lockfiles on the machine.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@orbital-poc/core"],
};

module.exports = nextConfig;
