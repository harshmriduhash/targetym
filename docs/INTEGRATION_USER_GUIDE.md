# Integration User Guide

**Targetym Integration System - Complete User Documentation**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Connecting Integrations](#connecting-integrations)
4. [Managing Integrations](#managing-integrations)
5. [Webhook Configuration](#webhook-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Security & Privacy](#security--privacy)
8. [Developer Guide](#developer-guide)

---

## Introduction

The Targetym Integration System allows you to connect external services like Slack, Google Workspace, Asana, and Notion to your HR platform, enabling seamless data synchronization and automation.

### Supported Integrations

| Provider | Features | Status |
|----------|----------|--------|
| **Slack** | Messaging, channels, notifications | ✅ Active |
| **Google Workspace** | Calendar, Gmail, Drive | ✅ Active |
| **Asana** | Task management, projects | 🚧 Coming Soon |
| **Notion** | Documentation, databases | 🚧 Coming Soon |
| **Microsoft 365** | Calendar, Teams, OneDrive | ✅ Active |

---

## Getting Started

### Prerequisites

- Active Targetym account
- Admin or HR role
- Access to the integration provider's admin panel

### Quick Start

1. Navigate to **Settings → Integrations**
2. Click **Connect** on your desired integration
3. Authorize access in the OAuth flow
4. Configure integration settings
5. Start using the integration

---

## Connecting Integrations

### Slack Integration

**Step 1: Initiate Connection**
1. Go to **Settings → Integrations**
2. Find **Slack** in the list
3. Click **Connect to Slack**

**Step 2: Authorize Access**
1. You'll be redirected to Slack's authorization page
2. Review the requested permissions:
   - Read channel information
   - Send messages
   - Create channels
   - Read user profiles
3. Click **Allow**

**Step 3: Complete Setup**
1. You'll be redirected back to Targetym
2. Configuration complete!
3. Slack integration is now active

**Permissions Explained:**
- **channels:read** - View your workspace channels
- **chat:write** - Send messages on your behalf
- **channels:manage** - Create channels for teams/projects
- **users:read** - Access user profiles for mentions

---

### Google Workspace Integration

**Step 1: Initiate Connection**
1. Go to **Settings → Integrations**
2. Find **Google Workspace**
3. Click **Connect to Google**

**Step 2: Select Google Account**
1. Choose your Google Workspace account
2. Click **Continue**

**Step 3: Grant Permissions**
Review and approve:
- **Google Calendar** - Manage events and meetings
- **Google Drive** - Access and share files
- **Gmail** - Send emails on your behalf
- **Contacts** - Read contact information

**Step 4: Complete Setup**
1. Click **Allow**
2. Redirected back to Targetym
3. Google Workspace integration active

---

### Connection Troubleshooting

**"Authorization Failed" Error:**
- Verify you have admin access to the workspace
- Check that popup blockers are disabled
- Try incognito/private browsing mode
- Clear browser cache and cookies

**"Invalid Redirect URI" Error:**
- Contact your Targetym administrator
- Ensure OAuth app is configured correctly

**"Access Denied" Error:**
- Verify you granted all required permissions
- Check workspace admin has enabled the integration

---

## Managing Integrations

### View Connected Integrations

Navigate to **Settings → Integrations** to see:

| Integration | Status | Connected | Last Sync |
|-------------|--------|-----------|-----------|
| Slack | ✅ Healthy | 2 days ago | 5 min ago |
| Google | ✅ Healthy | 1 week ago | 10 min ago |

### Integration Status

- **✅ Healthy** - Operating normally
- **⚠️ Degraded** - Some features may not work
- **❌ Disconnected** - Connection lost
- **🔄 Syncing** - Currently syncing data

### Disconnect Integration

1. Go to **Settings → Integrations**
2. Find the integration to disconnect
3. Click **⋮** (more options)
4. Select **Disconnect**
5. Confirm disconnection

**What happens when you disconnect:**
- OAuth tokens are revoked
- Webhooks are disabled
- Sync jobs are stopped
- Historical data is retained (unless you request deletion)

### Reconnect Integration

If an integration shows as **Disconnected:**
1. Click **Reconnect**
2. Re-authorize access
3. Connection restored

---

## Webhook Configuration

Webhooks allow real-time updates from external services to Targetym.

### Slack Webhooks

**Automatic Setup:**
Webhooks are configured automatically when you connect Slack.

**Webhook URL:**
```
https://your-domain.com/api/webhooks/slack?webhook_id={uuid}
```

**Supported Events:**
- `message.channels` - New channel messages
- `channel_created` - New channel created
- `member_joined_channel` - User joined channel

### Google Webhooks

**Channel Notifications:**
Google uses "channels" for webhook notifications.

**Webhook URL:**
```
https://your-domain.com/api/webhooks/google
```

**Supported Resources:**
- Calendar events
- Drive file changes
- Gmail new messages

**Channel Expiration:**
Google channels expire after 7 days and are automatically renewed.

---

## Troubleshooting

### Common Issues

#### Integration Shows "Degraded" Status

**Possible Causes:**
- OAuth token expired
- Permissions revoked
- Provider API changes

**Solutions:**
1. Try reconnecting the integration
2. Check provider admin panel for issues
3. Contact Targetym support

#### Sync Not Working

**Checklist:**
- [ ] Integration status is "Healthy"
- [ ] Sufficient permissions granted
- [ ] No recent provider outages
- [ ] Network connectivity stable

**Actions:**
1. Check integration health status
2. Review sync logs for errors
3. Manually trigger sync
4. Contact support if issue persists

#### Webhook Events Not Received

**Debugging Steps:**
1. Verify webhook URL is configured in provider
2. Check webhook signature/token
3. Review webhook logs for errors
4. Test with webhook test event (if available)

---

## Security & Privacy

### Data Protection

**Encryption:**
- All OAuth tokens encrypted with AES-256-GCM
- Data encrypted in transit (TLS 1.3)
- Data encrypted at rest

**Access Control:**
- Organization-level isolation
- Role-based access control (Admin, HR, Manager)
- Row-level security policies

**Token Management:**
- Tokens automatically refreshed
- Expired tokens removed
- Revocation on disconnection

### GDPR Compliance

**Your Rights:**
- **Right to access** - View all integration data
- **Right to erasure** - Delete integration data
- **Right to data portability** - Export your data

**Consent Management:**
We track:
- When you granted consent
- Which scopes you approved
- IP address and user agent
- Consent version

**Data Retention:**
- Active integration data: Indefinite
- Disconnected integration logs: 90 days
- Deleted integration data: 30 days (then permanently removed)

### Privacy Policy

Read our [Privacy Policy](https://targetym.com/privacy) for details on:
- What data we collect
- How we use integration data
- Third-party data sharing
- Your privacy rights

---

## Developer Guide

### API Reference

#### Connect Integration

**POST** `/api/integrations/connect`

```typescript
{
  "providerId": "slack",
  "scopes": ["channels:read", "chat:write"]
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "url": "https://slack.com/oauth/v2/authorize?...",
    "state": "abc123..."
  }
}
```

#### List Integrations

**GET** `/api/integrations`

**Response:**
```typescript
{
  "success": true,
  "data": [
    {
      "id": "int_123",
      "providerId": "slack",
      "providerName": "Slack",
      "status": "active",
      "healthStatus": "healthy",
      "connectedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Disconnect Integration

**DELETE** `/api/integrations/{integrationId}`

**Response:**
```typescript
{
  "success": true,
  "data": null
}
```

### Using Provider Clients

#### Slack Client

```typescript
import { slackClient } from '@/src/lib/integrations/providers/slack'

// Send message
await slackClient.sendMessage(
  accessToken,
  '#general',
  'Hello from Targetym!'
)

// Create channel
await slackClient.createChannel(
  accessToken,
  'project-alpha',
  false // private
)
```

#### Google Client

```typescript
import { googleClient } from '@/src/lib/integrations/providers/google'

// Create calendar event
await googleClient.createCalendarEvent(accessToken, {
  summary: 'Team Meeting',
  start: { dateTime: '2025-01-15T10:00:00Z' },
  end: { dateTime: '2025-01-15T11:00:00Z' }
})

// Send email
await googleClient.sendEmail(accessToken, {
  to: 'user@example.com',
  subject: 'Welcome to Targetym',
  body: 'Welcome aboard!'
})
```

### Environment Variables

Required environment variables:

```bash
# Slack
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret

# Google
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Encryption
INTEGRATION_ENCRYPTION_KEY=64-char-hex-string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Testing

```bash
# Run integration tests
npm run test:integration

# Run specific provider tests
npm test -- __tests__/unit/lib/integrations/providers/slack.test.ts

# Run with coverage
npm test -- --coverage
```

---

## FAQ

### How many integrations can I connect?

Unlimited! Connect as many integrations as you need.

### Are my OAuth tokens secure?

Yes! All tokens are encrypted with military-grade AES-256-GCM encryption and stored securely.

### Can I use the same integration across multiple organizations?

Each organization has its own integrations. You'll need to connect separately for each organization.

### What happens if an integration fails?

The system automatically retries with exponential backoff. You'll be notified if the issue persists.

### How often does data sync?

- **Real-time** (webhooks) - Instant
- **Scheduled** - Every 15 minutes
- **Manual** - On-demand

### Can I customize which data syncs?

Yes! Configure sync settings in **Settings → Integrations → {Provider} → Sync Settings**.

---

## Support

### Get Help

- **Documentation:** [docs.targetym.com/integrations](https://docs.targetym.com/integrations)
- **Support Email:** support@targetym.com
- **Community Forum:** [community.targetym.com](https://community.targetym.com)
- **Status Page:** [status.targetym.com](https://status.targetym.com)

### Report Issues

Found a bug? [Report it here](https://github.com/targetym/targetym/issues)

---

**Last Updated:** 2025-11-09
**Version:** 1.0
