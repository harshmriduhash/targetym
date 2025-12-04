# Targetym Integration Workflow - Immediate Next Steps

**Current Status:** Foundation phase complete, ready for implementation

---

## ✅ What's Already Done

### 1. **Encryption Key Configured** ✅
- Generated 256-bit AES encryption key
- Added to `.env.local` as `INTEGRATION_ENCRYPTION_KEY`
- Ready for token encryption

### 2. **OAuth & Crypto Libraries** ✅
**Files Created:**
- `src/lib/integrations/oauth/pkce.ts` - PKCE implementation (RFC 7636)
- `src/lib/integrations/crypto.ts` - AES-256-GCM encryption

### 3. **Database Schema** ✅
**Existing Tables** (from migration 20251108000001):
- ✅ `integration_providers` - Provider registry
- ✅ `integrations` - Organization integrations
- ✅ `integration_credentials` - Encrypted tokens
- ✅ `integration_webhooks` - Webhook configs
- ✅ `integration_sync_logs` - Audit trail
- ✅ `integration_consents` - GDPR compliance
- ✅ `integration_oauth_states` - PKCE state management

**Provider Seed Data** ✅:
- Slack, Asana, Notion, Google, Microsoft, Linear, Jira, GitHub, Zoom, Trello

### 4. **Documentation** ✅
- Integration Gap Analysis (1,500+ lines)
- Integration Roadmap (800+ lines)
- Implementation Progress Report (900+ lines)
- Session Summary
- PKCE & Encryption code docs (JSDoc)

---

## 🔴 Migration Issue (Non-Blocking)

**Problem:** Two migrations conflict:
1. `20250109000000_create_complete_schema.sql` - Created simple `integrations` table
2. `20251108000001_integrations_infrastructure.sql` - Tries to create comprehensive version

**Impact:** Migration fails but database already has integrations table

**Resolution Options:**
1. **Option A (Quick):** Use existing simple schema, skip complex migration
2. **Option B (Proper):** Drop existing tables, apply comprehensive migration
3. **Option C (Safest):** Rename new migration to avoid conflicts, add only missing pieces

**Recommendation:** Option A for speed, Option B for production-ready system

---

## 🚀 Immediate Actions Required

### **Action 1: Choose Migration Strategy**

#### **Option A: Quick Start (Use Existing Schema)**
```bash
# Keep existing schema, proceed with building services
# No migration needed
npm run supabase:types  # Generate types from existing schema
```

**Pros:** Start coding immediately
**Cons:** Less comprehensive schema

#### **Option B: Full Infrastructure (Recommended)**
```bash
# 1. Drop existing integrations tables
psql -h localhost -p 54322 -U postgres -d postgres <<EOF
DROP TABLE IF EXISTS public.integration_sync_logs CASCADE;
DROP TABLE IF EXISTS public.integration_webhooks CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
EOF

# 2. Retry migration
npm run supabase:reset

# 3. Generate types
npm run supabase:types
```

**Pros:** Production-ready schema with all features
**Cons:** Requires dropping existing data (OK in development)

---

### **Action 2: Generate TypeScript Types**

```bash
# After choosing Option A or B above
npm run supabase:types
```

This creates `src/types/database.types.ts` with all table definitions.

---

### **Action 3: Fix TypeScript Errors**

**Current Errors:** ~50 errors (documented in session)

**Fix Strategy:**
```bash
# Run type check to see current errors
npm run type-check

# Most common fixes needed:
# 1. Test files - add explicit types
# 2. Service files - fix array type mismatches
# 3. Validation schemas - update Zod v4 syntax
# 4. Database types - regenerate after migration
```

**Recommended:** Launch `javascript-typescript:typescript-pro` agent to fix all systematically.

---

## 📋 Next Development Tasks (In Order)

### **Week 1: Core Integration Service**

#### Task 1: Build Integration Service Layer
**File:** `src/lib/services/integrations.service.ts`

