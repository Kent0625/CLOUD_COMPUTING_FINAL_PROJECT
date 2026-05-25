import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const backendUrl = rawBackendUrl.startsWith("http") ? rawBackendUrl : `https://${rawBackendUrl}`;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
