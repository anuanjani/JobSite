/** @type {import('next').NextConfig} */
const nextConfig = {
  // #18: Never expose source maps in production builds
  productionBrowserSourceMaps: false,
  // Hide X-Powered-By: Next.js header
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;