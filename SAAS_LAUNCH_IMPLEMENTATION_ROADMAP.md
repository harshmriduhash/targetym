# Targetym SaaS Launch Implementation Roadmap

**Objective:** Transform Targetym from 7.5/10 SaaS-ready to 9+/10 production-ready  
**Timeline:** 2-3 weeks (10-15 business days)  
**Team Size:** 1-2 engineers  
**Scope:** Billing, API protection, documentation, launch prep  

---

## PHASE 1: BILLING INTEGRATION (3-5 Days)

### Goal: Accept customer payments and manage subscriptions

#### Week 1, Days 1-2: Stripe Setup

**Deliverables:**
- [ ] Stripe account created (live mode)
- [ ] API keys added to environment
- [ ] Webhook signing secret configured
- [ ] Customer portal configured

**Tasks:**

1. **Setup Stripe Account**
   - Create Stripe account at stripe.com
   - Enable Radar fraud detection
   - Configure webhook signing secret
   - Add API keys to `render.yaml` secrets

   ```bash
   # Add to render.yaml
   - key: STRIPE_SECRET_KEY
     scope: secret
   - key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
     scope: env
   - key: STRIPE_WEBHOOK_SECRET
     scope: secret
   ```

2. **Install Dependencies**
   ```bash
   pnpm add @stripe/stripe-js stripe
   ```

3. **Create Stripe Service**
   ```typescript
   // src/lib/stripe/client.ts
   import Stripe from 'stripe'
   
   export const stripe = new Stripe(
     process.env.STRIPE_SECRET_KEY!,
     { apiVersion: '2024-12-15' }
   )
   ```

4. **Create Pricing Models in Stripe Dashboard**
   - Free: $0/month (free tier features)
   - Pro: $49/month (professional tier)
   - Enterprise: Custom pricing

**Success Criteria:**
- Stripe API keys working
- Products created in Stripe Dashboard
- Webhook endpoint ready for testing

---

#### Week 1, Day 3: Checkout Flow

**Deliverables:**
- [ ] Checkout page created
- [ ] Stripe Checkout Session creation
- [ ] Success/cancel redirect handling

**Tasks:**

