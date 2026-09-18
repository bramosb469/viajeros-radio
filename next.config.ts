import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "@prisma/client", "better-auth", "kysely", "@better-auth/core", "@better-auth/kysely-adapter", "@better-auth/memory-adapter"],
  async redirects() {
    return [
      {
        source: '/ADMIN',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/ADMIN/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
