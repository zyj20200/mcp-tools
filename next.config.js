/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  output: 'standalone',
  i18n,
  reactStrictMode: false,
  transpilePackages: ['@fastgpt/web', '@fastgpt/service', '@fastgpt/global'],
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true
    };
    return config;
  }
};

module.exports = nextConfig;

