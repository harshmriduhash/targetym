# Google Workspace Integration Guide

Complete guide for integrating Google Workspace APIs (Calendar, Drive, Gmail, People) into the HR platform.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [OAuth Flow](#oauth-flow)
- [API Usage](#api-usage)
  - [Calendar API](#calendar-api)
  - [Drive API](#drive-api)
  - [Gmail API](#gmail-api)
  - [People API](#people-api)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

The Google Workspace integration provides access to:

- **Calendar API**: Schedule interviews, sync company events
- **Drive API**: Store resumes, documents, create candidate folders
- **Gmail API**: Send interview invitations, automated emails
- **People API**: Access user profiles and contacts

**Features:**
- OAuth 2.0 with PKCE for enhanced security
- Automatic retry with exponential backoff
- Circuit breaker for resilience
- Type-safe API responses
- Comprehensive error handling

---

## Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable APIs:
   - Calendar API
   - Drive API
   - Gmail API
   - People API

4. Create OAuth 2.0 credentials:
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://your-app.com/integrations/google/callback`
   - Copy **Client ID** and **Client Secret**

### 2. Environment Configuration

Add to `.env.local`:

```bash
# Google Workspace Integration
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REDIRECT_URI=https://your-app.com/integrations/google/callback

# Optional: Override app URL for redirect
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### 3. Verify Configuration

```typescript
import { createGoogleWorkspaceClient } from '@/src/lib/integrations/providers/google'

const client = createGoogleWorkspaceClient()
if (!client) {
  console.error('Google Workspace not configured')
} else {
  console.log('Google Workspace ready!')
}
```

---

## OAuth Flow

### Complete OAuth Implementation

```typescript
import { GoogleWorkspaceClient } from '@/src/lib/integrations/providers/google'

const client = new GoogleWorkspaceClient({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'https://your-app.com/oauth/callback'
})

// Step 1: Generate authorization URL
const { url, codeVerifier, state } = client.getAuthorizationUrl()

// Store codeVerifier and state in session (required for PKCE)
req.session.google_code_verifier = codeVerifier
req.session.google_state = state

// Redirect user to Google
res.redirect(url)
```

### Handle OAuth Callback

```typescript
// In your callback route: /integrations/google/callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // Verify state (CSRF protection)
  if (state !== req.session.google_state) {
    throw new Error('Invalid state parameter')
  }

  // Exchange code for tokens
  const codeVerifier = req.session.google_code_verifier
  const tokens = await client.exchangeCodeForToken(
    code!,
    'https://your-app.com/oauth/callback',
    codeVerifier
  )

  // Store tokens securely (encrypted)
  await storeTokens(userId, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt
  })

  return redirect('/integrations?success=google')
}
```

### Token Refresh

```typescript
// Automatically refresh expired tokens
async function getValidAccessToken(userId: string): Promise<string> {
  const tokens = await getStoredTokens(userId)

  // Check if token is expired (with 5-minute buffer)
  if (Date.now() >= tokens.expiresAt - 5 * 60 * 1000) {
    const newTokens = await client.refreshAccessToken(tokens.refreshToken)

    // Update stored tokens
    await updateStoredTokens(userId, {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken || tokens.refreshToken,
      expiresAt: newTokens.expiresAt
    })

    return newTokens.accessToken
  }

  return tokens.accessToken
}
```

---

## API Usage

### Calendar API

#### Create Interview Event

```typescript
const accessToken = await getValidAccessToken(userId)

const event = await client.createEvent(accessToken, 'primary', {
  summary: 'Interview: Senior Developer Position',
  description: 'Technical interview with candidate John Doe',
  location: 'Google Meet',
  start: {
    dateTime: '2024-02-15T10:00:00Z',
    timeZone: 'America/New_York'
  },
  end: {
    dateTime: '2024-02-15T11:00:00Z',
    timeZone: 'America/New_York'
  },
  attendees: [
    { email: 'candidate@example.com', optional: false },
    { email: 'interviewer@company.com', optional: false }
  ],
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'email', minutes: 1440 }, // 1 day before
      { method: 'popup', minutes: 30 }    // 30 min before
    ]
  },
  conferenceData: {
    createRequest: {
      requestId: `interview-${Date.now()}`,
      conferenceSolutionKey: { type: 'hangoutsMeet' }
    }
  }
})

console.log(`Event created: ${event.id}`)
console.log(`Meet link: ${event.conferenceData?.entryPoints?.[0]?.uri}`)
```

#### List Upcoming Interviews

```typescript
const now = new Date().toISOString()
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const events = await client.listEvents(
  accessToken,
  'primary',
  now,
  nextWeek,
  50
)

// Filter for interviews
const interviews = events.filter(event =>
  event.summary?.toLowerCase().includes('interview')
)

console.log(`${interviews.length} interviews scheduled`)
```

#### Update Interview Time

```typescript
await client.updateEvent(accessToken, 'primary', eventId, {
  start: {
    dateTime: '2024-02-15T14:00:00Z'
  },
  end: {
    dateTime: '2024-02-15T15:00:00Z'
  },
  description: 'Updated: Time changed to 2 PM EST'
})
```

#### Cancel Interview

```typescript
await client.deleteEvent(accessToken, 'primary', eventId)
```

---

### Drive API

#### Create Candidate Folder

```typescript
// Create main folder
const candidatesFolder = await client.createFolder(
  accessToken,
  'Candidates 2024'
)

// Create sub-folder for specific candidate
const candidateFolder = await client.createFolder(
  accessToken,
  'John Doe - Senior Developer',
  candidatesFolder.id
)

console.log(`Folder created: ${candidateFolder.webViewLink}`)
```

#### Upload Resume

```typescript
import fs from 'fs'

const resumeBuffer = fs.readFileSync('/path/to/resume.pdf')

const file = await client.uploadFile(accessToken, {
  file: resumeBuffer,
  metadata: {
    name: 'John_Doe_Resume.pdf',
    mimeType: 'application/pdf',
    parents: [candidateFolder.id],
    description: 'Resume for Senior Developer position'
  },
  mimeType: 'application/pdf'
})

console.log(`Resume uploaded: ${file.webViewLink}`)
```

#### Share Folder with Team

```typescript
// Share with hiring manager
await client.shareFile(
  accessToken,
  candidateFolder.id,
  'hiring-manager@company.com',
  'writer'
)

// Share with interviewer (read-only)
await client.shareFile(
  accessToken,
  candidateFolder.id,
  'interviewer@company.com',
  'reader'
)
```

#### List Candidate Files

```typescript
const files = await client.listFiles(
  accessToken,
  `'${candidateFolder.id}' in parents`,
  100
)

files.forEach(file => {
  console.log(`- ${file.name} (${file.mimeType})`)
  console.log(`  View: ${file.webViewLink}`)
})
```

#### Download Document

```typescript
const fileContent = await client.downloadFile(accessToken, fileId)

// Save to disk
fs.writeFileSync('/path/to/download/resume.pdf', fileContent)

// Or process in memory
const pdfParser = new PDFParser()
pdfParser.parseBuffer(fileContent)
```

---

### Gmail API

#### Send Interview Invitation

```typescript
await client.sendEmail(accessToken, {
  to: 'candidate@example.com',
  subject: 'Interview Invitation - Senior Developer Position',
  body: `
    <html>
      <body>
        <h2>Interview Invitation</h2>
        <p>Dear John,</p>
        <p>We are pleased to invite you for an interview for the Senior Developer position.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: February 15, 2024</li>
          <li>Time: 10:00 AM EST</li>
          <li>Duration: 1 hour</li>
          <li>Format: Google Meet</li>
        </ul>
        <p>Please confirm your availability.</p>
        <p>Best regards,<br>HR Team</p>
      </body>
    </html>
  `,
  isHtml: true,
  cc: 'hiring-manager@company.com',
  replyTo: 'hr@company.com'
})
```

#### Send Automated Follow-up

```typescript
await client.sendEmail(accessToken, {
  to: 'candidate@example.com',
  subject: 'Application Status Update',
  body: `
    Dear ${candidateName},

    Thank you for your patience. We are currently reviewing your application
    for the ${position} position.

    We will update you on the next steps within the next week.

    Best regards,
    ${companyName} Recruitment Team
  `,
  isHtml: false
})
```

#### Create Draft Email

```typescript
const draft = await client.createDraft(
  accessToken,
  'candidate@example.com',
  'Interview Feedback Request',
  'Please share your feedback on the interview process...'
)

console.log(`Draft created: ${draft.id}`)
// User can review and send manually
```

#### Search Emails

```typescript
// Find all emails from candidates
const messages = await client.listMessages(
  accessToken,
  'from:candidate@example.com subject:application',
  50
)

// Get full message details
for (const msg of messages) {
  const fullMessage = await client.getMessage(accessToken, msg.id)
  console.log(`Subject: ${fullMessage.payload?.headers?.find(h => h.name === 'Subject')?.value}`)
}
```

---

### People API

#### Get User Profile

```typescript
const profile = await client.getUserProfile(accessToken)

console.log(`Name: ${profile.names?.[0]?.displayName}`)
console.log(`Email: ${profile.emailAddresses?.[0]?.value}`)
console.log(`Photo: ${profile.photos?.[0]?.url}`)
console.log(`Organization: ${profile.organizations?.[0]?.name}`)
```

#### List Contacts for Referrals

```typescript
const contacts = await client.listContacts(accessToken, 100)

// Filter for potential referrals
const potentialReferrals = contacts.filter(contact => {
  const email = contact.emailAddresses?.[0]?.value
  return email && email.includes('linkedin') // Example filter
})

console.log(`Found ${potentialReferrals.length} potential referrals`)
```

---

## Error Handling

### Handling Google API Errors

```typescript
import { IntegrationError } from '@/src/lib/integrations/base-client'

try {
  const event = await client.createEvent(accessToken, 'primary', eventData)
} catch (error) {
  if (error instanceof IntegrationError) {
    switch (error.statusCode) {
      case 401:
        // Token expired or invalid
        console.error('Authentication failed. Refresh token.')
        await refreshAndRetry()
        break

      case 403:
        // Insufficient permissions
        console.error('Permission denied. Check OAuth scopes.')
        break

      case 404:
        // Calendar not found
        console.error('Calendar not found. Use "primary" or verify ID.')
        break

      case 429:
        // Rate limit exceeded
        console.error('Rate limit hit. Retry with backoff.')
        await delay(60000) // Wait 1 minute
        break

      case 500:
      case 503:
        // Google server error
        console.error('Google API unavailable. Retry later.')
        break

      default:
        console.error('API error:', error.message)
    }
  }
}
```

### Automatic Retry Logic

The client automatically retries failed requests with exponential backoff:

```typescript
// Automatically retries on:
// - Network errors
// - 429 (rate limit)
// - 500, 502, 503, 504 (server errors)

// No action needed - handled by BaseIntegrationClient
const event = await client.createEvent(accessToken, 'primary', eventData)
```

### Circuit Breaker

Prevents cascading failures when Google API is down:

```typescript
// Check if service is healthy before calling
const isHealthy = await client.healthCheck()

if (!isHealthy) {
  console.warn('Google API circuit breaker is open. Service unavailable.')
  // Use fallback mechanism
  return
}

// Make API call
const events = await client.listEvents(accessToken, 'primary')
```

---

## Best Practices

### 1. Token Management

**Do:**
- Store tokens encrypted in database
- Refresh tokens before expiry (5-minute buffer)
- Handle refresh token rotation
- Revoke tokens when user disconnects

**Don't:**
- Store tokens in plain text
- Expose tokens in client-side code
- Share tokens between users

### 2. Rate Limiting

Google APIs have rate limits:

- **Calendar API**: 1,000,000 requests/day, 10 requests/second
- **Drive API**: 1,000,000,000 requests/day, 1,000 requests/100 seconds
- **Gmail API**: 250 quota units/second

**Best practices:**
- Batch operations when possible
- Implement exponential backoff on 429 errors
- Cache frequently accessed data
- Use webhooks for real-time updates

### 3. Scopes

Request minimum required scopes:

```typescript
// Good: Specific scopes
const scopes = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.send'
]

