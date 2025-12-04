import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable compression for faster responses
  compress: true,

  // TypeScript strict checks enabled for production quality
  // MVP Smart Phase 1 - Day 1: TypeScript checks activated
  eslint: {
    ignoreDuringBuilds: true,  // Keep for now, will fix in Phase 2
  },
  typescript: {
    ignoreBuildErrors: false,  // ✅ ACTIVATED - Build will fail on TS errors
  },

  // Performance Optimizations
  // MVP Smart Phase 1 - Days 4-5: Bundle optimization
  experimental: {
    // Bundle optimizations - Extended for better performance
    optimizePackageImports: [
      '@radix-ui/react-*',
      'lucide-react',
      'recharts',
      '@tanstack/react-query',
      'date-fns',
      'zod',
    ],
    optimizeCss: true,          // ✅ CSS optimization
    webpackBuildWorker: true,   // ✅ Parallel builds
    
    // Turbopack optimizations - removed empty config to avoid warnings

    // AI Streaming Optimizations
    serverActions: {
      bodySizeLimit: '2mb', // Allow larger payloads for AI requests
    },
  },

  // External packages for server components
  // Include AI SDK packages for better server-side performance
  serverExternalPackages: [
    '@prisma/client',
    'ai',
    '@ai-sdk/anthropic',
    '@ai-sdk/openai',
  ],

  // Asset Optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      { hostname: '**.targetym.com' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'img.clerk.com' },
      { hostname: '**.clerk.accounts.dev' },
    ],
  },

  // Bundle Optimization - Removed webpack config for Turbopack
  // Turbopack handles optimization automatically and webpack config causes warnings

  // Performance Monitoring
  productionBrowserSourceMaps: false,

  // Headers for AI streaming
  async headers() {
    return [
      {
        source: '/api/ai/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "hc-fx",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});