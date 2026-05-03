import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: false, // 更快的开发模式
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // 忽略 .data 目录
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/.git/**', '**/node_modules/**', '**/.data/**'],
    };
    return config;
  },
};

export default nextConfig;
