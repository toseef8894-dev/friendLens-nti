/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages works with default Next.js output
  // Remove 'standalone' if deploying to Cloudflare Pages
  // Keep 'standalone' if deploying to Vercel or other platforms
  // output: "standalone" // Commented out for Cloudflare Pages compatibility

  compress: true,
  swcMinify: true,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'sonner'],
  },

  async headers() {
    return [
      {
        // Cache static images for 1 year — fingerprinted at build time so safe to use immutable
        source: '/:path*\\.(png|jpg|jpeg|svg|webp|avif|gif|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
};

export default nextConfig;