// Bad: Overly broad scopes
const scopes = [
  'https://www.googleapis.com/auth/calendar', // Full access
  'https://www.googleapis.com/auth/gmail.modify' // Can delete emails
]
```

### 4. Error Recovery

```typescript
async function robustCreateEvent(eventData: CalendarEvent) {
  let retries = 3

  while (retries > 0) {
    try {
      const accessToken = await getValidAccessToken(userId)
      return await client.createEvent(accessToken, 'primary', eventData)
    } catch (error) {
      if (error instanceof IntegrationError && error.statusCode === 401) {
        // Token might be invalid, try refresh
        await forceTokenRefresh(userId)
        retries--
      } else {
        throw error // Non-recoverable error
      }
    }
  }

  throw new Error('Failed to create event after retries')
}
```

### 5. Data Privacy

**Compliance:**
- GDPR: User can request data deletion
- CCPA: User can opt-out of data collection
- SOC 2: Audit all API access

**Implementation:**
```typescript
// Implement data deletion on user request
async function deleteUserGoogleData(userId: string) {
  const tokens = await getStoredTokens(userId)

  // Revoke access
  await client.revokeToken(tokens.accessToken)

  // Delete stored tokens
  await deleteStoredTokens(userId)

  // Delete cached data
  await deleteCachedGoogleData(userId)
}
```

---

## Examples

### Complete Interview Scheduling Workflow

```typescript
import { GoogleWorkspaceClient } from '@/src/lib/integrations/providers/google'

