# A/B Testing Admin Dashboard

Complete admin dashboard for managing A/B test experiments and feature flags with real-time visualizations.

## Overview

The admin dashboard provides comprehensive tools for:
- Managing A/B test experiments
- Viewing real-time experiment statistics
- Controlling feature flags with rollout percentages
- Managing user-specific feature overrides

## Architecture

### Service Layer

**Location:** `src/lib/services/admin/ab-testing-admin.service.ts`

The `ABTestingAdminService` provides all backend operations:

```typescript
// Experiments
- listExperiments(filters?)
- getExperiment(experimentId)
- getExperimentStats(experimentId)
- createExperiment(data)
- updateExperiment(experimentId, data)
- toggleExperiment(experimentId)
- getExperimentAssignments(experimentId, limit)
- exportExperimentResults(experimentId)

// Feature Flags
- listFeatureFlags()
- getFeatureFlag(flagName)
- getFeatureFlagStats(flagName)
- createFeatureFlag(data)
- updateFeatureFlag(flagName, data)
- toggleFeatureFlag(flagName)

// Overrides
- listFeatureFlagOverrides(flagName?)
- createFeatureFlagOverride(data)
- deleteFeatureFlagOverride(overrideId)
```

### Server Actions

**Experiments Actions** (`src/actions/admin/experiments/`)
- `list-experiments.ts` - List all experiments with filtering
- `get-experiment-stats.ts` - Get detailed statistics
- `toggle-experiment.ts` - Pause/Resume experiment
- `export-experiment-results.ts` - Export to JSON/CSV

**Feature Flags Actions** (`src/actions/admin/feature-flags/`)
- `list-flags.ts` - List all feature flags
- `update-flag.ts` - Update flag configuration
- `toggle-flag.ts` - Enable/Disable flag
- `add-override.ts` - Add user-specific override
- `remove-override.ts` - Remove user override
- `list-overrides.ts` - List all overrides

All actions include:
- Authentication check (requires admin or super_admin role)
- Zod validation
- Error handling with proper response types

### Validation Schemas

**Location:** `src/lib/validations/admin/ab-testing.schemas.ts`

Comprehensive Zod schemas for:
- Creating/updating experiments
- Variant configuration
- Feature flag management
- User overrides

### UI Components

**Experiment Components** (`src/components/admin/experiments/`)

1. **ExperimentCard** - Card displaying experiment summary
   - Status badge (draft/running/paused/completed)
   - Variant distribution progress bars
   - Assignment/exposure statistics
   - Quick actions (view, pause/resume, export)

2. **VariantDistributionChart** - Visual variant distribution
   - Color-coded variants
   - Percentage-based progress bars
   - Assignment counts
   - Total summary

3. **AssignmentsTimeline** - Temporal visualization
   - Daily assignment counts
   - 30-day rolling window
   - Interactive bar chart

**Feature Flag Components** (`src/components/admin/feature-flags/`)

1. **FeatureFlagToggle** - Feature flag control card
   - Enable/disable toggle switch
   - Rollout percentage slider (0-100%)
   - Override statistics
   - Manage overrides button

2. **UserOverrideForm** - Dialog form for adding overrides
   - User ID input (UUID validation)
   - Enable/disable toggle
   - Reason field (optional)
   - Form validation

## Dashboard Pages

### 1. Experiments Overview

**Route:** `/dashboard/admin/experiments`

**Features:**
- **Stats Overview**
  - Total experiments count
  - Total assignments across all experiments
  - Total exposures
  - Active status breakdown

- **Filtering Tabs**
  - All experiments
  - Running only
  - Paused only
  - Completed only

- **Experiment Cards Grid**
  - 3-column responsive layout
  - Real-time statistics
  - Quick actions per experiment

- **Actions**
  - Toggle experiment status (pause/resume)
  - Export experiment results (JSON)
  - Navigate to detailed view

### 2. Experiment Details

**Route:** `/dashboard/admin/experiments/[id]`

**Features:**
- **Experiment Header**
  - Name, description, status badge
  - Start/end dates
  - Target rollout percentage
  - Pause/Resume button
  - Export CSV button

- **Statistics Cards**
  - Total assignments
  - Total exposures
  - Exposure rate (%)

- **Visualizations**
  - Variant distribution chart
  - Assignments timeline (30 days)

- **Variants Configuration Table**
  - Variant ID, name, description
  - Weight distribution
  - JSON configuration display

### 3. Feature Flags Management

**Route:** `/dashboard/admin/feature-flags`

**Features:**
- **Stats Overview**
  - Total flags
  - Enabled count
  - Disabled count
  - Flags with overrides

