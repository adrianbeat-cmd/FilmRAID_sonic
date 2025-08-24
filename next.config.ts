// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export (no Next.js server). Netlify will serve static files + Functions.
  output: 'export',
  images: {
    // Required for static export
    unoptimized: true,
  },
  // Optional but recommended for static export to avoid 404s on client-side routes:
  // trailingSlash: true,
};

export default nextConfig;
