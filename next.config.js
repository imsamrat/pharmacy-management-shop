/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.join(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;
