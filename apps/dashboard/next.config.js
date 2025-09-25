/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  env: {
    GITHUB_ORG: 'Ai-Whisperers',
    AZURE_DEVOPS_ORG: process.env.AZURE_DEVOPS_ORG || '',
    AZURE_DEVOPS_PROJECT: process.env.AZURE_DEVOPS_PROJECT || 'AI-Whisperers',
  },
  async rewrites() {
    return [
      {
        source: '/api/jobs/:path*',
        destination: process.env.JOBS_SERVICE_URL || 'http://localhost:4000/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/reports/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;