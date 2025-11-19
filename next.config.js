/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Enable image optimization
  images: {
    domains: [],
  },
}

module.exports = nextConfig
