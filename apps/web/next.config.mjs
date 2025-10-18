/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@collectiq/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
