# RAZORPAY + STRIPE PAYMENT INTEGRATION GUIDE
## Implementation for Multi-Region SaaS ($25K/Month Goal)

**Document Purpose:** Step-by-step implementation of payment processors for Targetym  
**Timeline:** 5-7 days (Days 1-5 of 2-week sprint)  
**Priority:** CRITICAL (Revenue blocker)

---

## PART 1: RAZORPAY INTEGRATION (India-First)

### 1.1 Setup & Configuration

#### Step 1: Create Razorpay Account
```
1. Go to https://razorpay.com
2. Sign up (email verification)
3. Navigate to Settings → API Keys
4. Copy:
   - Key ID (RAZORPAY_KEY_ID)
   - Key Secret (RAZORPAY_KEY_SECRET)
5. Add to .env.local and render.yaml secrets
```

#### Step 2: Environment Variables
```bash
# .env.local (development)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx

# render.yaml (production - update with live keys)
envVars:
  - key: RAZORPAY_KEY_ID
    scope: secret
    value: [production key]
  - key: RAZORPAY_KEY_SECRET
    scope: secret
    value: [production key]
```

#### Step 3: Install Dependencies
```bash
pnpm add razorpay
```

#### Step 4: Razorpay Service Layer
```typescript
// src/lib/payment/razorpay/client.ts
import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Helper: Verify webhook signature
export function verifyRazorpaySignature(
  body: string,
  signature: string
): boolean {
  try {
    return razorpay.utils.verifyWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return false
  }
}

// Helper: Create order
export async function createRazorpayOrder(
  amount: number, // in INR
  receipt: string,
  notes: Record<string, string>
) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt,
      notes,
    })
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
    }
  } catch (error) {
    console.error('Failed to create Razorpay order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper: Fetch payment details
export async function getRazorpayPayment(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    throw error
  }
}

// Helper: Create subscription (recurring)
export async function createRazorpaySubscription(
  planId: string,
  customerId: string,
  notes: Record<string, string>
) {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      notes,
      expire_by: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
    })
    
    return {
      success: true,
      subscriptionId: subscription.id,
    }
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

---

### 1.2 Checkout API

#### Step 5: Razorpay Checkout Endpoint
```typescript
// app/api/checkout/razorpay/route.ts
import { auth } from '@clerk/nextjs/server'
import { razorpay, createRazorpayOrder } from '@/src/lib/payment/razorpay'
import { db } from '@/src/lib/db'

