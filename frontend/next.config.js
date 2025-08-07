/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'cuttingboardguys.ca'],
    formats: ['image/avif', 'image/webp']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Cutting Board Guys Platform',
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.cuttingboardguys.ca' 
      : 'http://localhost:3001'
  }
};

module.exports = nextConfig;
