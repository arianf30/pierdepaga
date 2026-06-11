/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  allowedDevOrigins: ['192.168.0.4']
}

export default nextConfig
