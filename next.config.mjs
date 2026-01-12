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
};

export default nextConfig;
