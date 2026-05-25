/** @type {import('next').NextConfig} */
const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(
  /\/$/,
  ''
)

const nextConfig = {
  async redirects() {
    return [{ source: '/home/samples', destination: '/home/checks', permanent: true }]
  },
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
      { source: '/static/:path*', destination: `${backendUrl}/static/:path*` },
      { source: '/media/:path*', destination: `${backendUrl}/media/:path*` },
      { source: '/files/:path*', destination: `${backendUrl}/files/:path*` },
      { source: '/avatars/:path*', destination: `${backendUrl}/avatars/:path*` },
    ]
  },
}

export default nextConfig
