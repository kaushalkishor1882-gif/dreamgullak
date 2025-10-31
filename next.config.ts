/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint warnings and errors
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript type errors
  },
};

export default nextConfig;
