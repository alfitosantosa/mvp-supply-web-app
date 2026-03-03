import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard/catalog",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