1. **Create Checkout Endpoint**
   ```typescript
   // app/api/checkout/route.ts
   export async function POST(req: Request) {
     const { userId } = await auth()
     if (!userId) return new Response('Unauthorized', { status: 401 })
     
     const { planId } = await req.json()
     
     // Get or create Stripe customer
     const customer = await getOrCreateStripeCustomer(userId)
     
     // Create checkout session
     const session = await stripe.checkout.sessions.create({
       customer: customer.id,
       mode: 'subscription',
       line_items: [{ price: planId, quantity: 1 }],
       success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${origin}/pricing`,
     })
     
     return Response.json({ url: session.url })
   }
   ```

2. **Create Checkout Page**
   ```typescript
   // app/checkout/page.tsx
   export default async function CheckoutPage() {
     const { userId } = await auth()
     if (!userId) redirect('/auth/sign-in')
     
     return (
       <div>
         <h1>Upgrade Your Plan</h1>
         <PricingCards onCheckout={handleCheckout} />
       </div>
     )
   }
   ```

3. **Handle Success Redirect**
   ```typescript
   // app/dashboard/page.tsx
   const { session_id } = searchParams
   if (session_id) {
     // Verify and activate subscription
     await verifyCheckoutSession(session_id)
   }
   ```

**Success Criteria:**
- Checkout page accessible from pricing
- Stripe Checkout loads correctly
- Success redirect works
- No errors in Sentry

---

#### Week 1, Days 4-5: Subscription Management

**Deliverables:**
- [ ] Webhook receiver implemented
- [ ] Subscription status updates working
- [ ] Customer portal link
- [ ] Subscription cancellation

**Tasks:**

1. **Create Webhook Receiver**
   ```typescript
   // app/api/webhooks/stripe/route.ts
   import { stripe } from '@/src/lib/stripe'
   
   export async function POST(req: Request) {
     const sig = req.headers.get('stripe-signature')!
     const body = await req.text()
     
     const event = stripe.webhooks.constructEvent(
       body,
       sig,
       process.env.STRIPE_WEBHOOK_SECRET!
     )
     
     switch (event.type) {
       case 'customer.subscription.created':
       case 'customer.subscription.updated':
         await handleSubscriptionUpdate(event.data.object)
         break
       case 'customer.subscription.deleted':
         await handleSubscriptionCanceled(event.data.object)
         break
       case 'invoice.payment_failed':
         await handlePaymentFailed(event.data.object)
         break
     }
     
     return Response.json({ received: true })
   }
   ```

2. **Update Organization on Subscription**
   ```typescript
   // src/lib/stripe/handlers.ts
   export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
     const customer = subscription.customer as string
     const org = await db.organization.findUnique({
       where: { stripe_customer_id: customer }
     })
     
     if (!org) return
     
     const plan = getPlanFromPriceId(subscription.items.data[0].price.id)
     await db.organization.update({
       where: { id: org.id },
       data: {
         subscription_tier: plan,
         subscription_status: subscription.status,
         current_period_end: new Date(subscription.current_period_end * 1000),
       }
     })
   }
   ```

3. **Add Customer Portal Link**
   ```typescript
   // app/api/customer-portal/route.ts
   export async function POST(req: Request) {
     const { userId } = await auth()
     const customer = await getStripeCustomer(userId)
     
     const session = await stripe.billingPortal.sessions.create({
       customer: customer.id,
       return_url: `${origin}/dashboard/settings`,
     })
     
     return Response.json({ url: session.url })
   }
   ```

4. **Add Subscription Status Endpoint**
   ```typescript
   // app/api/v1/subscription/route.ts
   export async function GET(req: Request) {
     const { userId } = await auth()
     const org = await getOrgForUser(userId)
     
     return Response.json({
       plan: org.subscription_tier,
       status: org.subscription_status,
       periodEnd: org.current_period_end,
     })
   }
   ```

**Success Criteria:**
- Webhook receiver validates signatures
- Subscription updates in database
- Customer portal works
- Status endpoint returns current tier

---

### Total Billing Implementation: 3-5 Days

```
Day 1: Setup (Stripe account, keys, products)
Day 2: Checkout (page, session, redirects)
Day 3: Webhooks (listener, handlers)
Day 4: Portal & subscription management
Day 5: Testing & refinement
```

---

## PHASE 2: RATE LIMITING EXPANSION (1-2 Days)

### Goal: Protect all APIs from abuse

#### Day 1: Apply Rate Limiter to All Endpoints

**Current State:**
- Rate limiter framework exists
- Only health/ready endpoints protected
- 80% of endpoints unprotected

**Tasks:**

1. **Update Rate Limiter Middleware**
   ```typescript
   // src/lib/middleware/rate-limiter.ts - Enhanced
   
   export async function applyRateLimit(
     req: Request,
     userId?: string,
     orgId?: string
   ): Promise<RateLimitResult> {
     const ip = getClientIp(req)
     
     // Determine tier
     let tier = 'public'
     if (userId && orgId) {
       const org = await getOrg(orgId)
       tier = org.subscription_tier // free, pro, enterprise
     } else if (userId) {
       tier = 'authenticated'
     }
     
     const config = RATE_LIMITS_BY_TIER[tier]
     return checkRateLimit(`${tier}:${ip}:${userId}`, config)
   }
   ```

2. **Create Rate Limiting Middleware**
   ```typescript
   // src/lib/middleware/apply-rate-limit.ts
   export async function withRateLimit(
     handler: (req: Request) => Promise<Response>
   ) {
     return async (req: Request) => {
       const { userId } = await auth()
       const result = await applyRateLimit(req, userId)
       
       if (!result.allowed) {
         return new Response('Too Many Requests', {
           status: 429,
           headers: {
             'Retry-After': result.retryAfter.toString(),
             'X-RateLimit-Limit': result.limit.toString(),
             'X-RateLimit-Remaining': result.remaining.toString(),
           }
         })
       }
       
       const response = await handler(req)
       response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
       return response
     }
   }
   ```

3. **Apply to All API Endpoints**
   ```typescript
   // app/api/v1/goals/route.ts
   export const GET = withRateLimit(async (req: Request) => {
     const { userId } = await auth()
     // ... existing logic
   })
   
   export const POST = withRateLimit(async (req: Request) => {
     const { userId } = await auth()
     // ... existing logic
   })
   ```

4. **Update Rate Limit Tiers**
   ```typescript
   export const RATE_LIMITS_BY_TIER = {
     free: { requests: 100, windowMs: 3600000 },  // 100/hour
     pro: { requests: 1000, windowMs: 3600000 },  // 1000/hour
     enterprise: { requests: 10000, windowMs: 3600000 }, // 10000/hour
     authenticated: { requests: 500, windowMs: 3600000 },
     public: { requests: 30, windowMs: 60000 },
   }
   ```

5. **Add Rate Limit Headers to Responses**
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset
   - Retry-After (on 429)

**Success Criteria:**
- All POST/PUT endpoints protected
- Correct limits applied per tier
- Headers returned in responses
- 429 errors on limit exceeded
- Tests verify protection

---

#### Day 2: Upgrade to Distributed Rate Limiting (Optional)

**For production with multiple instances:**

```typescript
// src/lib/middleware/redis-rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
})

