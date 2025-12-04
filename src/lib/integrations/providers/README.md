# Integration Providers

Production-ready OAuth integration clients for external services.

## Available Providers

### Slack (`slack.ts`)

Complete Slack Web API client with OAuth 2.0 authentication.

**Features:**
- OAuth 2.0 authorization flow with PKCE
- Message sending (channels, DMs, scheduled)
- Channel management (create, archive, invite)
- User lookup and management
- Workspace information
- Circuit breaker and retry logic
- Rate limit handling
- Comprehensive error handling

**Environment Variables:**
```bash
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
INTEGRATION_ENCRYPTION_KEY=$(openssl rand -hex 32)
```

**Quick Start:**

```typescript
import { SlackClient } from '@/src/lib/integrations/providers/slack'

// 1. Initialize OAuth flow
const client = new SlackClient({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
})

const authUrl = client.getAuthorizationUrl('state_123', 'https://app.com/callback')
// Redirect user to authUrl

// 2. Handle OAuth callback
const tokens = await client.exchangeCodeForToken(code, redirectUri)
// Store tokens.accessToken encrypted in database

// 3. Use client with stored token
const slackClient = await SlackClient.fromIntegration('integration_id')

// Send message
await slackClient.sendMessage('C1234567890', 'Hello, team!')

// List channels
const channels = await slackClient.listChannels()

// Find user and send DM
const user = await slackClient.getUserByEmail('john@company.com')
if (user) {
  await slackClient.sendDirectMessage(user.id, 'Welcome!')
}
```

**OAuth Scopes:**

The client uses these default scopes:
- `channels:read` - View channels
- `channels:write` - Create/manage channels
- `chat:write` - Send messages
- `users:read` - View user info
- `users:read.email` - View email addresses
- `team:read` - View workspace info
- `im:write` - Send direct messages

**API Methods:**

| Method | Description | Example |
|--------|-------------|---------|
| `getAuthorizationUrl()` | Generate OAuth URL | `client.getAuthorizationUrl('state', 'https://...')` |
| `exchangeCodeForToken()` | Exchange auth code | `client.exchangeCodeForToken(code, redirectUri)` |
| `sendMessage()` | Send channel message | `client.sendMessage('C123', 'Hello!')` |
| `sendDirectMessage()` | Send DM to user | `client.sendDirectMessage('U123', 'Hi')` |
| `scheduleMessage()` | Schedule message | `client.scheduleMessage('C123', 'Reminder', timestamp)` |
| `listChannels()` | Get all channels | `client.listChannels()` |
| `createChannel()` | Create new channel | `client.createChannel('new-project')` |
| `inviteToChannel()` | Add users to channel | `client.inviteToChannel('C123', ['U1', 'U2'])` |
| `archiveChannel()` | Archive channel | `client.archiveChannel('C123')` |
| `getUserInfo()` | Get user details | `client.getUserInfo('U123')` |
| `listUsers()` | Get all users | `client.listUsers()` |
| `getUserByEmail()` | Find user by email | `client.getUserByEmail('john@example.com')` |
| `getWorkspaceInfo()` | Get workspace details | `client.getWorkspaceInfo()` |
| `testConnection()` | Test API connection | `client.testConnection()` |

**Error Handling:**

```typescript
import { SlackError } from '@/src/lib/integrations/providers/slack'

try {
  await client.sendMessage('C123', 'Hello!')
} catch (error) {
  if (error instanceof SlackError) {
    console.error(`Slack error: ${error.slackError}`)
    console.error(`Status: ${error.statusCode}`)
  }
}
```

**Rate Limiting:**

The client automatically handles Slack's rate limits:
- Built-in retry with exponential backoff
- Circuit breaker prevents cascading failures
- Rate limit info available via `getRateLimitInfo()`

**Advanced Usage:**

```typescript
// Message with blocks (rich formatting)
await client.sendMessage('C123', 'Fallback text', {
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Hello* from the _bot_!'
      }
    }
  ]
})

// Thread reply
const ts = await client.sendMessage('C123', 'Main message')
await client.sendMessage('C123', 'Thread reply', { threadTs: ts })

// Create private channel and invite users
const channel = await client.createChannel('secret-project', true)
await client.inviteToChannel(channel.id, ['U111', 'U222'])
await client.sendMessage(channel.id, 'Welcome to the secret project!')
```

## Architecture

All provider clients extend `BaseIntegrationClient` which provides:

- **Retry Logic**: Exponential backoff with jitter (via `@/src/lib/resilience/retry`)
- **Circuit Breaker**: Prevents cascading failures (via `@/src/lib/resilience/circuit-breaker`)
- **Logging**: Structured logging with context (via `@/src/lib/monitoring/logger`)
- **Error Handling**: Consistent error types and messages

**Credential Storage:**

OAuth tokens are encrypted using AES-256-GCM and stored in `integration_credentials` table:

```typescript
import { encryptToken, decryptToken } from '@/src/lib/integrations/crypto'

// Encrypt before storing
const encrypted = encryptToken(accessToken)
await supabase.from('integration_credentials').insert({
  integration_id: 'int_123',
  access_token_encrypted: encrypted,
  // ...
})

// Decrypt when loading
const { data } = await supabase.from('integration_credentials').select('*').single()
const accessToken = decryptToken(data.access_token_encrypted)
```

## Testing

```typescript
import { SlackClient } from '@/src/lib/integrations/providers/slack'

describe('SlackClient', () => {
  it('should send message', async () => {
    const client = new SlackClient(config, 'test_token')
    const ts = await client.sendMessage('C123', 'Test message')
    expect(ts).toBeDefined()
  })

  it('should handle rate limiting', async () => {
    // Circuit breaker will open after failures
    const client = new SlackClient(config, 'invalid_token')
    await expect(client.sendMessage('C123', 'Test')).rejects.toThrow()
  })
})
```

## Adding New Providers

To add a new integration provider:

1. Create `src/lib/integrations/providers/<provider>.ts`
2. Extend `BaseIntegrationClient`
3. Implement OAuth methods: `getAuthorizationUrl()`, `exchangeCodeForToken()`
4. Implement provider-specific methods
5. Add environment variables
6. Update this README

**Template:**

```typescript
import { BaseIntegrationClient, IntegrationError } from '@/src/lib/integrations/base-client'

export class NewProviderClient extends BaseIntegrationClient {
  protected readonly serviceName = 'new-provider'
  private baseUrl = 'https://api.provider.com'

  constructor(private config: ProviderConfig, private accessToken?: string) {
    super()
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    // Implementation
  }

  async exchangeCodeForToken(code: string, redirectUri: string) {
    // Implementation
  }

  // Provider-specific methods
  async someMethod() {
    return this.request({
      url: `${this.baseUrl}/endpoint`,
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}` },
    })
  }
}
```

## References

- [Slack Web API](https://api.slack.com/web)
- [OAuth 2.0 Spec](https://oauth.net/2/)
- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
