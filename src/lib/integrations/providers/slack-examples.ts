/**
 * Slack Integration - Real-World Usage Examples
 *
 * This file demonstrates practical usage patterns for the Slack integration
 * in the context of an HR platform.
 */

import { SlackClient, SLACK_SCOPES } from '@/src/lib/integrations/providers/slack'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { logger } from '@/src/lib/monitoring/logger'

/**
 * Example 1: Complete OAuth Flow
 *
 * This shows how to implement the full OAuth 2.0 flow for connecting
 * a Slack workspace to the HR platform.
 */
export async function exampleOAuthFlow() {
  // Step 1: Initiate connection (from Server Action)
  const organizationId = 'org_123'
  const userId = 'user_123'

  const authUrl = await integrationsService.connectIntegration({
    providerId: 'slack',
    organizationId,
    userId,
    redirectUri: 'https://app.example.com/integrations/callback',
    scopes: [
      SLACK_SCOPES.CHANNELS_READ,
      SLACK_SCOPES.CHANNELS_WRITE,
      SLACK_SCOPES.CHAT_WRITE,
      SLACK_SCOPES.USERS_READ,
      SLACK_SCOPES.USERS_READ_EMAIL,
    ],
  })

  // Redirect user to authUrl.url
  console.log('Redirect user to:', authUrl.url)

  // Step 2: Handle callback (from API route or Server Action)
  // This happens after user authorizes in Slack
  const callbackCode = 'received_from_slack'
  const callbackState = 'received_from_slack'

  const integration = await integrationsService.handleCallback({
    code: callbackCode,
    state: callbackState,
    organizationId,
    userId,
  })

  console.log('Integration created:', integration.id)
}

/**
 * Example 2: Send Onboarding Welcome Message
 *
 * When a new employee joins, send them a welcome message in Slack
 */
export async function sendOnboardingWelcome(
  integrationId: string,
  employeeEmail: string,
  employeeName: string
) {
  const client = await SlackClient.fromIntegration(integrationId)

  // Find user by email
  const user = await client.getUserByEmail(employeeEmail)

  if (!user) {
    logger.warn({ email: employeeEmail }, 'User not found in Slack')
    return
  }

  // Send welcome DM
  await client.sendDirectMessage(
    user.id,
    `👋 Welcome to the team, ${employeeName}! We're excited to have you here.\n\n` +
      `Check out our company handbook: https://handbook.company.com\n` +
      `Your onboarding tasks: https://app.company.com/onboarding`
  )

  logger.info({ userId: user.id, email: employeeEmail }, 'Onboarding welcome sent')
}

/**
 * Example 3: Create Interview Channel
 *
 * When scheduling an interview, create a dedicated Slack channel
 * for the hiring team and invite relevant people
 */
export async function createInterviewChannel(
  integrationId: string,
  candidateName: string,
  position: string,
  interviewerEmails: string[]
) {
  const client = await SlackClient.fromIntegration(integrationId)

  // Create channel name (lowercase, no spaces)
  const channelName = `interview-${candidateName
    .toLowerCase()
    .replace(/\s+/g, '-')}-${Date.now()}`

  // Create private channel
  const channel = await client.createChannel(channelName, true)

  // Find interviewers by email and invite
  const interviewerIds: string[] = []
  for (const email of interviewerEmails) {
    const user = await client.getUserByEmail(email)
    if (user) {
      interviewerIds.push(user.id)
    }
  }

  if (interviewerIds.length > 0) {
    await client.inviteToChannel(channel.id, interviewerIds)
  }

  // Send initial message with interview details
  await client.sendMessage(
    channel.id,
    `📋 *Interview Channel: ${candidateName}*\n\n` +
      `Position: ${position}\n` +
      `Candidate: ${candidateName}\n\n` +
      `Use this channel to coordinate and share feedback about the interview.`
  )

  logger.info(
    { channelId: channel.id, channelName: channel.name },
    'Interview channel created'
  )

  return channel
}

/**
 * Example 4: Send Performance Review Reminder
 *
 * Send scheduled reminders to managers about upcoming performance reviews
 */
export async function scheduleReviewReminder(
  integrationId: string,
  managerEmail: string,
  employeeName: string,
  reviewDate: Date
) {
  const client = await SlackClient.fromIntegration(integrationId)

  // Find manager
  const manager = await client.getUserByEmail(managerEmail)
  if (!manager) {
    throw new Error(`Manager not found: ${managerEmail}`)
  }

  // Calculate reminder time (24 hours before review)
  const reminderTime = new Date(reviewDate.getTime() - 24 * 60 * 60 * 1000)
  const reminderTimestamp = Math.floor(reminderTime.getTime() / 1000)

  // Schedule DM
  await client.sendDirectMessage(
    manager.id,
    `⏰ *Performance Review Reminder*\n\n` +
      `You have a performance review scheduled for ${employeeName} tomorrow.\n\n` +
      `Please review their goals and prepare feedback:\n` +
      `https://app.company.com/performance/reviews/${employeeName}`
  )

  logger.info(
    { managerId: manager.id, employeeName, reminderTime },
    'Review reminder scheduled'
  )
}

/**
 * Example 5: Announce New Job Posting
 *
 * When a new job is posted, announce it in a recruitment channel
 */
export async function announceJobPosting(
  integrationId: string,
  recruitmentChannelId: string,
  jobTitle: string,
  department: string,
  jobUrl: string
) {
  const client = await SlackClient.fromIntegration(integrationId)

  // Send message with Block Kit for rich formatting
  await client.sendMessage(recruitmentChannelId, 'New job posting!', {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Job Posting',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Position:*\n${jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Department:*\n${department}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Help us find great candidates! Share with your network.',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Job Posting',
            },
            url: jobUrl,
            style: 'primary',
          },
        ],
      },
    ],
  })

  logger.info({ jobTitle, department }, 'Job posting announced in Slack')
}

