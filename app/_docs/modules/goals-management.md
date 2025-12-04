# Goals Management Module

Complete Goals & OKR management system with progress tracking, analytics, and collaboration features.

## Installation

```bash
pnpm registry:install goals-management
```

## Dependencies

This module requires:

```json
{
  "dependencies": {
    "react-hook-form": "^7.63.0",
    "zod": "^4.1.11",
    "@tanstack/react-query": "^5.90.2",
    "recharts": "^3.2.1"
  },
  "registryDependencies": [
    "ui-form",
    "ui-dialog",
    "ui-progress",
    "ui-card"
  ]
}
```

## Components

### GoalForm

Create and edit goals with validation and error handling.

```tsx
import { GoalForm } from '@/components/goals/goal-form'

export default function CreateGoalPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Goal</h1>
      <GoalForm />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `goalId` | `string \| undefined` | `undefined` | Goal ID for edit mode |
| `onSuccess` | `() => void \| undefined` | `undefined` | Callback after successful save |
| `defaultValues` | `Partial<Goal> \| undefined` | `undefined` | Initial form values |

**Features:**
- Zod validation with react-hook-form
- Optimistic UI updates
- Error handling with toast notifications
- Support for key results
- Assignee selection
- Date range picker for deadlines

### GoalsList

Display and manage a list of goals with filtering and sorting.

```tsx
import { GoalsList } from '@/components/goals/goals-list'

export default function GoalsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Goals</h1>
      <GoalsList
        filter={{ status: 'in_progress' }}
        sortBy="created_at"
        sortOrder="desc"
      />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filter` | `GoalFilter \| undefined` | `undefined` | Filter criteria |
| `sortBy` | `GoalSortField` | `'created_at'` | Sort field |
| `sortOrder` | `'asc' \| 'desc'` | `'desc'` | Sort order |
| `limit` | `number` | `20` | Items per page |

**Filter Options:**
```typescript
interface GoalFilter {
  status?: 'draft' | 'in_progress' | 'completed' | 'archived'
  owner_id?: string
  search?: string
  tags?: string[]
}
```

### GoalDetail

Detailed view of a single goal with progress tracking.

```tsx
import { GoalDetail } from '@/components/goals/goal-detail'

export default function GoalPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <GoalDetail goalId={params.id} />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `goalId` | `string` | - | Required. Goal ID to display |
| `showActions` | `boolean` | `true` | Show edit/delete actions |

**Features:**
- Real-time progress updates via Supabase Realtime
- Key results breakdown
- Activity timeline
- Collaboration comments
- Export to PDF

### ProgressTracker

Visual progress indicator with charts and metrics.

```tsx
import { ProgressTracker } from '@/components/goals/progress-tracker'

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <ProgressTracker goalId="goal-123" />
    </div>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `goalId` | `string` | - | Required. Goal ID to track |
| `chartType` | `'line' \| 'bar' \| 'area'` | `'line'` | Chart visualization type |
| `showKeyResults` | `boolean` | `true` | Display key results breakdown |

## Service Layer

### GoalsService

Business logic for goals management.

```typescript
import { goalsService } from '@/lib/services/goals.service'

// Create a new goal
const goal = await goalsService.createGoal({
  title: 'Increase revenue',
  description: 'Grow MRR by 20% this quarter',
  status: 'in_progress',
  owner_id: userId,
  organization_id: orgId,
  target_date: '2025-03-31'
})

// Get goal with progress
const goalWithProgress = await goalsService.getGoalWithProgress(goalId)

// Update goal progress
await goalsService.updateGoalProgress(goalId, { progress: 75 })

// Archive completed goals
await goalsService.archiveGoal(goalId)
```

**Methods:**

- `createGoal(data: CreateGoalData): Promise<Goal>`
- `updateGoal(id: string, data: UpdateGoalData): Promise<Goal>`
- `deleteGoal(id: string): Promise<void>`
- `getGoal(id: string): Promise<Goal>`
- `getGoalWithProgress(id: string): Promise<GoalWithProgress>`
- `listGoals(filter: GoalFilter): Promise<Goal[]>`
- `updateGoalProgress(id: string, progress: number): Promise<void>`
- `archiveGoal(id: string): Promise<void>`

## Server Actions

### create-goal

```typescript
import { createGoal } from '@/actions/goals/create-goal'

const result = await createGoal({
  title: 'Launch new product',
  description: 'Ship version 2.0',
  status: 'in_progress',
  target_date: '2025-06-30'
})