const PLANS = {
  pro_monthly: { amount: 4900, duration: 'monthly', name: 'Pro (₹4,900/month)' },
  pro_annual: { amount: 49900, duration: 'annual', name: 'Pro (₹49,900/year)' },
  enterprise: { amount: 49900, duration: 'custom', name: 'Enterprise' },
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { planId } = await req.json()
    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan) {
      return new Response('Invalid plan', { status: 400 })
    }

    // Get user's organization
    const org = await db.organization.findFirst({
      where: {
        members: {
          some: { userId }
        }
      }
    })

    if (!org) {
      return new Response('Organization not found', { status: 404 })
    }

    // Create Razorpay order
    const orderResult = await createRazorpayOrder(
      plan.amount,
      `org-${org.id}`,
      {
        organizationId: org.id,
        userId,
        planId,
        email: (await db.user.findUnique({ where: { id: userId } }))?.email || 'unknown',
      }
    )

    if (!orderResult.success) {
      return new Response(JSON.stringify(orderResult), { status: 500 })
    }

    return Response.json({
      success: true,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(JSON.stringify({ error: 'Checkout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

#### Step 6: Frontend Razorpay Checkout
```typescript
// components/payment/RazorpayCheckout.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutProps {
  planId: string
  planName: string
  onSuccess?: (paymentId: string) => void
}

export function RazorpayCheckout({
  planId,
  planName,
  onSuccess,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    try {
      setLoading(true)

      // 1. Create order on backend
      const response = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const { orderId, amount, currency, key } = await response.json()

      // 2. Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        // 3. Open Razorpay checkout
        const razorpay = new window.Razorpay({
          key,
          order_id: orderId,
          amount,
          currency,
          name: 'Targetym',
          description: planName,
          theme: {
            color: '#000000',
          },
          handler: async (response: any) => {
            // 4. Verify payment on backend
            const verifyResponse = await fetch('/api/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                planId,
              }),
            })

            if (!verifyResponse.ok) {
              toast({
                title: 'Payment verification failed',
                description: 'Please contact support.',
                variant: 'destructive',
              })
              return
            }

            const verifyData = await verifyResponse.json()
            if (verifyData.success) {
              toast({
                title: 'Payment successful!',
                description: 'Your subscription has been activated.',
              })
              onSuccess?.(response.razorpay_payment_id)
              // Redirect or update UI
              window.location.href = '/dashboard'
            }
          },
          modal: {
            ondismiss: () => {
              toast({
                title: 'Payment cancelled',
                description: 'You cancelled the checkout.',
              })
            },
          },
        })

        razorpay.open()
      }
      document.body.appendChild(script)
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: 'Checkout error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} size="lg">
      {loading ? 'Processing...' : `Subscribe - ₹${planId === 'pro_annual' ? '49,900' : '4,900'}`}
    </Button>
  )
}
```

---

### 1.3 Webhook Handler

#### Step 7: Razorpay Webhook Processing
```typescript
// app/api/webhooks/razorpay/route.ts
import { verifyRazorpaySignature } from '@/src/lib/payment/razorpay'
import { db } from '@/src/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature || !verifyRazorpaySignature(body, signature)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(event.payload.subscription)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription)
        break

      case 'subscription.paused':
        await handleSubscriptionPaused(event.payload.subscription)
        break
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handlePaymentAuthorized(payment: any) {
  console.log('Payment authorized:', payment.id)
  
  const notes = payment.notes
  const org = await db.organization.findUnique({
    where: { id: notes.organizationId }
  })

  if (!org) return

  // Update subscription status
  await db.organization.update({
    where: { id: org.id },
    data: {
      subscription_status: 'active',
      subscription_tier: getPlanTier(notes.planId),
      razorpay_payment_id: payment.id,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  })

  // Send confirmation email
  await sendPaymentConfirmationEmail(org.id, payment)
}

async function handlePaymentFailed(payment: any) {
  console.log('Payment failed:', payment.id)
  
  const notes = payment.notes
  const org = await db.organization.findUnique({
    where: { id: notes.organizationId }
  })

  if (!org) return

  // Send retry email
  await sendPaymentFailedEmail(org.id, payment)
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id)
  
  const notes = subscription.notes
  const org = await db.organization.findUnique({
    where: { id: notes.organizationId }
  })

  if (!org) return

  await db.organization.update({
    where: { id: org.id },
    data: {
      razorpay_subscription_id: subscription.id,
      subscription_status: subscription.status,
    }
  })
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('Subscription cancelled:', subscription.id)
  
  const org = await db.organization.findFirst({
    where: { razorpay_subscription_id: subscription.id }
  })

  if (!org) return

  await db.organization.update({
    where: { id: org.id },
    data: {
      subscription_status: 'cancelled',
      subscription_tier: 'free',
    }
  })

  // Send churn recovery email
  await sendChurnRecoveryEmail(org.id)
}

function getPlanTier(planId: string): string {
  const tierMap: Record<string, string> = {
    pro_monthly: 'pro',
    pro_annual: 'pro',
    enterprise: 'enterprise',
  }
  return tierMap[planId] || 'free'
}
```

#### Step 8: Payment Verification Endpoint
```typescript
// app/api/checkout/razorpay/verify/route.ts
import { auth } from '@clerk/nextjs/server'
import { razorpay } from '@/src/lib/payment/razorpay'
import { db } from '@/src/lib/db'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const { paymentId, orderId, signature, planId } = await req.json()

    // Verify signature
    const isValid = razorpay.utils.verifyPaymentSignature({
      order_id: orderId,
      payment_id: paymentId,
      signature,
    })

    if (!isValid) {
      return Response.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    // Fetch payment details
    const payment = await razorpay.payments.fetch(paymentId)

    // Update organization
    const org = await db.organization.findFirst({
      where: { members: { some: { userId } } }
    })

    if (!org) {
      return Response.json({ success: false, error: 'Organization not found' }, { status: 404 })
    }

    const tier = planId.includes('enterprise') ? 'enterprise' : 'pro'
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + (planId.includes('annual') ? 365 : 30))

    await db.organization.update({
      where: { id: org.id },
      data: {
        subscription_tier: tier,
        subscription_status: 'active',
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        current_period_end: expiryDate,
      }
    })

    // Log payment
    await db.payment.create({
      data: {
        organizationId: org.id,
        provider: 'razorpay',
        paymentId,
        orderId,
        amount: payment.amount / 100, // Convert from paise
        currency: payment.currency,
        status: payment.status,
        metadata: payment,
      }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Verification error:', error)
    return Response.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
```

---

## PART 2: STRIPE INTEGRATION (Global)

### 2.1 Setup

#### Step 1: Create Stripe Account
```
1. Go to https://stripe.com
2. Sign up
3. Verify email
4. Go to Settings → API Keys
5. Copy:
   - Publishable key
   - Secret key
6. Add to .env.local
```

#### Step 2: Environment Variables
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Step 3: Install Stripe SDK
```bash
pnpm add @stripe/stripe-js stripe
```

#### Step 4: Stripe Service Layer
```typescript
// src/lib/payment/stripe/client.ts
import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  { apiVersion: '2024-12-15' }
)

export async function createStripeCheckoutSession(
  organizationId: string,
  planId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: organizationId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: getPlanAmount(planId), // In cents
            recurring: {
              interval: planId.includes('annual') ? 'year' : 'month',
            },
            product_data: {
              name: getPlanName(planId),
              description: 'Targetym HR Platform',
            },
          },
          quantity: 1,
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organizationId,
          planId,
        }
      }
    })

    return { success: true, sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Failed to create Stripe session:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown' }
  }
}

function getPlanAmount(planId: string): number {
  const amounts: Record<string, number> = {
    pro_monthly: 4900, // $49
    pro_annual: 49900, // $499 (but better value)
    enterprise: 0, // Custom
  }
  return amounts[planId] || 0
}

function getPlanName(planId: string): string {
  const names: Record<string, string> = {
    pro_monthly: 'Pro Plan - Monthly',
    pro_annual: 'Pro Plan - Annual',
    enterprise: 'Enterprise Plan',
  }
  return names[planId] || 'Targetym Plan'
}
```

### 2.2 Stripe Checkout

#### Step 5: Stripe Checkout Endpoint
```typescript
// app/api/checkout/stripe/route.ts
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/src/lib/payment/stripe'
import { db } from '@/src/lib/db'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const { planId } = await req.json()

    const org = await db.organization.findFirst({
      where: { members: { some: { userId } } }
    })

    if (!org) return new Response('Organization not found', { status: 404 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user?.email) return new Response('User email not found', { status: 400 })

    const headersList = headers()
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
    const origin = `${protocol}://${host}`

    const result = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: org.id,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 4900, // $49/month
            recurring: { interval: 'month' },
            product_data: {
              name: 'Targetym Pro',
            }
          },
          quantity: 1,
        }
      ],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing`,
    })

    return Response.json({ url: result.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
```

#### Step 6: Frontend Stripe Checkout
```typescript
// components/payment/StripeCheckout.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface StripeCheckoutProps {
  planId: string
  planName: string
  amount: number
  onSuccess?: () => void
}

export function StripeCheckout({
  planId,
  planName,
  amount,
  onSuccess,
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Checkout failed',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} size="lg">
      {loading ? 'Processing...' : `Subscribe - $${(amount / 100).toFixed(2)}`}
    </Button>
  )
}
```

### 2.3 Stripe Webhook

#### Step 7: Stripe Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/src/lib/payment/stripe'
import { db } from '@/src/lib/db'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Webhook error', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      await handleCheckoutComplete(session)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      await handleSubscriptionUpdate(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await handleSubscriptionCancelled(subscription)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      await handlePaymentFailed(invoice)
      break
    }
  }

  return Response.json({ received: true })
}