/**
 * Example 6: Send Goal Achievement Celebration
 *
 * When an employee completes a goal, celebrate in a team channel
 */
export async function celebrateGoalAchievement(
  integrationId: string,
  teamChannelId: string,
  employeeName: string,
  goalTitle: string
) {
  const client = await SlackClient.fromIntegration(integrationId)

  await client.sendMessage(
    teamChannelId,
    `🎉 Congratulations to ${employeeName} for completing their goal: *${goalTitle}*!\n\n` +
      `Great work! 🚀`
  )

  logger.info({ employeeName, goalTitle }, 'Goal achievement celebrated')
}

/**
 * Example 7: Sync Team Members
 *
 * Sync Slack users with HR platform profiles
 */
export async function syncTeamMembers(integrationId: string, organizationId: string) {
  const client = await SlackClient.fromIntegration(integrationId)

  // Get all Slack users
  const slackUsers = await client.listUsers()

  // Filter to real users (not bots)
  const realUsers = slackUsers.filter((u) => !u.isBot)

  logger.info({ count: realUsers.length }, 'Slack users retrieved')

  // Example: Store in database or sync with profiles
  for (const user of realUsers) {
    if (user.email) {
      // Match with existing employee by email
      // Update Slack user ID in profile
      logger.debug(
        { email: user.email, slackId: user.id },
        'Processing Slack user'
      )
    }
  }

  return realUsers
}

/**
 * Example 8: Send Bulk Notifications
 *
 * Send notifications to multiple employees efficiently
 */
export async function sendBulkNotifications(
  integrationId: string,
  notifications: Array<{ email: string; message: string }>
) {
  const client = await SlackClient.fromIntegration(integrationId)

  const results = {
    sent: 0,
    failed: 0,
    notFound: 0,
  }

  for (const { email, message } of notifications) {
    try {
      const user = await client.getUserByEmail(email)

      if (!user) {
        results.notFound++
        logger.warn({ email }, 'User not found in Slack')
        continue
      }

      await client.sendDirectMessage(user.id, message)
      results.sent++
    } catch (error) {
      results.failed++
      logger.error({ email, error }, 'Failed to send notification')
    }
  }

  logger.info(results, 'Bulk notifications completed')
  return results
}

/**
 * Example 9: Health Check Integration
 *
 * Periodically check if Slack integration is healthy
 */
export async function checkSlackHealth(integrationId: string): Promise<boolean> {
  try {
    const client = await SlackClient.fromIntegration(integrationId)

    // Test connection
    const result = await client.testConnection()

    logger.info({ team: result.team, user: result.user }, 'Slack health check passed')

    return true
  } catch (error) {
    logger.error({ integrationId, error }, 'Slack health check failed')
    return false
  }
}

/**
 * Example 10: Archive Old Interview Channels
 *
 * Clean up old interview channels after hiring decision
 */
export async function archiveInterviewChannels(
  integrationId: string,
  channelPrefix: string = 'interview-',
  olderThanDays: number = 30
) {
  const client = await SlackClient.fromIntegration(integrationId)

  // Get all channels
  const channels = await client.listChannels(false) // Include archived

  // Filter interview channels
  const interviewChannels = channels.filter((ch) =>
    ch.name.startsWith(channelPrefix)
  )

  // Calculate cutoff date
  const cutoffTime = Date.now() / 1000 - olderThanDays * 24 * 60 * 60

  const archived: string[] = []

  for (const channel of interviewChannels) {
    // Check if channel is old enough and not already archived
    if (channel.created < cutoffTime && !channel.isPrivate) {
      try {
        await client.archiveChannel(channel.id)
        archived.push(channel.name)
        logger.info({ channelName: channel.name }, 'Interview channel archived')
      } catch (error) {
        logger.error({ channelName: channel.name, error }, 'Failed to archive channel')
      }
    }
  }

  logger.info({ count: archived.length }, 'Interview channels archived')
  return archived
}

/**
 * Example 11: Error Handling Patterns
 *
 * Demonstrate proper error handling with Slack integration
 */
export async function exampleErrorHandling(integrationId: string) {
  const client = await SlackClient.fromIntegration(integrationId)

  try {
    await client.sendMessage('INVALID_CHANNEL', 'Test')
  } catch (error) {
    // Handle specific Slack errors
    if (error instanceof Error && 'slackError' in error) {
      const slackError = (error as any).slackError

      switch (slackError) {
        case 'channel_not_found':
          logger.warn('Channel does not exist')
          break
        case 'not_in_channel':
          logger.warn('Bot is not a member of the channel')
          break
        case 'rate_limited':
          logger.warn('Rate limited, retry later')
          break
        case 'invalid_auth':
          logger.error('Invalid token, need to reconnect')
          // Mark integration as disconnected
          break
        default:
          logger.error({ slackError }, 'Unknown Slack error')
      }
    } else {
      logger.error({ error }, 'Unexpected error')
    }
  }
}

/**
 * Example 12: Integration in Server Action
 *
 * How to use Slack client in a Server Action
 */
export async function exampleServerAction() {

  const integrationId = 'int_123'

  try {
    // Load client from database credentials
    const client = await SlackClient.fromIntegration(integrationId)

    // Use client
    const workspace = await client.getWorkspaceInfo()

    return {
      success: true,
      data: {
        workspace: workspace.name,
        domain: workspace.domain,
      },
    }
  } catch (error) {
    logger.error({ integrationId, error }, 'Server action failed')

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
