/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagely.factory-direct-flooring.co.uk',
      },
    ],
  },
};

module.exports = nextConfig;
