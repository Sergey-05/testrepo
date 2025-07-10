// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: { remotePatterns: [{ protocol: 'https', hostname: 't.me' }, {protocol: 'https', hostname: 'coin-images.coingecko.com'}] }

// };

// export default nextConfig;


import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't.me' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
    ],
  },
};

export default bundleAnalyzer(nextConfig);