export async function checkRateLimit(key: string) {
  return await ratelimit.limit(key)
}
```

**Success Criteria:**
- Redis connection working
- Rate limits enforced across instances
- Performance acceptable

---

### Total Rate Limiting: 1-2 Days

---

## PHASE 3: API DOCUMENTATION (2-3 Days)

### Goal: Enable developers to integrate

#### Day 1-2: Generate OpenAPI Specification

**Tasks:**

1. **Create OpenAPI Generator**
   ```typescript
   // scripts/generate-openapi.ts
   import fs from 'fs'
   
   const spec = {
     openapi: '3.0.0',
     info: {
       title: 'Targetym API',
       version: '1.0.0',
       description: 'HR Management Platform API',
     },
     servers: [
       { url: 'https://api.targetym.com', description: 'Production' },
       { url: 'http://localhost:3000', description: 'Development' },
     ],
     paths: {
       '/api/v1/goals': {
         get: {
           summary: 'List goals',
           tags: ['Goals'],
           security: [{ BearerAuth: [] }],
           parameters: [/* params */],
           responses: {
             '200': { description: 'Goals list', content: {...} },
             '401': { description: 'Unauthorized' },
             '429': { description: 'Rate limited' },
           }
         },
         post: {/* ... */}
       },
       // ... more endpoints
     },
     components: {
       securitySchemes: {
         BearerAuth: {
           type: 'http',
           scheme: 'bearer',
         }
       },
       schemas: {
         Goal: { /* schema */ },
         Candidate: { /* schema */ },
         // ... more schemas
       }
     }
   }
   
   fs.writeFileSync('openapi.json', JSON.stringify(spec, null, 2))
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "openapi:generate": "tsx scripts/generate-openapi.ts",
       "openapi:validate": "npm run openapi:generate && swagger-cli validate openapi.json"
     }
   }
   ```

3. **Setup Swagger UI**
   ```typescript
   // app/api-docs/page.tsx
   import SwaggerUI from 'swagger-ui-react'
   import spec from '../../../openapi.json'
   
   export default function ApiDocs() {
     return <SwaggerUI spec={spec} />
   }
   ```

4. **Host on Swagger Hub**
   - Create account at app.swaggerhub.com
   - Import OpenAPI spec
   - Generate interactive documentation
   - Share public link: https://app.swaggerhub.com/apis/targetym

**Success Criteria:**
- OpenAPI spec generated
- Swagger UI displays all endpoints
- Interactive documentation working
- Schema validation passing

---

#### Day 3: Write API Reference

**Create comprehensive API guide:**

```markdown
# Targetym API Reference

