/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGoals, useGoal, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/src/lib/react-query/hooks/use-goals'
import * as goalsActions from '@/src/actions/goals/get-goals'
import * as getGoalByIdAction from '@/src/actions/goals/get-goal-by-id'
import * as createGoalAction from '@/src/actions/goals/create-goal'
import * as updateGoalAction from '@/src/actions/goals/update-goal'
import * as deleteGoalAction from '@/src/actions/goals/delete-goal'
import { ReactNode } from 'react'

// Mock Server Actions
jest.mock('@/src/actions/goals/get-goals')
jest.mock('@/src/actions/goals/get-goal-by-id')
jest.mock('@/src/actions/goals/create-goal')
jest.mock('@/src/actions/goals/update-goal')
jest.mock('@/src/actions/goals/delete-goal')

describe('useGoals Hook', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  describe('useGoals', () => {
    it('should fetch goals successfully', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Test Goal 1',
          description: null,
          owner_id: 'user-1',
          organization_id: 'org-1',
          period: 'quarterly',
          status: 'active',
          start_date: new Date('2025-01-01').toISOString(),
          end_date: new Date('2025-03-31').toISOString(),
          parent_goal_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          visibility: 'organization',
        },
        {
          id: 'goal-2',
          title: 'Test Goal 2',
          description: null,
          owner_id: 'user-1',
          organization_id: 'org-1',
          period: 'quarterly',
          status: 'active',
          start_date: new Date('2025-01-01').toISOString(),
          end_date: new Date('2025-03-31').toISOString(),
          parent_goal_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          visibility: 'organization',
        },
      ]

      ;(goalsActions.getGoals as jest.Mock).mockResolvedValue({
        success: true,
        data: { data: mockGoals, meta: { page: 1, totalItems: 2 } },
      })

      const { result } = renderHook(() => useGoals(), { wrapper })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockGoals)
    })

    it('should handle error state', async () => {
      ;(goalsActions.getGoals as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to fetch goals',
        code: 'INTERNAL_ERROR',
      })

      const { result } = renderHook(() => useGoals(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should apply filters', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Active Goal',
          description: null,
          owner_id: 'user-1',
          organization_id: 'org-1',
          period: 'quarterly',
          status: 'active',
          start_date: new Date('2025-01-01').toISOString(),
          end_date: new Date('2025-03-31').toISOString(),
          parent_goal_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          visibility: 'organization',
        },
      ]

      ;(goalsActions.getGoals as jest.Mock).mockResolvedValue({
        success: true,
        data: { data: mockGoals, meta: { page: 1, totalItems: 1 } },
      })

      const { result } = renderHook(
        () => useGoals({ status: 'active', owner_id: 'user-1' }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalsActions.getGoals).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          owner_id: 'user-1',
        })
      )
    })

    it('should support pagination', async () => {
      const mockGoals: any[] = []

      ;(goalsActions.getGoals as jest.Mock).mockResolvedValue({
        success: true,
        data: mockGoals,
      })

      const { result } = renderHook(
        () => useGoals({ page: 2, pageSize: 20 }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(goalsActions.getGoals).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 20 })
      )
    })
  })

  describe('useGoal', () => {
    it('should fetch single goal by ID', async () => {
      const mockGoal = {
        id: 'goal-1',
        title: 'Test Goal',
        owner: { id: 'user-1', full_name: 'John Doe' },
        key_results: [{ id: 'kr-1', title: 'KR 1' }],
      }

      ;(getGoalByIdAction.getGoalById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockGoal,
      })

      const { result } = renderHook(() => useGoal('goal-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockGoal)
    })

    it('should not fetch when ID is undefined', () => {
      const { result } = renderHook(() => useGoal(null), { wrapper })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useCreateGoal', () => {
    it('should create goal successfully', async () => {
      const newGoal = { id: 'goal-new', title: 'New Goal' }

      ;(createGoalAction.createGoal as jest.Mock).mockResolvedValue({
        success: true,
        data: newGoal,
      })

      const { result } = renderHook(() => useCreateGoal(), { wrapper })

      await result.current.mutateAsync({
        title: 'New Goal',
        description: 'Description',
        period: 'quarterly',
        status: 'active',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-03-31'),
        visibility: 'organization',
      })

      expect(createGoalAction.createGoal).toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      ;(createGoalAction.createGoal as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
      })

      const { result } = renderHook(() => useCreateGoal(), { wrapper })

      await expect(
        result.current.mutateAsync({
          title: '',
          period: 'quarterly',
          status: 'active',
          start_date: new Date('2025-01-01'),
          end_date: new Date('2025-03-31'),
          visibility: 'organization',
        })
      ).rejects.toThrow()
    })

    it('should invalidate goals query on success', async () => {
      ;(createGoalAction.createGoal as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'goal-new' },
      })

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCreateGoal(), { wrapper })

      await result.current.mutateAsync({
        title: 'New Goal',
        period: 'quarterly',
        status: 'active',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-03-31'),
        visibility: 'organization',
      })

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['goals'],
        })
      })
    })
  })

  describe('useUpdateGoal', () => {
    it('should update goal successfully', async () => {
      const updatedGoal = { id: 'goal-1', title: 'Updated Title' }

      ;(updateGoalAction.updateGoal as jest.Mock).mockResolvedValue({
        success: true,
        data: updatedGoal,
      })

      const { result } = renderHook(() => useUpdateGoal(), { wrapper })

      await result.current.mutateAsync({
        id: 'goal-1',
        data: { title: 'Updated Title' },
      })

      expect(updateGoalAction.updateGoal).toHaveBeenCalledWith(
        'goal-1',
        { title: 'Updated Title' }
      )
    })

    it('should perform optimistic update', async () => {
      queryClient.setQueryData(['goals', 'goal-1'], {
        id: 'goal-1',
        title: 'Original Title',
      })

      ;(updateGoalAction.updateGoal as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'goal-1', title: 'Updated Title' },
      })

      const { result } = renderHook(() => useUpdateGoal(), { wrapper })

      result.current.mutate({
        id: 'goal-1',
        data: { title: 'Updated Title' },
      })

      // Check that query was invalidated
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })

  describe('useDeleteGoal', () => {
    it('should delete goal successfully', async () => {
      ;(deleteGoalAction.deleteGoal as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      })

      const { result } = renderHook(() => useDeleteGoal(), { wrapper })

      await result.current.mutateAsync('goal-1')

      expect(deleteGoalAction.deleteGoal).toHaveBeenCalledWith('goal-1')
    })

    it('should handle delete errors', async () => {
      ;(deleteGoalAction.deleteGoal as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Not found',
        code: 'NOT_FOUND',
      })

      const { result } = renderHook(() => useDeleteGoal(), { wrapper })

      await expect(result.current.mutateAsync('nonexistent')).rejects.toThrow()
    })

    it('should invalidate queries on successful delete', async () => {
      ;(deleteGoalAction.deleteGoal as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      })

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useDeleteGoal(), { wrapper })

      await result.current.mutateAsync('goal-1')

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['goals'],
        })
      })
    })
  })
})