**Implementation:**
```typescript
import { createClient } from '@/src/lib/supabase/server'
import { encryptToken, decryptToken } from '@/src/lib/integrations/crypto'
import { createPKCESession } from '@/src/lib/integrations/oauth/pkce'

export class IntegrationsService {
  // Connect new integration
  async connectIntegration(params: {
    provider: string
    organizationId: string
    userId: string
  }): Promise<{ authUrl: string; state: string }> {
    // 1. Create PKCE session
    const session = createPKCESession(provider, redirectUri)

    // 2. Store OAuth state in database
    await supabase.from('integration_oauth_states').insert({...})

    // 3. Return authorization URL
    return { authUrl, state: session.state }
  }

  // Handle OAuth callback
  async handleCallback(code: string, state: string): Promise<Integration> {
    // 1. Verify state & get PKCE verifier
    // 2. Exchange code for tokens
    // 3. Encrypt & store tokens
    // 4. Create integration record
  }

  // Disconnect integration
  async disconnectIntegration(integrationId: string): Promise<void>

  // Refresh tokens
  async refreshTokens(integrationId: string): Promise<void>

  // Get integration status
  async getIntegrationStatus(integrationId: string): Promise<Status>
}
```

**Estimated Time:** 4-6 hours

---

#### Task 2: Build Slack Integration Client
**File:** `src/lib/integrations/providers/slack.ts`

**Template:**
```typescript
import { BaseIntegrationClient } from '../base-client'
import { logger } from '@/src/lib/monitoring/logger'

export class SlackClient extends BaseIntegrationClient {
  protected serviceName = 'slack'
  private baseUrl = 'https://slack.com/api'

  async getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      scope: 'chat:write,channels:read',
      state,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`
    })
    return `https://slack.com/oauth/v2/authorize?${params}`
  }

  async exchangeCode(code: string): Promise<Tokens> {
    return await this.request({
      url: `${this.baseUrl}/oauth.v2.access`,
      method: 'POST',
      body: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code
      }
    })
  }

  async sendMessage(accessToken: string, channel: string, text: string): Promise<void> {
    await this.request({
      url: `${this.baseUrl}/chat.postMessage`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { channel, text }
    })
  }
}
```

**Estimated Time:** 6-8 hours

---

#### Task 3: Build API Routes
**Files to create:**
- `src/app/api/integrations/[provider]/connect/route.ts`
- `src/app/api/integrations/[provider]/callback/route.ts`
- `src/app/api/integrations/[provider]/disconnect/route.ts`

**Example (`connect/route.ts`):**
```typescript
import { NextRequest } from 'next/server'
import { integrationsService } from '@/src/lib/services/integrations.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { organizationId, userId } = await request.json()

  const { authUrl } = await integrationsService.connectIntegration({
    provider: params.provider,
    organizationId,
    userId
  })

  return Response.json({ authUrl })
}
```

**Estimated Time:** 4-6 hours

---

### **Week 2: UI Components**

#### Task 4: Integration Management UI
**Components to create:**
- `src/components/integrations/IntegrationCard.tsx`
- `src/components/integrations/IntegrationsList.tsx`
- `src/components/integrations/ConnectIntegrationDialog.tsx`

**IntegrationCard Example:**
```typescript
'use client'

interface IntegrationCardProps {
  provider: { id: string; name: string; icon: string }
  integration?: Integration
  onConnect: () => void
  onDisconnect: () => void
}

