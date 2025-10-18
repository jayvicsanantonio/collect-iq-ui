/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@collectiq/shared'],
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