async function handleCheckoutComplete(session: any) {
  if (!session.client_reference_id) return

  const org = await db.organization.findUnique({
    where: { id: session.client_reference_id }
  })

  if (!org) return

  await db.organization.update({
    where: { id: org.id },
    data: {
      subscription_tier: 'pro',
      subscription_status: 'active',
      stripe_customer_id: session.customer,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  })
}

async function handleSubscriptionUpdate(subscription: any) {
  const org = await db.organization.findFirst({
    where: { stripe_customer_id: subscription.customer }
  })

  if (!org) return

  await db.organization.update({
    where: { id: org.id },
    data: {
      subscription_status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
    }
  })
}

async function handleSubscriptionCancelled(subscription: any) {
  const org = await db.organization.findFirst({
    where: { stripe_customer_id: subscription.customer }
  })

  if (!org) return

  await db.organization.update({
    where: { id: org.id },
    data: {
      subscription_tier: 'free',
      subscription_status: 'cancelled',
    }
  })
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed for invoice:', invoice.id)
  // Send retry email
}
```

---

## PART 3: PAYMENT PROCESSOR SELECTION LOGIC

### 3.1 Determine Which Processor to Use

```typescript
// src/lib/payment/processor-selection.ts
import { headers } from 'next/headers'
import { GeoIP } from '@/src/lib/geoip'

export type PaymentProcessor = 'razorpay' | 'stripe'

export async function getPaymentProcessor(
  organizationRegion?: string,
  userLocation?: string
): Promise<PaymentProcessor> {
  // 1. Explicit region preference
  if (organizationRegion === 'IN') return 'razorpay'
  if (organizationRegion === 'US' || organizationRegion === 'EU') return 'stripe'

  // 2. User's geo-location (from IP)
  if (!userLocation) {
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    userLocation = await GeoIP.getCountry(ip)
  }

  if (userLocation === 'IN') return 'razorpay'
  if (['US', 'GB', 'DE', 'FR'].includes(userLocation)) return 'stripe'

  // 3. Default to Stripe (global fallback)
  return 'stripe'
}

// Frontend utility to choose processor
export function shouldUseRazorpay(userCountry?: string): boolean {
  // India and other SAARC countries prefer Razorpay
  const razorpayCountries = ['IN', 'BD', 'PK', 'LK', 'NP', 'BT', 'MV', 'AF']
  return razorpayCountries.includes(userCountry || 'US')
}
```

### 3.2 Unified Checkout Component

```typescript
// components/payment/UnifiedCheckout.tsx
'use client'

import { useEffect, useState } from 'react'
import { RazorpayCheckout } from './RazorpayCheckout'
import { StripeCheckout } from './StripeCheckout'

interface UnifiedCheckoutProps {
  planId: string
  planName: string
  userCountry?: string
  onSuccess?: () => void
}

export function UnifiedCheckout({
  planId,
  planName,
  userCountry,
  onSuccess,
}: UnifiedCheckoutProps) {
  const [processor, setProcessor] = useState<'razorpay' | 'stripe' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Detect processor based on country
    const useRazorpay = ['IN', 'BD', 'PK'].includes(userCountry || 'US')
    setProcessor(useRazorpay ? 'razorpay' : 'stripe')
    setLoading(false)
  }, [userCountry])

  if (loading) {
    return <div>Loading payment options...</div>
  }

  if (processor === 'razorpay') {
    return (
      <RazorpayCheckout
        planId={planId}
        planName={planName}
        onSuccess={onSuccess}
      />
    )
  }

  return (
    <StripeCheckout
      planId={planId}
      planName={planName}
      amount={4900} // $49
      onSuccess={onSuccess}
    />
  )
}
```

---

## PART 4: PRICING TIER ENFORCEMENT

### 4.1 Feature Gates by Tier

```typescript
// src/lib/billing/feature-gates.ts
export const TIER_FEATURES = {
  free: {
    maxTeamMembers: 5,
    maxGoals: 10,
    aiCVScorings: 5,
    recruitmentPipelines: 1,
    performanceReviews: 0,
    analyticsAccess: false,
    apiAccess: false,
    supportLevel: 'email',
  },
  pro: {
    maxTeamMembers: 50,
    maxGoals: 1000,
    aiCVScorings: 100,
    recruitmentPipelines: 10,
    performanceReviews: 1000,
    analyticsAccess: true,
    apiAccess: true,
    supportLevel: 'priority-email',
  },
  enterprise: {
    maxTeamMembers: 10000,
    maxGoals: 100000,
    aiCVScorings: 10000,
    recruitmentPipelines: 1000,
    performanceReviews: 100000,
    analyticsAccess: true,
    apiAccess: true,
    supportLevel: 'dedicated',
  },
}

