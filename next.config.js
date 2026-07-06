const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enforces compilation strictness for high performance predictability
  reactStrictMode: true,
  
  // Power up standalone output packaging for instant serverless executions
  output: "standalone",
  
  // Clean up powered-by branding tags from HTTP response headers
  poweredByHeader: false,

  // Explicitly mapping Webpack path aliases for production builds
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
};

module.exports = nextConfig;