## Authentication
All endpoints require Bearer token:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://api.targetym.com/api/v1/goals
```

## Goals API

### List Goals
```
GET /api/v1/goals
```

**Query Parameters:**
- `skip`: Pagination offset (default: 0)
- `take`: Pagination limit (default: 10)
- `status`: Filter by status (draft, active, completed)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal-1",
      "title": "Q4 Revenue Target",
      "status": "active"
    }
  ],
  "meta": {
    "total": 100,
    "cursor": "next_cursor"
  }
}
```

### Create Goal
```
POST /api/v1/goals
```

**Request Body:**
```json
{
  "title": "Q4 Revenue Target",
  "description": "Increase revenue by 30%",
  "period": "Q4 2025"
}
```

**Response:** 201 Created

## Error Handling
All errors return standard format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

## Rate Limiting
- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour
- Enterprise: 10000 requests/hour

Response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

...
```

**Success Criteria:**
- All endpoints documented
- Example requests provided
- Response formats shown
- Error codes listed

---

### Total Documentation: 2-3 Days

---

## PHASE 4: SECURITY HARDENING (2-3 Days)

### Goal: Production-grade security

#### Tasks:

1. **Security Headers Audit**
   - Verify CSP policy
   - Check CORS configuration
   - Enable HTTPS enforcement
   - Add HSTS preload

2. **Dependency Audit**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Secrets Rotation**
   - Rotate all API keys
   - Update Stripe keys
   - Refresh Clerk keys

4. **Add Request Signing (Optional)**
   ```typescript
   // Verify webhook authenticity
   export function verifyWebhookSignature(
     body: string,
     signature: string,
     secret: string
   ): boolean {
     const hmac = crypto.createHmac('sha256', secret)
     const digest = hmac.update(body).digest('hex')
     return digest === signature
   }
   ```

5. **Database Security Review**
   - Verify RLS policies
   - Check table permissions
   - Enable encryption at rest

---

## PHASE 5: TESTING & VALIDATION (2-3 Days)

### Goal: Ensure everything works end-to-end

#### Tasks:

1. **Manual Testing**
   - [ ] Signup flow
   - [ ] Checkout flow (test mode)
   - [ ] Subscription update
   - [ ] API requests with various tiers
   - [ ] Rate limiting triggers
   - [ ] Error handling

2. **Load Testing**
   ```bash
   npm install -g artillery
   artillery quick --count 100 --num 1000 https://api.targetym.com/api/v1/health
   ```

3. **Security Testing**
   ```bash
   npm audit
   npm run lint
   npm run type-check
   npm test
   ```

4. **Production Checklist**
   - [ ] Database backups configured
   - [ ] Monitoring alerts set
   - [ ] Error tracking enabled
   - [ ] Health checks working
   - [ ] Rate limits enforced
   - [ ] Billing working in live mode
   - [ ] Documentation live

---

## PHASE 6: LAUNCH PREPARATION (1-2 Days)

### Goal: Go live

#### Pre-Launch Checklist

**Infrastructure:**
- [ ] Production database backed up
- [ ] Render deployment configured
- [ ] SSL certificate valid
- [ ] Health checks passing

**Billing:**
- [ ] Stripe in live mode
- [ ] Tax settings configured
- [ ] Receipt templates ready
- [ ] Invoice storage working

**Security:**
- [ ] Secrets rotated
- [ ] Security headers verified
- [ ] CORS whitelist final
- [ ] Rate limits tested

**Monitoring:**
- [ ] Sentry alerts enabled
- [ ] Dashboard created
- [ ] Notification channels set
- [ ] On-call rotation defined

**Documentation:**
- [ ] API docs deployed
- [ ] README updated
- [ ] Troubleshooting guide written
- [ ] Runbook for operations

**Communication:**
- [ ] Launch announcement ready
- [ ] Early access list prepared
- [ ] Support email configured
- [ ] FAQ published

---

## IMPLEMENTATION TIMELINE

```
Week 1:
  Mon    Tue    Wed    Thu    Fri
  ────────────────────────────────
  🔴S1  🔴S2   🔴S3   🟡S2   🟡S3
  Stripe Checkout Webhooks Rate Limits API Docs (start)