// Middleware to check feature access
export async function checkFeatureAccess(
  organizationId: string,
  feature: string
): Promise<boolean> {
  const org = await db.organization.findUnique({
    where: { id: organizationId }
  })

  if (!org) return false

  const tier = org.subscription_tier || 'free'
  const features = TIER_FEATURES[tier as keyof typeof TIER_FEATURES]

  // Check if feature is allowed for this tier
  return features[feature as keyof typeof features] !== false && 
         features[feature as keyof typeof features] !== 0
}

// Middleware to check quota
export async function checkQuota(
  organizationId: string,
  resource: string
): Promise<boolean> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      goals: true,
      candidates: true,
      performanceReviews: true,
    }
  })

  if (!org) return false

  const tier = org.subscription_tier || 'free'
  const limits = TIER_FEATURES[tier as keyof typeof TIER_FEATURES]

  // Check current usage vs limit
  switch (resource) {
    case 'goals':
      return (org.goals?.length || 0) < limits.maxGoals
    case 'candidates':
      return (org.candidates?.length || 0) < limits.maxTeamMembers * 10
    case 'reviews':
      return (org.performanceReviews?.length || 0) < limits.performanceReviews
    default:
      return true
  }
}
```

---

## PART 5: TESTING CHECKLIST

### Payment Integration Testing

```markdown
## Razorpay Testing