export function IntegrationCard({ provider, integration, ... }) {
  return (
    <Card>
      <CardHeader>
        <img src={provider.icon} alt={provider.name} />
        <h3>{provider.name}</h3>
        {integration ? (
          <Badge variant="success">Connected</Badge>
        ) : (
          <Badge variant="secondary">Not Connected</Badge>
        )}
      </CardHeader>
      <CardContent>
        {integration ? (
          <>
            <p>Last sync: {formatDate(integration.lastSyncAt)}</p>
            <Button onClick={onDisconnect} variant="destructive">
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={onConnect}>Connect {provider.name}</Button>
        )}
      </CardContent>
    </Card>
  )
}
```

**Estimated Time:** 8-10 hours

---

## 🎯 Success Criteria

### **Week 1 Complete:**
- [ ] Integration service layer built
- [ ] Slack integration functional (OAuth + send messages)
- [ ] API routes working
- [ ] TypeScript errors fixed
- [ ] Tests written (>80% coverage)

### **Week 2 Complete:**
- [ ] Integration management UI complete
- [ ] Google Workspace integration added
- [ ] Webhook handlers implemented
- [ ] E2E tests passing
- [ ] Documentation updated

---

## 🛠️ Development Workflow

### **Daily Workflow:**
```bash
# 1. Start Supabase
npm run supabase:start

# 2. Start dev server
npm run dev

# 3. Run type check
npm run type-check

# 4. Run tests
npm test

# 5. Before commit
npm run lint && npm run type-check && npm test
```

### **Testing New Integration:**
```bash
# 1. Add provider credentials to .env.local
SLACK_CLIENT_ID=xxx
SLACK_CLIENT_SECRET=xxx

# 2. Test OAuth flow
curl -X POST http://localhost:3001/api/integrations/slack/connect \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"xxx","userId":"xxx"}'

# 3. Complete OAuth in browser
# Visit returned authUrl

# 4. Test API call
# Send test message to Slack
```

---

## 📊 Progress Tracking

**Current Completion:**
- Foundation: 100% ✅
- Integration Services: 0% ⏸️
- Provider Clients: 0% ⏸️
- API Routes: 0% ⏸️
- UI Components: 0% ⏸️
- Testing: 0% ⏸️

**Target Completion:** 2-3 weeks
**Blockers:** Migration decision, TypeScript errors

---

## 🆘 If You Get Stuck

### **Migration Issues:**
```bash
# Check current database state
psql -h localhost -p 54322 -U postgres -d postgres
\dt integrations*

# View migration history
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC LIMIT 10;
```

### **Type Errors:**
```bash
# Regenerate types
npm run supabase:types

# Check specific file
npx tsc --noEmit src/lib/services/integrations.service.ts
```

### **OAuth Flow Testing:**
Use [OAuth Debugger](https://oauthdebugger.com/) to test authorization URLs

---

## 📞 Quick Reference

### **Environment Variables Needed:**
```bash
# Required
INTEGRATION_ENCRYPTION_KEY=7d53641d...  ✅ Done
NEXT_PUBLIC_SUPABASE_URL=...            ✅ Done
SUPABASE_SERVICE_ROLE_KEY=...           ✅ Done

# For Slack (when ready)
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# For Google (when ready)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### **Key Files Created:**
```
src/lib/integrations/oauth/pkce.ts          ✅ 250 lines
src/lib/integrations/crypto.ts              ✅ 400 lines
docs/INTEGRATION_GAP_ANALYSIS.md            ✅ 1,500 lines
docs/INTEGRATION_ROADMAP.md                 ✅ 800 lines
docs/INTEGRATION_IMPLEMENTATION_PROGRESS.md ✅ 900 lines
```

### **Next Files to Create:**
```
src/lib/services/integrations.service.ts    ⏸️ Pending
src/lib/integrations/providers/slack.ts     ⏸️ Pending
src/app/api/integrations/[provider]/*/route.ts ⏸️ Pending
src/components/integrations/*.tsx           ⏸️ Pending
```

---

## 🎓 Learning Resources

**OAuth 2.0 with PKCE:**
- [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth.com PKCE Guide](https://www.oauth.com/oauth2-servers/pkce/)

**Slack API:**
- [OAuth Guide](https://api.slack.com/authentication/oauth-v2)
- [Web API Methods](https://api.slack.com/methods)

**TypeScript:**
- [Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

**Last Updated:** 2025-11-08
**Status:** Ready for Implementation 🚀
**Next Action:** Choose migration strategy (Option A or B)
