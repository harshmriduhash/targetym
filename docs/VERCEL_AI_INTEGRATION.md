# Vercel AI SDK Integration Guide

## 🎯 Overview

This guide documents the complete integration of Vercel AI SDK into the Targetym HR platform. The integration provides production-ready AI features including:

- **CV Scoring**: Automated candidate CV analysis with Claude/OpenAI
- **Performance Synthesis**: AI-powered performance review insights
- **Career Recommendations**: Personalized career path guidance
- **Conversational AI**: Streaming chat interface for HR assistance

## 📐 Architecture

### Tech Stack

- **Frontend**: Next.js 15.5.4 (App Router), React 19, TypeScript
- **AI SDK**: Vercel AI SDK (core, UI, RSC)
- **LLM Providers**: Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o
- **Auth**: Supabase Auth (integrated with AI routes)
- **Streaming**: Edge Runtime for real-time AI responses

### File Structure

```
targetym/
├── src/
│   ├── lib/
│   │   └── services/
│   │       └── ai.service.ts           # Core AI service (600 lines)
│   ├── types/
│   │   └── ai.types.ts                # AI TypeScript types (200 lines)
│   ├── components/
│   │   └── ai/
│   │       ├── AIChat.tsx             # Streaming chat component
│   │       ├── CVScoringPanel.tsx     # CV scoring UI
│   │       └── index.ts               # Exports
│   └── actions/
│       └── ai/
│           ├── score-cv.ts            # CV scoring action
│           ├── synthesize-performance.ts
│           └── recommend-career.ts
├── app/
│   └── api/
│       └── ai/
│           ├── chat/
│           │   └── route.ts           # Streaming chat API
│           └── score-cv/
│               └── route.ts           # CV scoring API
├── next.config.ts                      # AI-optimized config
└── .env.example                        # Environment template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Vercel AI SDK packages (already installed)
npm install ai @ai-sdk/anthropic @ai-sdk/openai
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required: Choose AI provider
AI_PROVIDER=anthropic

# Option 1: Anthropic Claude (Recommended)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Option 2: OpenAI
# OPENAI_API_KEY=sk-...

# Optional: Expose provider to client
NEXT_PUBLIC_AI_PROVIDER=anthropic
```

### 3. Get API Keys

#### Anthropic Claude (Recommended)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

#### OpenAI (Alternative)

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click **Create new secret key**
4. Copy the key (starts with `sk-`)
5. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### 4. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 💡 Usage Examples

### Example 1: AI Chat Component

```typescript
// app/dashboard/ai-assistant/page.tsx
'use client'

import { AIChat } from '@/src/components/ai'

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
      <AIChat
        topic="general"
        placeholder="Ask me about HR management, goals, or recruitment..."
        maxHeight="700px"
      />
    </div>
  )
}
```

### Example 2: CV Scoring in Recruitment

```typescript
// app/dashboard/recruitment/candidates/[id]/page.tsx
'use client'

import { CVScoringPanel } from '@/src/components/ai'

export default function CandidateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const handleScoreComplete = (result) => {
    console.log('CV Scored:', result)
    // Update UI, show notification, etc.
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Analysis</h1>
      <CVScoringPanel
        candidateId={params.id}
        candidateName="John Doe"
        onScoreComplete={handleScoreComplete}
      />
    </div>
  )
}
```

### Example 3: Using AI Service Directly

```typescript
// In a Server Action or API Route
import { aiService } from '@/src/lib/services/ai.service'

export async function analyzeCandidateCV(candidateId: string) {
  const cvText = await fetchCVText(candidateId)
  const jobDescription = await fetchJobDescription(jobId)
  const requirements = ['5+ years experience', 'TypeScript', 'React']

  const scoring = await aiService.scoreCandidateCV(
    cvText,
    jobDescription,
    requirements
  )

  return scoring
}
```

## 🔐 Security Best Practices

### 1. API Key Protection

**✅ DO:**
- Store API keys in environment variables
- Use `.env.local` for local development
- Configure keys in Vercel dashboard for production
- Never expose `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to client

**❌ DON'T:**
- Commit `.env.local` to git
- Use API keys in client-side code
- Share API keys in public repositories

### 2. Authentication & Authorization

All AI routes are protected:

```typescript
// app/api/ai/chat/route.ts
export async function POST(req: Request) {
  // 1. Authenticate user
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'hr'].includes(profile.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Process AI request
  // ...
}
```

### 3. Rate Limiting

AI routes inherit existing rate limiting middleware:

```typescript
// src/actions/ai/score-cv.ts
export async function scoreCandidateCV(candidateId: string) {
  return withActionRateLimit('ai', async () => {
    return withCSRFProtection(async () => {
      // AI operation (limited to 3 requests/min)
    })
  })
}
```

### 4. Input Validation

Always validate inputs:

```typescript
import { z } from 'zod'

const cvScoringSchema = z.object({
  candidateId: z.string().uuid(),
})

// Validate before processing
const validated = cvScoringSchema.parse(input)
```

## ⚡ Performance Optimization

### 1. Edge Runtime for Streaming

```typescript
// app/api/ai/chat/route.ts
export const runtime = 'edge' // Enable Edge Runtime
export const maxDuration = 30 // Maximum 30 seconds
```

**Benefits:**
- Lower latency (runs closer to users)
- Better streaming performance
- Automatic global distribution

### 2. Fallback Responses

AI service provides graceful fallbacks when API is unavailable:

```typescript
// src/lib/services/ai.service.ts
async scoreCandidateCV() {
  if (!this.isAIAvailable()) {
    return this.getFallbackCVScore()
  }

  try {
    return await this.performAIScoring()
  } catch (error) {
    return this.getFallbackCVScore() // Graceful degradation
  }
}
```

### 3. Caching Strategy

```typescript
// For non-streaming endpoints, use caching
export const revalidate = 3600 // Cache for 1 hour