- [ ] Test mode working (key pair correct)
- [ ] Checkout page loads
- [ ] Razorpay modal opens
- [ ] Payment authorized → webhook received
- [ ] Subscription created in database
- [ ] Email confirmation sent
- [ ] Organization tier updated
- [ ] User can access Pro features
- [ ] Cancellation works
- [ ] Failed payment handling
- [ ] Webhook retry logic (intentional failure test)

## Stripe Testing

- [ ] Test mode working
- [ ] Checkout session created
- [ ] Redirect to Stripe Checkout
- [ ] Payment successful → webhook
- [ ] Subscription created
- [ ] Email confirmation
- [ ] Tier enforcement
- [ ] Feature gates working
- [ ] Subscription management (update, cancel)
- [ ] Invoice generation

## Payment Processor Selection

- [ ] India IP → Razorpay chosen
- [ ] US IP → Stripe chosen
- [ ] Explicit org region respected
- [ ] Fallback to Stripe if error

## Multi-Region Support

- [ ] INR pricing for India
- [ ] USD pricing for US/Global
- [ ] Currency conversion correct
- [ ] Tax calculations (if applicable)
```

---

## DEPLOYMENT CHECKLIST

```markdown
## Before Going Live

- [ ] Razorpay live account created + keys rotated
- [ ] Stripe live account created + keys added
- [ ] Webhooks configured for both processors
- [ ] Email sending working
- [ ] Database migrations run
- [ ] Feature gates implemented
- [ ] Rate limiting active
- [ ] Monitoring alerts set
- [ ] Error tracking enabled
- [ ] Backup procedures tested
- [ ] Incident response plan ready
```

---

**Next Steps:**
1. Implement Razorpay (Days 1-2)
2. Implement Stripe (Days 3-4)
3. Test both processors (Day 5)
4. Deploy to production (Days 6-7)
5. Monitor closely for first 48 hours

**Success Criteria:**
- ✅ No failed payments
- ✅ Webhooks 100% success
- ✅ Subscriptions activated correctly
- ✅ Feature gates working
- ✅ Tiers enforced properly

