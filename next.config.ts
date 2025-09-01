// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 👇 Allow build even if ESLint finds problems
    ignoreDuringBuilds: true,
  },
  // optional: if you ever get TS errors you want to bypass for a demo:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
