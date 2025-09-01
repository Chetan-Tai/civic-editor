/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ❗ Allow production builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❗ Allow production builds to succeed even if there are TS errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;