- **Feature Flag Cards Grid**
  - Enable/disable toggle per flag
  - Rollout percentage slider
  - Real-time percentage update
  - Override statistics badge

- **Manage Overrides Dialog**
  - List of user-specific overrides
  - User email and ID display
  - Override status (enabled/disabled)
  - Reason for override
  - Remove override action

- **Add Override Form**
  - User ID input (UUID)
  - Enable/disable toggle
  - Optional reason field
  - Validation and error handling

## Security

### Authentication & Authorization

All admin pages and actions require:
- Valid authenticated session
- Admin or super_admin role

```typescript
// Check in every server action
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
  return errorResponse('Forbidden: Admin access required', 'FORBIDDEN')
}
```

### RLS Policies

Tables are protected by Row Level Security:

**feature_flags:**
- Admins can manage (all operations)
- All users can read (SELECT only)

**feature_flag_overrides:**
- Users can view their own overrides
- Admins can manage all overrides

**ab_test_experiments:**
- Admins can manage (all operations)
- Users can view running experiments only

**ab_test_assignments:**
- Users can view their own assignments
- System can create assignments (for current user)

**ab_test_exposures:**
- Users can view their own exposures
- System can track exposures (for current user)

## Data Models

### Experiment

```typescript
interface Experiment {
  id: string                    // Unique identifier
  name: string                  // Display name
  description: string | null    // Description
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: Variant[]           // Experiment variants (JSONB)
  start_date: string | null     // ISO timestamp
  end_date: string | null       // ISO timestamp
  target_percentage: number     // 0-100
  metadata: Json | null         // Additional data
  created_at: string            // Auto-generated
  updated_at: string            // Auto-updated
}
```

### Variant

```typescript
interface Variant {
  id: string                    // Variant identifier
  name: string                  // Variant name
  description: string           // Variant description
  weight: number                // 0-100 (must sum to 100)
  config: Record<string, any>   // Variant-specific config
}
```

### Feature Flag

```typescript
interface FeatureFlag {
  id: string                    // UUID
  name: string                  // Unique flag name
  description: string | null    // Description
  enabled: boolean              // Global enable/disable
  rollout_percentage: number    // 0-100
  config: Json                  // Flag-specific config
  created_at: string            // Auto-generated
  updated_at: string            // Auto-updated
}
```

### Feature Flag Override

```typescript
interface FeatureFlagOverride {
  id: string                    // UUID
  user_id: string               // References profiles(id)
  flag_name: string             // References feature_flags(name)
  enabled: boolean              // Override value
  reason: string | null         // Why override exists
  created_at: string            // Auto-generated
  updated_at: string            // Auto-updated
}
```

### Experiment Statistics

```typescript
interface ExperimentStats {
  experimentId: string
  totalAssignments: number
  totalExposures: number
  variantDistribution: {
    variantId: string
    variantName: string
    count: number
    percentage: number
  }[]
  assignmentsByDay: {
    date: string              // ISO date (YYYY-MM-DD)
    count: number
  }[]
}
```

## Usage Examples

### Viewing Experiments

1. Navigate to `/dashboard/admin/experiments`
2. View overview statistics
3. Filter experiments by status using tabs
4. Click on experiment card to view details

### Managing Experiment

1. Click "Pause" to stop new assignments
2. Click "Resume" to restart assignments
3. Click "Export" to download results as JSON
4. View detailed stats and charts in details page

### Managing Feature Flags

1. Navigate to `/dashboard/admin/feature-flags`
2. Toggle switch to enable/disable flag globally
3. Adjust slider to change rollout percentage
4. Changes apply immediately

### Managing User Overrides

1. Click "Manage Overrides" on feature flag card
2. View list of existing overrides
3. Click "Add Override" to create new override
4. Enter user UUID, enable/disable, and reason
5. Click trash icon to remove override

## Export Formats

### JSON Export

```json
{
  "experiment": {
    "id": "oauth_flow_optimization",
    "name": "OAuth Flow Optimization",
    "status": "running",
    ...
  },
  "stats": {
    "totalAssignments": 1234,
    "totalExposures": 890,
    "variantDistribution": [...]
  },
  "assignments": [
    {
      "user_id": "uuid",
      "variant_id": "control",
      "assigned_at": "2025-01-01T00:00:00Z",
      "profiles": {
        "email": "user@example.com"
      }
    }
  ]
}
```

### CSV Export

