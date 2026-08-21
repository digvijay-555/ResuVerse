
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mongoose'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
