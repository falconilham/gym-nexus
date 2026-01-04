import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Output standalone for Node.js hosting (better for multi-tenant apps)
  output: 'standalone',
  
  images: {
    unoptimized: true, // Keep this for simpler image handling
  },
};

export default nextConfig;
