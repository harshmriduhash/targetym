import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/signin(.*)',
  '/auth/sign-up(.*)',
  '/auth/signup(.*)',
  '/auth/error(.*)',
  '/auth/verify(.*)',
  '/api/auth(.*)',
  '/api/health(.*)',
  '/api/webhooks/clerk(.*)',
])

// Cache expensive computations
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean) as string[]

const CLERK_DOMAIN = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? 'accounts.clerk.com'
  : 'localhost:3000'

const SUPABASE_DOMAIN = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'localhost'

const CSP_HEADER = [
  "default-src 'self'",
  `script-src 'self' https://${CLERK_DOMAIN} https://*.clerk.accounts.dev https://challenges.cloudflare.com 'unsafe-inline' 'unsafe-eval'`,
  `style-src 'self' 'unsafe-inline' https://${CLERK_DOMAIN} https://*.clerk.accounts.dev`,
  "img-src 'self' data: https: https://img.clerk.com https://*.clerk.accounts.dev",
  "font-src 'self' data: https:",
  `connect-src 'self' https://${SUPABASE_DOMAIN} wss://${SUPABASE_DOMAIN} https://${CLERK_DOMAIN} https://*.clerk.accounts.dev https://api.clerk.dev`,
  `frame-src 'self' https://${CLERK_DOMAIN} https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
  'block-all-mixed-content',
].join('; ')

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const url = req.nextUrl

  // Redirect authenticated users from ONLY auth pages to dashboard
  if (userId && (url.pathname === '/auth/sign-in' || url.pathname === '/auth/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect all routes except public routes
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // Get response
  const response = NextResponse.next()

  // Set security headers (cached values for performance)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-UA-Compatible', 'IE=Edge')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()'
  )

  // CORS Headers - Only allow same-origin by default (using cached origins)
  const origin = req.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  // Set CSP header (using cached value)
  response.headers.set('Content-Security-Policy', CSP_HEADER)

  return response
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
