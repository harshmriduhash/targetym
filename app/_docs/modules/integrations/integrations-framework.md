# Integrations Framework Module

Extensible OAuth-based integration system for connecting external services like Google Workspace, Slack, Microsoft Teams, and more with built-in resilience patterns.

## Installation

```bash
pnpm registry:install integrations-framework
```

## Dependencies

This module requires:

```json
{
  "dependencies": {
    "ioredis": "^5.3.2"
  },
  "optionalDependencies": {
    "@upstash/redis": "^1.25.0"
  }
}
```

## Architecture

The Integrations Framework provides:

- **OAuth 2.0 / PKCE Flow**: Secure authorization code flow with PKCE
- **Base Client**: Abstract class with retry logic and circuit breaker
- **Provider Clients**: Google, Slack, Microsoft, etc.
- **Token Management**: Automatic refresh and secure storage
- **Webhook Queue**: Async event processing
- **HTTP Client**: Resilient HTTP with retry and timeout
- **Crypto Utilities**: Secure PKCE code generation

## Components

### IntegrationsList

Display all available integrations with connection status.

```tsx
import { IntegrationsList } from '@/components/integrations/IntegrationsList'

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      <IntegrationsList />
    </div>
  )
}
```

**Features:**
- Grid layout of available providers
- Connection status badges
- Connect/disconnect actions
- Last sync timestamp
- Auto-refresh on connect/disconnect
- Loading skeletons
- Error handling with alerts

### IntegrationCard

Display individual integration with status and actions.

```tsx
import { IntegrationCard } from '@/components/integrations/IntegrationCard'

export function MyIntegrations({ integrations }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onDisconnect={handleDisconnect}
        />
      ))}
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `integration` | `Integration` | - | Required. Integration data |
| `onDisconnect` | `() => void` | - | Required. Disconnect callback |

**Integration Type:**
```typescript
interface Integration {
  id: string
  providerId: string
  providerName: string
  status: 'connected' | 'disconnected' | 'error'
  connectedAt: string | null
  lastSyncAt: string | null
  metadata?: Record<string, any>
}
```

**Features:**
- Provider logo/icon
- Status indicator
- Connected date
- Last sync time
- Disconnect button with confirmation
- Error state display
- Loading states

### ConnectIntegrationDialog

Modal dialog for initiating OAuth connection flow.

```tsx
import { ConnectIntegrationDialog } from '@/components/integrations/ConnectIntegrationDialog'

