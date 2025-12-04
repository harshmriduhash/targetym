/**
 * Example: Basic Goal Management Usage
 *
 * Demonstrates how to use the GoalForm and GoalsList components
 * for creating and displaying goals with proper error handling.
 *
 * @package goals-management
 */

import { GoalForm, GoalsList } from '@/public/registry/goals-management/files/components/goals'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function BasicGoalsExample() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Goals Management</h1>
        <p className="text-muted-foreground mt-2">
          Create, track, and manage your organizational goals and OKRs
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">All Goals</TabsTrigger>
          <TabsTrigger value="create">Create New Goal</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Display all goals with built-in filtering and pagination */}
          <GoalsList
            initialFilters={{
              status: 'active' // Only show active goals by default
            }}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          {/* Create a new goal with validation and success handling */}
          <GoalForm
            mode="create"
            // Optional: Add custom success/error handlers
            onSuccess={() => {
              toast.success('Goal created successfully!', {
                description: 'Your goal is now active and ready for tracking.'
              })
            }}
            onError={(error) => {
              toast.error('Failed to create goal', {
                description: error.message
              })
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Usage Notes:
 *
 * 1. GoalForm component handles:
 *    - Form validation using Zod schemas
 *    - Auto-populated default values (dates, status)
 *    - Period selection (quarterly, semi-annual, annual, custom)
 *    - Visibility settings (private, team, organization)
 *    - Optional parent goal linking for hierarchical OKRs
 *
 * 2. GoalsList component includes:
 *    - Built-in search and filtering (status, period, owner)
 *    - Pagination support
 *    - Real-time progress tracking
 *    - Status badges and priority indicators
 *    - Click-through to detailed goal view
 *
 * 3. Required dependencies:
 *    - Server Actions: @/src/actions/goals (createGoal, getGoals)
 *    - Validation: @/src/lib/validations/goals.schemas
 *    - Database types: @/src/types/database.types
 *
 * 4. Authentication:
 *    - Automatically uses Supabase auth from context
 *    - Server Actions handle organization_id injection
 *    - RLS policies ensure multi-tenant isolation
 */
