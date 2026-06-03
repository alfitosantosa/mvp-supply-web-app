import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "file.santosatechid.cloud",
      },
    ],
  },
};

export default config;
