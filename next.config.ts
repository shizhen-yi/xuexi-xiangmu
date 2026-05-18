import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root so Next doesn't mistake the parent dir's lockfile as root.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
