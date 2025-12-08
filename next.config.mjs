/** @type {import('next').NextConfig} */
const nextConfig = {
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
