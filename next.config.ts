import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Try root level first (Next.js 15.2.3+)
  allowedDevOrigins: ['localhost','172.19.160.1'],
}

export default nextConfig
