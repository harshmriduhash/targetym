/**
 * Example: Real-time Goal Updates
 *
 * Shows how to subscribe to real-time goal updates using
 * Supabase Realtime and React Query for automatic UI refresh.
 *
 * @package goals-management
 * @requires realtime-features
 */

'use client'

import { useEffect } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { createClient } from '@/src/lib/supabase/client'
import { GoalsList } from '@/public/registry/goals-management/files/components/goals'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

export default function RealtimeGoalsExample() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to goal changes for real-time updates
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'goals',
        },
        (payload) => {
          console.log('Goal change detected:', payload)

          // Invalidate and refetch goals list
          queryClient.invalidateQueries({ queryKey: ['goals'] })

          // Show toast notification for changes
          if (payload.eventType === 'INSERT') {
            toast.success('New goal created', {
              description: `${(payload.new as Goal).title} was just added`,
              icon: <Bell className="h-4 w-4" />,
            })
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Goal updated', {
              description: `${(payload.new as Goal).title} was modified`,
              icon: <Bell className="h-4 w-4" />,
            })
          } else if (payload.eventType === 'DELETE') {
            toast.warning('Goal deleted', {
              description: 'A goal was removed',
              icon: <Bell className="h-4 w-4" />,
            })
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Real-time Goals</h1>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
        <p className="text-muted-foreground">
          Goals automatically update across all connected clients in real-time
        </p>
      </div>

      {/* Goals list with automatic real-time updates */}
      <GoalsList />
    </div>
  )
}

/**
 * Implementation Notes:
 *
 * 1. Supabase Realtime Setup:
 *    - Requires Supabase Realtime enabled in project settings
 *    - Uses postgres_changes to listen to table modifications
 *    - Channel cleanup prevents memory leaks
 *
 * 2. React Query Integration:
 *    - invalidateQueries triggers automatic refetch
 *    - Existing cache is updated seamlessly
 *    - UI reflects changes without manual refresh
 *
 * 3. Multi-tenant Security:
 *    - RLS policies ensure users only receive updates for their organization
 *    - No additional filtering needed in client code
 *    - Automatic organization_id filtering via Supabase policies
 *
 * 4. Performance Considerations:
 *    - Subscriptions are lightweight and efficient
 *    - Debouncing can be added for high-frequency updates
 *    - Consider pagination to limit real-time data volume
 *
 * 5. Error Handling:
 *    - Connection drops are handled by Supabase client
 *    - Automatic reconnection on network restore
 *    - Toast notifications keep users informed
 */
