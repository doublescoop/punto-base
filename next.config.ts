import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure consistent behavior between local and production builds
  output: 'standalone',
  
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default nextConfig;
