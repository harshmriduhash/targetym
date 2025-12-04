# Goals Management Examples

Comprehensive examples demonstrating the Goals & OKR management module from the Targetym Component Registry.

## Overview

The `goals-management` module provides a complete solution for creating, tracking, and managing organizational goals using the OKR (Objectives and Key Results) framework.

## Examples

### 1. Basic Usage (`basic.tsx`)

The simplest way to integrate goal management into your application.

**Features:**
- Goal creation with comprehensive form validation
- List view with filtering and pagination
- Status tracking and progress visualization
- Tab-based navigation between views

**Use Case:** Perfect for getting started or implementing a minimal goals dashboard.

```tsx
import { GoalForm, GoalsList } from '@/public/registry/goals-management/files/components/goals'

<GoalsList initialFilters={{ status: 'active' }} />
<GoalForm mode="create" />
```

### 2. Real-time Updates (`with-realtime.tsx`)

Live synchronization across multiple clients using Supabase Realtime.

**Features:**
- Automatic UI updates when goals change
- Real-time notifications for team collaboration
- Multi-tenant security with RLS policies
- Efficient subscription management

**Use Case:** Ideal for team environments where multiple users work on goals simultaneously.

**Requirements:**
- Supabase Realtime enabled in project
- `realtime-features` registry module

### 3. Optimistic Updates (`with-optimistic-updates.tsx`)

Instant UI feedback with graceful error handling.

**Features:**
- Immediate UI response before server confirmation
- Automatic rollback on errors
- Visual indicators for pending operations
- Seamless integration with React Query

**Use Case:** Best for improving perceived performance and user experience in interactive dashboards.

**Pattern Highlights:**
- `onMutate`: Update cache optimistically
- `onError`: Rollback to previous state
- `onSettled`: Sync with server truth

## Installation

### Prerequisites

```bash
npm install react-hook-form zod @tanstack/react-query recharts
```

### Install from Registry

```bash
# Install goals-management module
npx shadcn@latest add goals-management

# Optional: Install realtime features
npx shadcn@latest add realtime-features
```

### Manual Installation

Copy the files from `public/registry/goals-management/files/` to your project:

```
src/
├── components/goals/
│   ├── goal-form.tsx
│   ├── goals-list.tsx
│   ├── goal-detail.tsx
│   └── progress-tracker.tsx
├── lib/
│   ├── services/goals.service.ts
│   └── validations/goals.schemas.ts
└── actions/goals/
    ├── create-goal.ts
    ├── update-goal.ts
    ├── get-goals.ts
    └── delete-goal.ts
```

## Component API

### GoalForm

```tsx
interface GoalFormProps {
  goal?: Goal              // Optional: For edit mode
  mode?: 'create' | 'edit' // Default: 'create'
  onSuccess?: () => void   // Called after successful submission
  onError?: (error: Error) => void
}
```

### GoalsList

```tsx
interface GoalsListProps {
  initialFilters?: {
    owner_id?: string
    status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold'
    period?: 'quarterly' | 'semi-annual' | 'annual' | 'custom'
  }
}
```

## Database Schema

The module requires these database tables:

```sql
-- Goals table (simplified)
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Organization isolation policy
CREATE POLICY "Users can only access own org goals"
  ON goals
  FOR ALL
  USING (organization_id = get_user_organization_id());
```

## Server Actions

All mutations use Server Actions for type-safe, secure operations:

```tsx
import { createGoal, updateGoal, getGoals, deleteGoal } from '@/src/actions/goals'

// Create
const result = await createGoal({
  title: 'Increase revenue by 20%',
  status: 'active',
  period: 'quarterly',
  start_date: '2025-01-01',
  end_date: '2025-03-31'
})

// Fetch with filters
const goals = await getGoals({
  filters: { status: 'active' },
  pagination: { page: 1, pageSize: 10 }
})

// Update
await updateGoal({
  id: 'goal-uuid',
  status: 'completed'
})

// Delete
await deleteGoal({ id: 'goal-uuid' })
```

## Validation

Goals are validated using Zod schemas:

```tsx
import { createGoalSchema } from '@/src/lib/validations/goals.schemas'

const validatedData = createGoalSchema.parse({
  title: 'My Goal',
  status: 'draft',
  // ... other fields
})
```

## Common Patterns

### Hierarchical Goals (Parent-Child OKRs)

```tsx
<GoalForm
  mode="create"
  defaultValues={{
    parent_goal_id: parentGoalId // Link to company-level OKR
  }}
/>
```

### Custom Success Handlers

```tsx
<GoalForm
  onSuccess={() => {
    router.push('/dashboard/goals')
    queryClient.invalidateQueries(['goals'])
    toast.success('Goal created!')
  }}
/>
```

### Filtering by Owner

```tsx
<GoalsList
  initialFilters={{
    owner_id: currentUserId,
    status: 'active'
  }}
/>
```

## Best Practices

1. **Use Server Actions**: Never access Supabase directly from client components
2. **Enable RLS**: Always enforce Row Level Security policies
3. **Validate Inputs**: Use Zod schemas for all form inputs
4. **Handle Errors**: Provide clear error messages to users
5. **Optimize Queries**: Use pagination and filters to limit data
6. **Real-time Sparingly**: Only subscribe to relevant data changes
7. **Test Policies**: Run `npm run supabase:test` after schema changes

## Troubleshooting

### Goals Not Appearing

1. Check user is authenticated: `await supabase.auth.getUser()`
2. Verify `organization_id` in user profile
3. Review RLS policies in Supabase Studio
4. Check browser console for errors

### Form Validation Errors

- Ensure all required fields are provided
- Check date format: `YYYY-MM-DD`
- Verify enum values match schema (status, period, visibility)

### Real-time Not Working

- Enable Realtime in Supabase project settings
- Check RLS policies allow reads for current user
- Verify subscription channel is active

## Related Modules

- **realtime-features**: Real-time subscriptions and updates
- **cache-manager**: Response caching and optimization
- **performance-management**: Link goals to performance reviews

## Support

For issues or questions:
- Review CLAUDE.md project documentation
- Check Supabase Studio logs
- Run type checking: `npm run type-check`
- Test RLS: `npm run supabase:test`
