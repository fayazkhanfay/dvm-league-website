/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Remove console.log in production, but keep console.error for critical bugs
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/.well-known/:path*',
          destination: '/api/not-found',
          has: [
            {
              type: 'header',
              key: 'user-agent',
              value: '.*Chrome.*',
            },
          ],
        },
      ],
    }
  },
}

export default nextConfig
