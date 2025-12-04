# A/B Testing Quick Start Guide

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Using the Test Page](#using-the-test-page)
- [Adding a New Experiment](#adding-a-new-experiment)
- [Adding a New Feature Flag](#adding-a-new-feature-flag)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

## Overview

The A/B testing system allows you to:
- Run experiments with multiple variants
- Gradually roll out features with percentage control
- Track user exposures and conversions
- Override features for specific users

**Key Components:**
- `ABTestingService` - Core service for variant assignment and feature flags
- `IntegrationAnalytics` - Event tracking with A/B test context
- Database tables - `ab_test_assignments`, `ab_test_exposures`, `feature_flags`

## Running Tests

### All A/B Testing Tests

```bash
npm test -- --testPathPatterns="ab-testing"
```

**Expected output:**
```
Test Suites: 2 passed, 2 total
Tests:       29 passed, 29 total
```

### Integration Tests Only

```bash
npm test -- ab-testing-verification.test.ts
```

**Coverage:**
- Variant assignment consistency (3 tests)
- Distribution accuracy (2 tests)
- Feature flag rollout (6 tests)
- Exposure tracking (2 tests)
- Error handling (4 tests)
- Real-world scenarios (2 tests)

### Unit Tests Only

```bash
npm test -- ab-testing.test.ts
```

**Coverage:**
- Service layer functionality (10 tests)

## Using the Test Page

### Access

Navigate to: `/test/ab-testing` (requires authentication)

### Features

**1. View Your Variant Assignments**
- See which variant you're assigned to for each experiment
- Variant stays consistent across page refreshes
- Shows variant configuration details

**2. Check Feature Flags**
- See which features are enabled for you
- Visual indicators (✓ enabled, ✗ disabled)
- Displays rollout percentage context

**3. Distribution Statistics**
- Live metrics from database
- Visual progress bars showing variant split
- Helps verify 50/50 distribution

**4. Testing Instructions**
- Guided workflow for manual testing
- Commands for automated tests

### Manual Testing Workflow

1. **Consistency Test:**
   ```
   - Open /test/ab-testing
   - Note your assigned variants
   - Refresh page 10 times
   - Verify variants stay the same
   ```

2. **Distribution Test:**
   ```
   - Create 5-10 test users
   - Visit /test/ab-testing with each user
   - Check distribution stats
   - Verify split approaches 50/50
   ```

## Adding a New Experiment

### Step 1: Define Experiment

Edit `src/lib/analytics/ab-testing.ts`:

```typescript
export const INTEGRATION_EXPERIMENTS = {
  OAUTH_FLOW_OPTIMIZATION: 'oauth_flow_optimization',
  PROVIDER_ONBOARDING_UX: 'provider_onboarding_ux',
  YOUR_NEW_EXPERIMENT: 'your_new_experiment', // Add here
} as const
```

### Step 2: Configure Variants

In the same file, add experiment configuration:

```typescript
private static async getExperiment(experimentId: string): Promise<Experiment | null> {
  const experiments: Record<string, Experiment> = {
    // ... existing experiments ...

    [INTEGRATION_EXPERIMENTS.YOUR_NEW_EXPERIMENT]: {
      id: INTEGRATION_EXPERIMENTS.YOUR_NEW_EXPERIMENT,
      name: 'Your New Experiment',
      description: 'Description of what you are testing',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'control',
          description: 'Original version',
          weight: 50,
          config: { useNewFeature: false },
        },
        {
          id: 'variant_a',
          name: 'variant_a',
          description: 'New version A',
          weight: 50,
          config: { useNewFeature: true, version: 'a' },
        },
      ],
      startDate: '2025-01-15',
      endDate: null,
      targetPercentage: 100,
    },
  }

  return experiments[experimentId] || null
}
```

### Step 3: Use in Code

```typescript
'use server'

import { ABTestingService, INTEGRATION_EXPERIMENTS } from '@/src/lib/analytics/ab-testing'

export async function myServerAction(userId: string) {
  // Get variant for user
  const variant = await ABTestingService.getVariant(
    userId,
    INTEGRATION_EXPERIMENTS.YOUR_NEW_EXPERIMENT
  )

  // Track exposure
  await ABTestingService.trackExposure(
    userId,
    INTEGRATION_EXPERIMENTS.YOUR_NEW_EXPERIMENT,
    variant.id
  )

  // Use variant config
  if (variant.config.useNewFeature) {
    // New feature logic
  } else {
    // Original logic
  }
}
```

### Step 4: Add to Test Page

Edit `app/test/ab-testing/page.tsx`:

```typescript
const experiments = [
  {
    id: INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
    name: 'OAuth Flow Optimization',
  },
  {
    id: INTEGRATION_EXPERIMENTS.PROVIDER_ONBOARDING_UX,
    name: 'Provider Onboarding UX',
  },
  {
    id: INTEGRATION_EXPERIMENTS.YOUR_NEW_EXPERIMENT,
    name: 'Your New Experiment', // Add here
  },
]
```

## Adding a New Feature Flag

### Step 1: Database Setup

```sql
INSERT INTO feature_flags (name, enabled, rollout_percentage, description)
VALUES (
  'your_feature_flag_name',
  true,                    -- Enabled/disabled
  50,                      -- Rollout percentage (0-100)
  'Description of feature'
);
```

### Step 2: Use in Code

```typescript
'use server'

import { ABTestingService } from '@/src/lib/analytics/ab-testing'

export async function myServerAction(userId: string) {
  // Check if feature is enabled
  const isEnabled = await ABTestingService.isFeatureEnabled(
    userId,
    'your_feature_flag_name'
  )

  if (isEnabled) {
    // Feature logic
  } else {
    // Fallback logic
  }
}
```

### Step 3: User Override (Optional)

Enable for specific users:

```sql
INSERT INTO feature_flag_overrides (user_id, flag_name, enabled)
VALUES (
  'user-id-here',
  'your_feature_flag_name',
  true  -- Override value
);
```

### Step 4: Gradual Rollout

```sql
-- Start with 10%
UPDATE feature_flags
SET rollout_percentage = 10
WHERE name = 'your_feature_flag_name';

-- Increase to 25%
UPDATE feature_flags
SET rollout_percentage = 25
WHERE name = 'your_feature_flag_name';

-- Full rollout
UPDATE feature_flags
SET rollout_percentage = 100
WHERE name = 'your_feature_flag_name';
```

## Integration Examples

### Example 1: OAuth Flow A/B Test

```typescript
'use server'

import { ABTestingService, INTEGRATION_EXPERIMENTS } from '@/src/lib/analytics/ab-testing'
import { IntegrationAnalytics, IntegrationEventType } from '@/src/lib/analytics/integration-events'

export async function initiateOAuthFlow(userId: string, providerId: string) {
  // Get variant
  const variant = await ABTestingService.getVariant(
    userId,
    INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
  )

  // Track exposure
  await ABTestingService.trackExposure(
    userId,
    INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
    variant.id
  )

  // Track analytics with variant context
  await IntegrationAnalytics.track(
    IntegrationEventType.OAUTH_REDIRECT,
    {
      providerId,
      providerName: 'Slack',
      organizationId: 'org-123',
      userId,
    },
    {
      experimentId: INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
      variantId: variant.id,
      variantName: variant.name,
    }
  )

  // Use variant-specific logic
  if (variant.config.useNewFlow) {
    return initiateNewOAuthFlow(userId, providerId)
  } else {
    return initiateOriginalOAuthFlow(userId, providerId)
  }
}
```

### Example 2: Feature Flag with Fallback

```typescript
'use server'

import { ABTestingService } from '@/src/lib/analytics/ab-testing'

export async function syncIntegrationData(userId: string, integrationId: string) {
  // Check auto-sync feature
  const autoSyncEnabled = await ABTestingService.isFeatureEnabled(
    userId,
    'integration_auto_sync'
  )

  if (autoSyncEnabled) {
    // Auto-sync logic
    await performAutomaticSync(integrationId)
  } else {
    // Manual sync logic
    await scheduleManualSync(integrationId)
  }
}
```

### Example 3: Multi-Variant Test

```typescript
const variant = await ABTestingService.getVariant(
  userId,
  INTEGRATION_EXPERIMENTS.PROVIDER_ONBOARDING_UX
)

switch (variant.id) {
  case 'standard':
    return <StandardOnboarding />
  case 'guided':
    return <GuidedOnboarding />
  case 'video':
    return <VideoOnboarding />
  default:
    return <StandardOnboarding />
}
```

## Troubleshooting

### Issue: User gets different variant on refresh

**Cause:** Assignment not persisting to database

**Solution:**
1. Check database connection
2. Verify `ab_test_assignments` table exists
3. Check insert permissions (RLS policies)
4. Review server logs for errors

```sql
-- Check if assignment was stored
SELECT * FROM ab_test_assignments
WHERE user_id = 'your-user-id';
```

### Issue: Feature flag not working

**Cause:** Flag not in database or disabled

**Solution:**
1. Verify flag exists in database:
   ```sql
   SELECT * FROM feature_flags WHERE name = 'your_flag_name';
   ```
2. Check if flag is enabled:
   ```sql
   UPDATE feature_flags SET enabled = true WHERE name = 'your_flag_name';
   ```
3. Verify rollout percentage is greater than 0

### Issue: Distribution not 50/50

**Cause:** Sample size too small or hash collision

**Solution:**
1. Check with larger sample (1000+ users)
2. Allow ±10% margin (40-60% is acceptable)
3. Verify variant weights in experiment config

```typescript
// Check variant weights add up to 100
variants: [
  { id: 'control', weight: 50 },
  { id: 'variant', weight: 50 },
]
```

### Issue: Exposure not tracked

**Cause:** Database insert failing

**Solution:**
1. Check `ab_test_exposures` table exists
2. Verify insert permissions
3. Check server logs for errors
4. Ensure exposure tracking is called:
   ```typescript
   await ABTestingService.trackExposure(userId, experimentId, variantId)
   ```

### Issue: Test page shows no data

**Cause:** No assignments or authentication issue

**Solution:**
1. Verify user is authenticated
2. Check browser console for errors
3. Verify Supabase connection
4. Try accessing an experiment first:
   ```typescript
   const variant = await ABTestingService.getVariant(userId, experimentId)
   ```

## Best Practices

### 1. Always Track Exposure

```typescript
// ✅ Good
const variant = await ABTestingService.getVariant(userId, experimentId)
await ABTestingService.trackExposure(userId, experimentId, variant.id)

// ❌ Bad - No exposure tracking
const variant = await ABTestingService.getVariant(userId, experimentId)
```

### 2. Use Feature Flags for Gradual Rollout

```typescript
// ✅ Good - Gradual rollout with feature flag
const isEnabled = await ABTestingService.isFeatureEnabled(userId, 'new_feature')

// ❌ Bad - All-or-nothing deployment
const variant = await ABTestingService.getVariant(userId, 'experiment')
```

### 3. Include A/B Context in Analytics

```typescript
// ✅ Good
await IntegrationAnalytics.track(
  IntegrationEventType.CONNECTION_COMPLETED,
  properties,
  {
    experimentId: INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
    variantId: variant.id,
    variantName: variant.name,
  }
)

// ❌ Bad - Missing A/B context
await IntegrationAnalytics.track(
  IntegrationEventType.CONNECTION_COMPLETED,
  properties
)
```

### 4. Handle Errors Gracefully

```typescript
// ✅ Good
try {
  const variant = await ABTestingService.getVariant(userId, experimentId)
  // Use variant
} catch (error) {
  console.error('A/B test error:', error)
  // Fallback to default behavior
}

// ❌ Bad - No error handling
const variant = await ABTestingService.getVariant(userId, experimentId)
```

## Reference Links

- [A/B Testing Service](../src/lib/analytics/ab-testing.ts)
- [Integration Analytics](../src/lib/analytics/integration-events.ts)
- [Test Page](../app/test/ab-testing/page.tsx)
- [Integration Tests](../__tests__/integration/ab-testing-verification.test.ts)
- [Unit Tests](../__tests__/unit/lib/analytics/ab-testing.test.ts)
- [Verification Summary](../AB_TESTING_VERIFICATION_SUMMARY.md)

## Support

For issues or questions:
1. Check the [Verification Summary](../AB_TESTING_VERIFICATION_SUMMARY.md)
2. Review [Troubleshooting](#troubleshooting) section
3. Run automated tests to verify system health
4. Check `/test/ab-testing` page for live status