Week 2:
  Mon    Tue    Wed    Thu    Fri
  ────────────────────────────────
  🟡S3   🟠S4   🟠S4   🟠S5   🟢Ready
  Docs   Security Testing Launch Prep  ✅ PRODUCTION

Legend:
🔴 Critical (Blocking)
🟡 Important (High)
🟠 Medium (Polish)
🟢 Complete
```

---

## SUCCESS CRITERIA

### By End of Week 1:
- [ ] Stripe billing working
- [ ] Rate limiting expanded to all endpoints
- [ ] OpenAPI spec generated

### By End of Week 2:
- [ ] Complete API documentation
- [ ] Security audit completed
- [ ] All tests passing
- [ ] Load testing completed

### Launch Ready (Day 14):
- [ ] SaaS score improved from 7.5 → 9+
- [ ] All critical gaps closed
- [ ] Production deployment verified
- [ ] Ready to accept customers

---

## RESOURCE ALLOCATION

### Week 1: Engineering (Full-time, 1-2 people)
```
Engineer 1: Stripe integration (3-4 days)
Engineer 2: Rate limiting + Docs (2-3 days)
```

### Week 2: Engineering + QA
```
Engineer 1: Documentation + Security (2-3 days)
Engineer 2: Testing + Validation (2-3 days)
QA: Manual testing + edge cases (2-3 days)
```

### Week 3: Deployment + Monitoring
```
DevOps/Engineer: Final deployment + monitoring setup (1-2 days)
On-call support: 24/7 monitoring first week of launch
```

---

## RISK MITIGATION

### Risk: Stripe Integration Issues
- **Mitigation:** Use Stripe test mode first, comprehensive testing
- **Fallback:** Stripe has excellent docs and support

### Risk: Rate Limiting Breaks APIs
- **Mitigation:** Gradual rollout, monitor metrics
- **Fallback:** Disable specific tier limits temporarily

### Risk: Documentation Incomplete
- **Mitigation:** Use code generation, OpenAPI validation
- **Fallback:** Manual updates after launch

### Risk: Performance Degradation
- **Mitigation:** Load testing before launch
- **Fallback:** Scale up Render plan temporarily

---

## COMPLETION CRITERIA

✅ **Project Complete When:**

1. Billing system live and tested (real Stripe account)
2. Rate limiting applied to 100% of API endpoints
3. OpenAPI documentation published and validated
4. Security audit completed and hardening applied
5. All tests passing (unit, integration, E2E)
6. Load testing shows acceptable performance
7. Monitoring and alerts configured
8. Team trained on operations
9. Launch communication ready
10. First paying customer acquired

---

## POST-LAUNCH ROADMAP

**Week 1 Post-Launch:**
- Monitor metrics closely
- Fix any critical issues
- Gather user feedback

**Month 1:**
- Email notification system
- Advanced analytics
- Custom integrations

**Month 2:**
- Compliance certifications (SOC2)
- GraphQL API
- Mobile app support

---

*This roadmap is designed to be executed by 1-2 engineers over 2-3 weeks, bringing Targetym from 7.5/10 SaaS-ready to 9+/10 production-ready.*

**Start date:** December 4, 2025  
**Target launch:** December 18-21, 2025  
**Next review:** December 6, 2025 (after Day 2)
