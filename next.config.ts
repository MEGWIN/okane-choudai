import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/terms/tiktok5rXfrpbX83SDDSblEJKaH8jlk1U5tVwb.txt',
        destination: '/api/tiktok-verify',
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 448],
    imageSizes: [56, 64, 128],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ogyhlldqkjhwscgvrszu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
};

export default nextConfig;
