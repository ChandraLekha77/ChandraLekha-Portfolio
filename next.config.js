/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_PREVIEW_DIR || ".next",
  reactStrictMode: true,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"]
};

module.exports = nextConfig;