export function ConnectButton() {
  return (
    <ConnectIntegrationDialog
      providerId="google"
      providerName="Google Workspace"
      onConnect={handleConnect}
    />
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `providerId` | `string` | - | Required. Provider identifier |
| `providerName` | `string` | - | Required. Display name |
| `onConnect` | `() => void` | - | Required. Success callback |

**Features:**
- OAuth authorization URL generation
- PKCE code challenge/verifier
- State parameter for CSRF protection
- Redirect URI handling
- Scope selection
- Loading states
- Error handling

## Base Integration Client

### BaseIntegrationClient

Abstract class providing common functionality for all integrations.

```typescript
import { BaseIntegrationClient } from '@/lib/integrations/base-client'

class MyServiceClient extends BaseIntegrationClient {
  constructor() {
    super('my-service')
  }

  async getUserProfile(accessToken: string) {
    return this.request({
      url: 'https://api.myservice.com/user/profile',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  async createResource(accessToken: string, data: any) {
    return this.request({
      url: 'https://api.myservice.com/resources',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: data,
    })
  }
}

export const myServiceClient = new MyServiceClient()
```

**Features:**
- Automatic retry with exponential backoff
- Circuit breaker for fault tolerance
- Request/response logging
- Timeout handling (30s default)
- Error wrapping with IntegrationError
- Health check support

**Request Configuration:**
```typescript
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number // milliseconds
}
```

**Error Handling:**
```typescript
import { IntegrationError } from '@/lib/integrations/base-client'

try {
  const result = await client.getUserProfile(token)
} catch (error) {
  if (error instanceof IntegrationError) {
    console.error('Status:', error.statusCode)
    console.error('Response:', error.response)
  }
}
```

## Provider Clients

### Google Workspace Client

```typescript
import { googleClient } from '@/lib/integrations/providers/google'

// Get OAuth authorization URL
const authUrl = googleClient.getAuthorizationUrl(
  'state-token',
  'https://app.com/integrations/callback',
  ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/drive'],
  codeChallenge
)

// Exchange authorization code for tokens
const tokens = await googleClient.exchangeCodeForToken(
  code,
  redirectUri,
  codeVerifier
)

// Calendar API
const calendars = await googleClient.listCalendars(accessToken)
const event = await googleClient.createEvent(accessToken, calendarId, {
  summary: 'Team Meeting',
  start: { dateTime: '2025-12-01T10:00:00Z' },
  end: { dateTime: '2025-12-01T11:00:00Z' },
  attendees: [{ email: 'colleague@example.com' }],
})

// Drive API
const folder = await googleClient.createFolder(accessToken, 'HR Documents', parentId)

// Gmail API
await googleClient.sendEmail(
  accessToken,
  'recipient@example.com',
  'Subject Line',
  '<p>Email body</p>'
)

// Get user profile
const profile = await googleClient.getUserProfile(accessToken)

// Test connection
const isConnected = await googleClient.testConnection(accessToken)
```

**Available Scopes:**
- `https://www.googleapis.com/auth/calendar` - Calendar access
- `https://www.googleapis.com/auth/drive` - Drive access
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/userinfo.email` - User email
- `https://www.googleapis.com/auth/userinfo.profile` - User profile

### Slack Client

```typescript
import { slackClient } from '@/lib/integrations/providers/slack'

// Get OAuth authorization URL
const authUrl = slackClient.getAuthorizationUrl(
  'state-token',
  'https://app.com/integrations/callback',
  ['chat:write', 'channels:read', 'users:read']
)

// Exchange code for token
const tokens = await slackClient.exchangeCodeForToken(code, redirectUri)

// Send message
await slackClient.sendMessage(accessToken, channelId, 'Hello from Targetym!')

// List channels
const channels = await slackClient.listChannels(accessToken)

// Get user info
const user = await slackClient.getUserInfo(accessToken, userId)

// Create channel
const channel = await slackClient.createChannel(accessToken, 'team-updates')

// Upload file
await slackClient.uploadFile(accessToken, channelId, fileContent, 'report.pdf')

// Test connection
const isConnected = await slackClient.testConnection(accessToken)
```

**Available Scopes:**
- `chat:write` - Send messages
- `channels:read` - List channels
- `channels:write` - Create channels
- `users:read` - Read user info
- `files:write` - Upload files

### Creating Custom Providers

```typescript
import { BaseIntegrationClient } from '@/lib/integrations/base-client'

export class AsanaClient extends BaseIntegrationClient {
  protected serviceName = 'asana'
  protected baseUrl = 'https://app.asana.com/api/1.0'

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: process.env.ASANA_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    })
    return `https://app.asana.com/-/oauth_authorize?${params}`
  }

  async exchangeCodeForToken(code: string, redirectUri: string) {
    return this.request({
      url: 'https://app.asana.com/-/oauth_token',
      method: 'POST',
      body: {
        client_id: process.env.ASANA_CLIENT_ID,
        client_secret: process.env.ASANA_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
    })
  }

  async getWorkspaces(accessToken: string) {
    return this.request({
      url: `${this.baseUrl}/workspaces`,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  async createTask(accessToken: string, workspaceId: string, task: any) {
    return this.request({
      url: `${this.baseUrl}/tasks`,
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { data: { ...task, workspace: workspaceId } },
    })
  }

  async testConnection(accessToken: string): Promise<boolean> {
    try {
      await this.getWorkspaces(accessToken)
      return true
    } catch {
      return false
    }
  }
}

export const asanaClient = new AsanaClient()
```

## PKCE Utilities

### Generate Code Verifier and Challenge

```typescript
import { generatePKCE } from '@/lib/integrations/oauth/pkce'

// Generate PKCE pair
const { codeVerifier, codeChallenge } = await generatePKCE()

// Store codeVerifier in session (needed for token exchange)
sessionStorage.setItem('pkce_verifier', codeVerifier)

// Use codeChallenge in authorization URL
const authUrl = client.getAuthorizationUrl(state, redirectUri, scopes, codeChallenge)
```

### Crypto Helpers

```typescript
import { generateRandomString, base64URLEncode } from '@/lib/integrations/crypto'

// Generate state parameter
const state = generateRandomString(32)

// Encode data for URL
const encoded = base64URLEncode(Buffer.from('data'))
```

## Server Actions

### connect-integration

Initiate OAuth flow and store integration.

```typescript
import { connectIntegration } from '@/actions/integrations/connect-integration'

const result = await connectIntegration({
  providerId: 'google',
  code: 'auth-code-from-callback',
  codeVerifier: 'pkce-verifier',
  redirectUri: 'https://app.com/integrations/callback',
})

if (result.success) {
  console.log('Integration connected:', result.data.id)
}
```

**Authorization:** Requires authenticated user.
**Security:** Validates PKCE, stores encrypted tokens.

### disconnect-integration

Remove integration and revoke tokens.

```typescript
import { disconnectIntegration } from '@/actions/integrations/disconnect-integration'

const result = await disconnectIntegration({
  integrationId: 'integration-uuid',
})

if (result.success) {
  console.log('Integration disconnected')
}
```

**Authorization:** Requires integration ownership.

### list-integrations

Get all integrations for current user's organization.

```typescript
import { listIntegrations } from '@/actions/integrations/list-integrations'

const result = await listIntegrations()

if (result.success) {
  result.data.forEach((integration) => {
    console.log(`${integration.providerName}: ${integration.status}`)
  })
}
```

### handle-oauth-callback

Process OAuth callback and complete connection.

```typescript
// app/integrations/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { handleOAuthCallback } from '@/actions/integrations/handle-oauth-callback'

export default function CallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      router.push(`/integrations?error=${error}`)
      return
    }

    if (code && state) {
      handleOAuthCallback({ code, state }).then((result) => {
        if (result.success) {
          router.push('/integrations?connected=true')
        } else {
          router.push(`/integrations?error=${result.error.message}`)
        }
      })
    }
  }, [searchParams, router])

  return <div>Connecting...</div>
}
```

## Resilience Patterns

### Retry Logic

Built into BaseIntegrationClient with exponential backoff.

```typescript
// Automatic retry for network errors
const result = await client.request({
  url: 'https://api.example.com/data',
  method: 'GET',
})

