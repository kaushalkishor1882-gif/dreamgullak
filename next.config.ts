/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ ignore TypeScript type errors during build
  },
};

export default nextConfig;
