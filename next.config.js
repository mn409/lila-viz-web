/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Static export for Vercel (no Node server needed)
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