// Or use Vercel Data Cache
import { unstable_cache } from 'next/cache'

const getCachedInsights = unstable_cache(
  async (orgId) => await aiService.generateInsights(orgId),
  ['ai-insights'],
  { revalidate: 3600 }
)
```

## 🧪 Testing

### Local Testing

```bash
# 1. Start development server
npm run dev

# 2. Test AI chat
curl http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: supabase-auth-token=..." \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# 3. Test CV scoring
curl http://localhost:3001/api/ai/score-cv \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"uuid-here"}'
```

### Unit Tests

```typescript
// __tests__/unit/services/ai.service.test.ts
import { aiService } from '@/src/lib/services/ai.service'

describe('AIService', () => {
  it('should score CV with fallback when API unavailable', async () => {
    const result = await aiService.scoreCandidateCV(
      'CV text',
      'Job description',
      ['Requirement 1']
    )

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
```

## 🚢 Deployment to Vercel

### 1. Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
# Production
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_PROVIDER=anthropic
NEXT_PUBLIC_AI_PROVIDER=anthropic

# Preview (optional - use separate keys)
ANTHROPIC_API_KEY=sk-ant-api03-preview-...

# Development
ANTHROPIC_API_KEY=sk-ant-api03-dev-...
```

### 2. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

```bash
# Test chat endpoint
curl https://your-app.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Test"}]}'
```

## 🛠️ Advanced Configuration

### Custom AI Model Selection

```typescript
// src/lib/services/ai.service.ts
private getModel() {
  const provider = process.env.AI_PROVIDER || 'anthropic'

  if (provider === 'anthropic') {
    // Use different Claude models
    return anthropic('claude-3-5-sonnet-20241022') // Default
    // return anthropic('claude-3-opus-20240229')   // Most capable
    // return anthropic('claude-3-haiku-20240307')  // Fastest
  }

  if (provider === 'openai') {
    return openai('gpt-4o')      // Default
    // return openai('gpt-4o-mini') // Faster, cheaper
  }
}
```

### Streaming Configuration

```typescript
// Customize streaming behavior
const result = await streamText({
  model,
  messages,
  temperature: 0.7,  // Creativity (0-1)
  maxTokens: 2000,   // Response length
  topP: 0.9,         // Nucleus sampling
})
```

### Context Window Management

```typescript
// Limit conversation history to prevent token overflow
const recentMessages = messages.slice(-10) // Last 10 messages

const result = await streamText({
  model,
  messages: [systemMessage, ...recentMessages],
})
```

## 📊 Monitoring & Observability

### Logging

All AI operations are logged with structured data:

```typescript
logger.info('CV scored successfully', {
  candidateId,
  score: result.score,
  recommendation: result.recommendation,
  processingTime: result.processingTime,
  model: result.aiModel,
})
```

### Metrics to Track

- **Latency**: Time to first token, total response time
- **Success Rate**: % of successful AI requests
- **Error Rate**: API failures, timeouts
- **Token Usage**: Track costs and usage patterns
- **User Satisfaction**: Feedback on AI responses

### Vercel Analytics

Enable Web Analytics and Speed Insights in Vercel dashboard:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## 🐛 Troubleshooting

### Issue: "AI service not configured"

**Cause**: Missing API keys

**Solution**:
```bash
# Check .env.local
cat .env.local | grep API_KEY

# Restart server
npm run dev
```

### Issue: "Rate limit exceeded"

**Cause**: Too many AI requests

**Solution**:
- Wait 1 minute (rate limit: 3 requests/min)
- Adjust rate limits in `src/lib/middleware/action-rate-limit.ts`

### Issue: Streaming not working

**Cause**: Incorrect route configuration

**Solution**:
```typescript
// Ensure Edge Runtime is enabled
export const runtime = 'edge'

// Check streaming is returned
return result.toDataStreamResponse()
```

### Issue: TypeScript errors

**Cause**: Missing type definitions

**Solution**:
```bash
# Regenerate Supabase types
npm run supabase:types

# Check imports
npm run type-check
```

## 📚 Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Next.js Streaming Docs](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Targetym CLAUDE.md](./CLAUDE.md) - Project architecture

## 🎉 What's Next?

### Short-term Enhancements

- [ ] Add voice-to-text for voice-based HR queries
- [ ] Implement AI-powered job description generator
- [ ] Create AI interview question generator
- [ ] Add sentiment analysis for feedback

### Long-term Vision

- [ ] Multi-agent AI orchestration for complex HR workflows
- [ ] Fine-tuned models for HR domain-specific tasks
- [ ] AI-powered predictive analytics for retention
- [ ] Integration with HR knowledge bases (RAG)

## 🙏 Credits

- **Vercel AI SDK**: Streaming AI infrastructure
- **Anthropic**: Claude 3.5 Sonnet LLM
- **OpenAI**: GPT-4o LLM
- **Next.js**: Full-stack React framework
- **Supabase**: Authentication and database

---

**Last Updated**: 2025-11-02
**Integration Version**: 1.0.0
**Vercel AI SDK Version**: ^3.0.0

For questions or issues, refer to `CLAUDE.md` or open a GitHub issue.
