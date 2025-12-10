import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  // Temporarily disable turbopack loader to fix compilation issue
  // ...(process.env.NODE_ENV === 'development' && {
  //   turbopack: {
  //     rules: {
  //       "*.{jsx,tsx}": {
  //         loaders: [LOADER]
  //       }
  //     }
  //   }
  // }),
  allowedDevOrigins: ['www.orchids.app', 'orchids.app', 'frederica-unlaureled-refugia.ngrok-free.dev'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.orchids.app https://orchids.app http://www.orchids.app http://orchids.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
// Orchids restart: 1764965558356