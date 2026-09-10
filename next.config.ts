import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
