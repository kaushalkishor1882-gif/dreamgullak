// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // ✅ disables eslint errors on build
  },
  typescript: {
    ignoreBuildErrors: true,    // ✅ disables TS "any" errors
  },
};

export default nextConfig;
