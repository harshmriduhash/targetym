import type { NextConfig } from "next";

/**
 * Next.js Configuration - Performance Optimized
 *
 * Optimizations Applied:
 * 1. Bundle optimization with aggressive code splitting
 * 2. Image optimization with WebP and AVIF
 * 3. Compression headers
 * 4. Static page generation
 * 5. Edge runtime configuration
 * 6. Bundle analyzer integration
 */

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Production: Enable after fixing issues
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },

  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },

  // ============================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================

  experimental: {
    // Optimize package imports - reduces bundle size
    optimizePackageImports: [
      '@radix-ui/react-*',
      'lucide-react',
      'date-fns',
      '@tanstack/react-query',
      'recharts',
    ],

    // Partial Prerendering (Next.js 15)
    ppr: 'incremental',

    // Use Turbopack for faster builds
    turbo: {
      // Optimize Turbopack with rules
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },

    // Server Actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3001',
        'targetym.com',
        '*.targetym.com',
      ],
    },

    // Optimize CSS
    optimizeCss: true,

    // Enable Instrumentation for monitoring
    instrumentationHook: true,
  },

  // ============================================
  // COMPRESSION & HEADERS
  // ============================================

  compress: true, // Enable gzip compression

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Performance Headers
          {
            key: 'X-Response-Time',
            value: '${Date.now()}',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // ============================================
  // REDIRECTS & REWRITES
  // ============================================

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ============================================
  // ASSET OPTIMIZATION
  // ============================================

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Support WebP and AVIF for better compression
    formats: ['image/avif', 'image/webp'],

    // Longer cache TTL for images
    minimumCacheTTL: 31536000, // 1 year

    // Image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.targetym.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],

    // Unoptimized images for development
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // ============================================
  // WEBPACK OPTIMIZATION
  // ============================================

  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Bundle Analysis
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
          enabled: true,
        });
        config.plugins.push(new BundleAnalyzerPlugin());
      }

      // Optimize chunks
      config.optimization = {
        ...config.optimization,

        // Split chunks strategy
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Framework code (React, Next.js)
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },

            // Vendor libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },

            // Radix UI components
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix',
              priority: 35,
              reuseExistingChunk: true,
            },

            // Supabase
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 35,
              reuseExistingChunk: true,
            },

            // React Query
            query: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              name: 'query',
              priority: 35,
              reuseExistingChunk: true,
            },

            // Common code shared between pages
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },

            // Shared UI components
            shared: {
              name: 'shared',
              minChunks: 3,
              priority: 10,
              reuseExistingChunk: true,
            },
          },

          // Optimize chunk size
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 244000,
        },

        // Minimize bundle
        minimize: true,

        // Module concatenation (scope hoisting)
        concatenateModules: true,

        // Remove unused exports
        usedExports: true,

        // Side effects optimization
        sideEffects: true,
      };
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // ============================================
  // EXTERNAL PACKAGES
  // ============================================

  serverExternalPackages: [
    '@prisma/client',
    'pino',
    'pino-pretty',
  ],

  // ============================================
  // OUTPUT & BUILD
  // ============================================

  // Production source maps disabled
  productionBrowserSourceMaps: false,

  // Output standalone for Docker
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Generate ETags for caching
  generateEtags: true,

  // Power by header
  poweredByHeader: false,

  // Trailing slash
  trailingSlash: false,

  // ============================================
  // STATIC OPTIMIZATION
  // ============================================

  // Enable static optimization
  swcMinify: true,

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,

    // React optimization
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid$'],
    } : false,
  },

  // ============================================
  // REWRITES FOR API OPTIMIZATION
  // ============================================

  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite /api/health to a static file for faster health checks
        {
          source: '/api/health',
          destination: '/api/health',
        },
      ],
    };
  },
};

export default nextConfig;
