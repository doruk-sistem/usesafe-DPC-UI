const createNextIntlPlugin = require('next-intl/plugin');

<<<<<<< HEAD
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
=======
const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');
>>>>>>> feature/settings-translations

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'udmyjobxsovqdshhavus.supabase.co',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  swcMinify: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  }
};

module.exports = withNextIntl(nextConfig);