/**
 * Realtime Integration Tests
 *
 * Tests for Supabase Realtime subscriptions with React Query integration
 *
 * Prerequisites:
 * - Supabase instance running with migrations applied
 * - Realtime enabled on test tables
 * - Valid authentication context
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRealtimeSubscription, useRealtimeQuery } from '@/src/lib/realtime'
import { createClient } from '@/src/lib/supabase/client'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

// Helper function to create mock goal with all required fields
const createMockGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-1',
  organization_id: 'org-1',
  title: 'Test Goal',
  description: null,
  owner_id: 'user-1',
  status: 'draft',
  progress_percentage: 0,
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  created_at: '2025-01-09T00:00:00Z',
  updated_at: '2025-01-09T00:00:00Z',
  alignment_level: null,
  confidence_level: null,
  deleted_at: null,
  goal_type: null,
  is_aspirational: null,
  parent_goal_id: null,
  period: 'quarterly',
  priority: null,
  search_vector: null,
  tags: null,
  visibility: null,
  ...overrides,
})

// Mock Supabase client
jest.mock('@/src/lib/supabase/client')

describe('Realtime Hooks', () => {
  let queryClient: QueryClient
  let mockChannel: any
  let mockSupabase: any

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Mock channel
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn((callback) => {
        callback('SUBSCRIBED')
        return mockChannel
      }),
      unsubscribe: jest.fn(),
    }

    // Mock Supabase client
    mockSupabase = {
      channel: jest.fn(() => mockChannel),
      removeChannel: jest.fn(),
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    queryClient.clear()
    jest.clearAllMocks()
  })

  describe('useRealtimeSubscription', () => {
    it('should create subscription on mount', async () => {
      const { result } = renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
            filter: 'organization_id=eq.test-org',
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(result.current.status).toBe('connected')
      })

      expect(mockSupabase.channel).toHaveBeenCalled()
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: 'organization_id=eq.test-org',
        }),
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('should handle INSERT events', async () => {
      const onInsert = jest.fn()
      let insertCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          insertCallback = callback
        }
        return mockChannel
      })

      renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
            onInsert,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(insertCallback).toBeDefined()
      })

      // Simulate INSERT event
      const newGoal: Goal = createMockGoal()

      insertCallback({
        eventType: 'INSERT',
        new: newGoal,
        old: {},
        schema: 'public',
        table: 'goals',
      })

      await waitFor(() => {
        expect(onInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: 'INSERT',
            new: newGoal,
          })
        )
      })
    })

    it('should handle UPDATE events', async () => {
      const onUpdate = jest.fn()
      let updateCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          updateCallback = callback
        }
        return mockChannel
      })

      renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
            onUpdate,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(updateCallback).toBeDefined()
      })

      const oldGoal: Goal = createMockGoal({ title: 'Old Title' })

      const newGoal: Goal = createMockGoal({
        title: 'Updated Title',
        progress_percentage: 50,
        updated_at: '2025-01-09T12:00:00Z',
      })

      updateCallback({
        eventType: 'UPDATE',
        old: oldGoal,
        new: newGoal,
        schema: 'public',
        table: 'goals',
      })

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: 'UPDATE',
            old: oldGoal,
            new: newGoal,
          })
        )
      })
    })

    it('should handle DELETE events', async () => {
      const onDelete = jest.fn()
      let deleteCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          deleteCallback = callback
        }
        return mockChannel
      })

      renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
            onDelete,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(deleteCallback).toBeDefined()
      })

      const deletedGoal: Goal = createMockGoal({ title: 'Deleted Goal' })

      deleteCallback({
        eventType: 'DELETE',
        old: deletedGoal,
        new: {},
        schema: 'public',
        table: 'goals',
      })

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(
          expect.objectContaining({
            eventType: 'DELETE',
            old: deletedGoal,
          })
        )
      })
    })

    it('should throttle events when throttleMs is set', async () => {
      const onInsert = jest.fn()
      let insertCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          insertCallback = callback
        }
        return mockChannel
      })

      renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
            onInsert,
            throttleMs: 1000,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(insertCallback).toBeDefined()
      })

      const goal: Goal = createMockGoal()

      // Fire multiple events rapidly
      insertCallback({ eventType: 'INSERT', new: goal, old: {}, schema: 'public', table: 'goals' })
      insertCallback({ eventType: 'INSERT', new: goal, old: {}, schema: 'public', table: 'goals' })
      insertCallback({ eventType: 'INSERT', new: goal, old: {}, schema: 'public', table: 'goals' })

      // Should only process the last one after throttle delay
      await waitFor(() => {
        expect(onInsert).toHaveBeenCalledTimes(1)
      }, { timeout: 2000 })
    })

    it('should cleanup subscription on unmount', async () => {
      const { unmount } = renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      unmount()

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('should handle connection errors', async () => {
      const onError = jest.fn()

      mockChannel.subscribe.mockImplementation((callback: any) => {
        callback('CHANNEL_ERROR')
        return mockChannel
      })

      const { result } = renderHook(
        () =>
          useRealtimeSubscription({
            table: 'goals',
            onError,
            autoReconnect: false,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(result.current.status).toBe('error')
        expect(result.current.error).toBeDefined()
        expect(onError).toHaveBeenCalled()
      })
    })
  })

  describe('useRealtimeQuery', () => {
    it('should invalidate React Query cache on INSERT', async () => {
      let insertCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          insertCallback = callback
        }
        return mockChannel
      })

      const queryKey = ['goals', 'org-1']
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

      renderHook(
        () =>
          useRealtimeQuery({
            table: 'goals',
            queryKey,
            filter: 'organization_id=eq.org-1',
            strategy: 'invalidate',
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(insertCallback).toBeDefined()
      })

      const newGoal: Goal = createMockGoal({ title: 'New Goal' })

      insertCallback({
        eventType: 'INSERT',
        new: newGoal,
        old: {},
        schema: 'public',
        table: 'goals',
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
      })
    })

    it('should call optimistic callbacks when strategy is optimistic', async () => {
      let insertCallback: any
      let updateCallback: any
      let deleteCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          insertCallback = callback
          updateCallback = callback
          deleteCallback = callback
        }
        return mockChannel
      })

      const onOptimisticInsert = jest.fn()
      const onOptimisticUpdate = jest.fn()
      const onOptimisticDelete = jest.fn()

      renderHook(
        () =>
          useRealtimeQuery<Goal>({
            table: 'goals',
            queryKey: ['goals', 'org-1'],
            strategy: 'optimistic',
            onOptimisticInsert,
            onOptimisticUpdate,
            onOptimisticDelete,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      )

      await waitFor(() => {
        expect(insertCallback).toBeDefined()
      })

      const goal: Goal = createMockGoal()

      // Test INSERT
      insertCallback({
        eventType: 'INSERT',
        new: goal,
        old: {},
      })

      await waitFor(() => {
        expect(onOptimisticInsert).toHaveBeenCalledWith(goal)
      })

      // Test UPDATE
      const updatedGoal = { ...goal, title: 'Updated' }
      updateCallback({
        eventType: 'UPDATE',
        old: goal,
        new: updatedGoal,
      })

      await waitFor(() => {
        expect(onOptimisticUpdate).toHaveBeenCalledWith(goal, updatedGoal)
      })

      // Test DELETE
      deleteCallback({
        eventType: 'DELETE',
        old: goal,
        new: {},
      })

      await waitFor(() => {
        expect(onOptimisticDelete).toHaveBeenCalledWith(goal)
      })
    })

    it('should respect enabled flag', async () => {
      const onInsert = jest.fn()
      let insertCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, callback: any) => {
        if (event === 'postgres_changes') {
          insertCallback = callback
        }
        return mockChannel
      })

      const { rerender } = renderHook(
        ({ enabled }) =>
          useRealtimeQuery({
            table: 'goals',
            queryKey: ['goals'],
            strategy: 'optimistic',
            onOptimisticInsert: onInsert,
            enabled,
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
          initialProps: { enabled: false },
        }
      )

      await waitFor(() => {
        expect(insertCallback).toBeDefined()
      })

      const goal: Goal = createMockGoal()

      // Trigger event when disabled
      insertCallback({
        eventType: 'INSERT',
        new: goal,
        old: {},
      })

      // Should not call callback
      expect(onInsert).not.toHaveBeenCalled()

      // Enable and trigger again
      rerender({ enabled: true })
      insertCallback({
        eventType: 'INSERT',
        new: goal,
        old: {},
      })

      await waitFor(() => {
        expect(onInsert).toHaveBeenCalledWith(goal)
      })
    })
  })
})