if (result.success) {
  console.log('Goal created:', result.data.id)
} else {
  console.error('Error:', result.error.message)
}
```

### update-goal

```typescript
import { updateGoal } from '@/actions/goals/update-goal'

const result = await updateGoal({
  id: 'goal-123',
  title: 'Updated title',
  progress: 80
})
```

### delete-goal

```typescript
import { deleteGoal } from '@/actions/goals/delete-goal'

const result = await deleteGoal({ id: 'goal-123' })
```

## Validation Schemas

All inputs are validated using Zod schemas:

```typescript
import { createGoalSchema, updateGoalSchema } from '@/lib/validations/goals.schemas'

// Validate create input
const validatedData = createGoalSchema.parse({
  title: 'My goal',
  description: 'Description',
  status: 'in_progress'
})

// Validate update input
const validatedUpdate = updateGoalSchema.parse({
  id: 'goal-123',
  progress: 75
})
```

## Database Schema

The module uses these tables:

### goals

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  progress DECIMAL(5,2) DEFAULT 0,
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### key_results

```sql
CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### goal_collaborators

```sql
CREATE TABLE goal_collaborators (
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  PRIMARY KEY (goal_id, user_id)
);
```

## RLS Policies

Row-Level Security policies ensure data isolation:

```sql
-- Users can view goals in their organization
CREATE POLICY "Users can view own org goals"
  ON goals FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Users can create goals in their organization
CREATE POLICY "Users can create goals"
  ON goals FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Users can update their own goals or goals they collaborate on
CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT goal_id FROM goal_collaborators
      WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
    )
  );
```

## React Query Hooks

Optimized data fetching with React Query:

```typescript
import { useGoals } from '@/lib/react-query/hooks/use-goals'

function GoalsComponent() {
  const { data: goals, isLoading, error } = useGoals({
    status: 'in_progress'
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {goals?.map(goal => (
        <div key={goal.id}>{goal.title}</div>
      ))}
    </div>
  )
}
```

**Available Hooks:**

- `useGoals(filter)` - List goals with filtering
- `useGoal(id)` - Get single goal
- `useGoalWithProgress(id)` - Goal with calculated progress
- `useOptimisticGoals()` - Optimistic updates for goals
- `useRealtimeGoals()` - Real-time goal updates via Supabase

## Real-time Updates

Subscribe to real-time goal updates:

```typescript
import { useRealtimeGoals } from '@/lib/react-query/hooks/use-realtime-goals'

function LiveGoals() {
  const { data: goals } = useRealtimeGoals({
    channel: 'goals-updates'
  })

  return <GoalsList goals={goals} />
}
```

## Examples

### Complete Goal Management Page

```tsx
'use client'

import { useState } from 'react'
import { GoalsList } from '@/components/goals/goals-list'
import { GoalForm } from '@/components/goals/goal-form'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function GoalsPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Goals & OKRs</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <GoalForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <GoalsList />
    </div>
  )
}
```

### Goal Detail with Real-time Updates

```tsx
'use client'

import { GoalDetail } from '@/components/goals/goal-detail'
import { ProgressTracker } from '@/components/goals/progress-tracker'
import { useRealtimeGoal } from '@/lib/react-query/hooks/use-realtime-goals'

export default function GoalPage({ params }: { params: { id: string } }) {
  const { data: goal } = useRealtimeGoal(params.id)

  if (!goal) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6">
        <GoalDetail goalId={params.id} />
        <ProgressTracker goalId={params.id} chartType="area" />
      </div>
    </div>
  )
}
```

## Testing

Test your goals components:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalForm } from '@/components/goals/goal-form'

describe('GoalForm', () => {
  it('creates a goal successfully', async () => {
    const user = userEvent.setup()
    render(<GoalForm />)

    await user.type(screen.getByLabelText('Title'), 'New Goal')
    await user.type(screen.getByLabelText('Description'), 'Goal description')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByText(/goal created/i)).toBeInTheDocument()
    })
  })
})
```

## Troubleshooting

### Goals not loading

1. Check Supabase connection
2. Verify RLS policies are enabled
3. Ensure user is authenticated
4. Check organization_id is set in profile

### Progress not updating

1. Verify Supabase Realtime is enabled
2. Check subscription channel name
3. Ensure RLS policies allow updates
4. Verify React Query cache invalidation

## Related Documentation

- [React Query Hooks](../utilities/react-query.md)
- [Supabase Auth](../utilities/supabase-auth.md)
- [Real-time Features](./realtime-features.md)
- [Form Validation](../utilities/validation.md)
