import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript sources.
  transpilePackages: ['@cortinas/calc', '@cortinas/shared'],
};

export default nextConfig;