// Custom retry configuration
import { withRetry, RetryPresets } from '@/lib/resilience/retry'

const data = await withRetry(
  () => fetchDataFromAPI(),
  {
    ...RetryPresets.network,
    maxAttempts: 5,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`)
    },
  }
)
```

**Retry Presets:**
- `RetryPresets.network`: 3 attempts, exponential backoff
- `RetryPresets.aggressive`: 5 attempts, shorter delays
- `RetryPresets.conservative`: 2 attempts, longer delays

### Circuit Breaker

Prevents cascading failures when external service is down.

```typescript
import { CircuitBreaker, CircuitBreakerPresets } from '@/lib/resilience/circuit-breaker'

const breaker = new CircuitBreaker({
  ...CircuitBreakerPresets.standard,
  name: 'my-api',
  onStateChange: (state) => {
    console.log(`Circuit breaker state: ${state}`)
  },
})

// Execute with circuit breaker
const result = await breaker.execute(async () => {
  return await apiCall()
})

// Check breaker state
const state = breaker.getState() // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
```

**States:**
- `CLOSED`: Normal operation
- `OPEN`: Service unavailable (failing fast)
- `HALF_OPEN`: Testing if service recovered

**Presets:**
- `CircuitBreakerPresets.standard`: Threshold 5, timeout 60s
- `CircuitBreakerPresets.aggressive`: Threshold 3, timeout 30s
- `CircuitBreakerPresets.tolerant`: Threshold 10, timeout 120s

### HTTP Client with Resilience

```typescript
import { createHttpClient } from '@/lib/integrations/http-client'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  retryConfig: RetryPresets.network,
  circuitBreakerConfig: CircuitBreakerPresets.standard,
})

// GET request
const data = await http.get('/users')

// POST request
const created = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
})

// With custom headers
const result = await http.get('/protected', {
  headers: {
    Authorization: 'Bearer token',
  },
})
```

## Webhook Queue

Process webhooks asynchronously with retry logic.

```typescript
import { WebhookQueue } from '@/lib/integrations/webhook-queue'

// Initialize queue
const queue = new WebhookQueue()

// Add webhook to queue
await queue.add({
  provider: 'slack',
  event: 'message.created',
  payload: {
    channel: 'general',
    text: 'Hello',
    user: 'U123',
  },
})

// Process webhooks
await queue.process(async (webhook) => {
  console.log(`Processing ${webhook.provider} - ${webhook.event}`)

  // Handle webhook
  await handleSlackMessage(webhook.payload)
})

// Get queue stats
const stats = await queue.getStats()
console.log(`Pending: ${stats.pending}, Failed: ${stats.failed}`)
```

## Token Management

### Secure Token Storage

```typescript
// Store encrypted tokens in database
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/integrations/crypto'

async function storeTokens(integrationId: string, tokens: any) {
  const supabase = await createClient()

  const encryptedAccessToken = await encrypt(tokens.access_token)
  const encryptedRefreshToken = tokens.refresh_token
    ? await encrypt(tokens.refresh_token)
    : null

  await supabase
    .from('integrations')
    .update({
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    })
    .eq('id', integrationId)
}
```

### Token Refresh

```typescript
async function refreshAccessToken(integration: Integration) {
  const client = getProviderClient(integration.provider_id)

  const newTokens = await client.refreshToken(integration.refresh_token)

  await storeTokens(integration.id, newTokens)

  return newTokens.access_token
}

// Use with automatic refresh
async function getValidAccessToken(integrationId: string): Promise<string> {
  const integration = await getIntegration(integrationId)

  // Check if token expired
  if (new Date() > new Date(integration.token_expires_at)) {
    return await refreshAccessToken(integration)
  }

  return integration.access_token
}
```

## Database Schema

### integrations

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, provider_id)
);

CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_status ON integrations(status);
```

### webhook_events

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_integration ON webhook_events(integration_id);
```

## RLS Policies

```sql
-- Users can view integrations in their organization
CREATE POLICY "Users can view own org integrations"
  ON integrations FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Admin can manage integrations
CREATE POLICY "Admin can manage integrations"
  ON integrations FOR ALL
  USING (
    organization_id = get_user_organization_id() AND
    has_role(ARRAY['admin'])
  );

-- Users can connect integrations
CREATE POLICY "Users can connect integrations"
  ON integrations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Users can disconnect own integrations
CREATE POLICY "Users can disconnect integrations"
  ON integrations FOR DELETE
  USING (organization_id = get_user_organization_id());
```

## Environment Variables

```bash
# Google Workspace
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Slack
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret

# Microsoft Teams
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret

# Encryption
INTEGRATION_ENCRYPTION_KEY=your-32-char-secret-key

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## Testing

```typescript
import { googleClient } from '@/lib/integrations/providers/google'

describe('GoogleClient', () => {
  it('generates valid authorization URL', () => {
    const url = googleClient.getAuthorizationUrl(
      'state',
      'http://localhost:3000/callback',
      ['calendar'],
      'challenge'
    )

    expect(url).toContain('accounts.google.com')
    expect(url).toContain('code_challenge=challenge')
  })

  it('handles API errors gracefully', async () => {
    await expect(
      googleClient.listCalendars('invalid-token')
    ).rejects.toThrow(IntegrationError)
  })

  it('retries on network errors', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch')
    fetchSpy
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response('{"data": "success"}'))

    const result = await googleClient.getUserProfile('token')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
```

## Troubleshooting

### OAuth flow fails

1. Verify redirect URI matches exactly in provider console
2. Check client ID and secret are correct
3. Ensure PKCE verifier is stored and retrieved correctly
4. Verify state parameter matches
5. Check scopes are valid for provider

### Token refresh fails

1. Verify refresh token is stored
2. Check token hasn't been revoked
3. Ensure client secret is correct
4. Verify refresh endpoint URL
5. Check token expiration calculation

### Circuit breaker opens frequently

1. Review failure threshold settings
2. Check external service status
3. Increase timeout duration
4. Review retry configuration
5. Monitor error rates

### Webhook processing slow

1. Increase queue workers
2. Add database indexes
3. Implement batch processing
4. Use Redis for queue (faster than DB)
5. Monitor queue depth

## Related Documentation

- [OAuth 2.0 Specification](https://oauth.net/2/)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [Circuit Breaker Pattern](../patterns/circuit-breaker.md)
- [Retry Pattern](../patterns/retry.md)
- [Webhook Security](../security/webhooks.md)