```csv
User ID,User Email,Variant ID,Assigned At,Experiment Name
uuid-1,user1@example.com,control,2025-01-01T00:00:00Z,OAuth Flow Optimization
uuid-2,user2@example.com,optimized,2025-01-01T00:05:00Z,OAuth Flow Optimization
```

## Performance Considerations

### Database Queries

- **Indexed Fields:** All queries use indexed columns
  - `feature_flags.enabled`
  - `feature_flag_overrides.user_id`
  - `ab_test_assignments(user_id, experiment_id)`
  - `ab_test_exposures(user_id, experiment_id)`
  - `ab_test_exposures.exposed_at`

- **Aggregations:** Daily assignment aggregation uses date truncation
- **Limits:** Assignment lists default to 100 rows (configurable)

### Caching

- React Query caches server state automatically
- Experiment stats refresh on toggle/export actions
- Feature flag updates trigger immediate refetch

### Client-Side Optimization

- **Code Splitting:** All pages use dynamic imports
- **Suspense Boundaries:** Loading states with Skeleton components
- **Optimistic Updates:** UI updates before server confirmation
- **Debouncing:** Rollout slider commits on release, not during drag

## Testing

### Manual Testing Checklist

**Experiments:**
- [ ] View experiments overview page
- [ ] Filter by status (running/paused/completed)
- [ ] Toggle experiment status
- [ ] Export experiment results (JSON/CSV)
- [ ] View experiment details page
- [ ] Verify statistics accuracy
- [ ] Check variant distribution chart
- [ ] Verify assignments timeline

**Feature Flags:**
- [ ] View feature flags page
- [ ] Toggle flag on/off
- [ ] Adjust rollout percentage
- [ ] View overrides list
- [ ] Add user override
- [ ] Remove user override
- [ ] Verify override applies

**Security:**
- [ ] Non-admin cannot access pages (403/redirect)
- [ ] Non-admin cannot call server actions
- [ ] RLS policies enforce data isolation

## Deployment

### Migration

The A/B testing infrastructure is already deployed via:
```sql
supabase/migrations/20251109000000_ab_testing_infrastructure.sql
```

This includes:
- All tables (feature_flags, ab_test_experiments, etc.)
- RLS policies
- Indexes
- Seed data (2 experiments, 7 feature flags)

### Environment Variables

No additional environment variables required.

### Database Setup

1. Ensure migration is applied:
   ```bash
   npm run supabase:push
   ```

2. Verify RLS policies:
   ```bash
   npm run supabase:test
   ```

3. Regenerate types if needed:
   ```bash
   npm run supabase:types
   ```

## Troubleshooting

### Common Issues

**1. "Experiment not found"**
- Check experiment exists in `ab_test_experiments` table
- Verify experiment ID matches route parameter

**2. "Forbidden: Admin access required"**
- User must have `admin` or `super_admin` role in profiles table
- Check session authentication

**3. "Variant weights must sum to 100"**
- When creating/updating experiment, ensure variant weights total exactly 100
- Example: [50, 50] or [33, 33, 34]

**4. Statistics not updating**
- Click refresh or reload page
- Check browser console for errors
- Verify server actions are succeeding

**5. Override not applying**
- User-specific overrides take precedence over global flag
- Check override enabled status
- Verify user_id matches profile

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Conversion tracking
   - Statistical significance testing
   - Bayesian analysis
   - Confidence intervals

2. **Experiment Management**
   - Create experiment from UI
   - Edit experiment configuration
   - Clone existing experiment
   - Schedule start/end dates

3. **Feature Flag Management**
   - Create flag from UI
   - Delete unused flags
   - Flag dependencies
   - Bulk operations

4. **Visualization Improvements**
   - Real-time charts with WebSocket updates
   - Custom date range selection
   - Funnel analysis
   - Cohort analysis

5. **Notifications**
   - Email alerts on experiment completion
   - Slack integration
   - Anomaly detection

6. **API Integration**
   - REST API for external tools
   - Webhook notifications
   - Integration with analytics platforms

## Resources

### Related Documentation

- [A/B Testing Service](../src/lib/analytics/ab-testing.ts)
- [Database Schema](../supabase/migrations/20251109000000_ab_testing_infrastructure.sql)
- [RLS Policies](../supabase/migrations/20251109000000_ab_testing_infrastructure.sql#L76-L149)

### External Resources

- [A/B Testing Best Practices](https://www.optimizely.com/optimization-glossary/ab-testing/)
- [Feature Flags Guide](https://martinfowler.com/articles/feature-toggles.html)
- [Statistical Significance](https://www.optimizely.com/optimization-glossary/statistical-significance/)

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check Supabase logs in Studio
4. Review RLS policies and permissions