async function scheduleInterview(
  candidateEmail: string,
  interviewerEmail: string,
  position: string,
  dateTime: string
) {
  const client = createGoogleWorkspaceClient()
  if (!client) throw new Error('Google Workspace not configured')

  const accessToken = await getValidAccessToken(interviewerId)

  try {
    // 1. Create calendar event
    const event = await client.createEvent(accessToken, 'primary', {
      summary: `Interview: ${position}`,
      description: `Interview with candidate for ${position} position`,
      start: { dateTime, timeZone: 'UTC' },
      end: {
        dateTime: new Date(new Date(dateTime).getTime() + 3600000).toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        { email: candidateEmail },
        { email: interviewerEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    })

    // 2. Create candidate folder in Drive
    const folder = await client.createFolder(
      accessToken,
      `Candidate - ${candidateEmail}`,
      CANDIDATES_FOLDER_ID
    )

    // 3. Send invitation email
    await client.sendEmail(accessToken, {
      to: candidateEmail,
      subject: `Interview Invitation - ${position}`,
      body: `
        <p>You're invited to interview for ${position}</p>
        <p><strong>Time:</strong> ${new Date(dateTime).toLocaleString()}</p>
        <p><strong>Join:</strong> ${event.conferenceData?.entryPoints?.[0]?.uri}</p>
      `,
      isHtml: true,
      cc: interviewerEmail
    })

    return {
      eventId: event.id,
      folderId: folder.id,
      meetingLink: event.conferenceData?.entryPoints?.[0]?.uri
    }
  } catch (error) {
    logger.error({ error, candidateEmail }, 'Failed to schedule interview')
    throw error
  }
}
```

---

## Testing

Run tests:

```bash
npm test src/lib/integrations/providers/google.test.ts
```

Mock Google API in tests:

```typescript
jest.mock('@/src/lib/integrations/providers/google', () => ({
  GoogleWorkspaceClient: jest.fn().mockImplementation(() => ({
    createEvent: jest.fn().mockResolvedValue({ id: 'mock-event-id' }),
    sendEmail: jest.fn().mockResolvedValue({ id: 'mock-message-id' })
  }))
}))
```

---

## Support

- **API Documentation**: https://developers.google.com/workspace
- **OAuth Guide**: https://developers.google.com/identity/protocols/oauth2
- **Support**: https://support.google.com/cloud

---

## Environment Variables Reference

```bash
# Required
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Optional
GOOGLE_REDIRECT_URI=https://custom-domain.com/callback
NEXT_PUBLIC_APP_URL=https://your-app.com
```

---

**Last Updated**: 2024-01-09
**Version**: 1.0.0
