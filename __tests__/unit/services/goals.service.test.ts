import { goalsService } from '@/src/lib/services/goals.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError, ForbiddenError } from '@/src/lib/utils/errors'

// Mock Supabase client
jest.mock('@/src/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('GoalsService', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('createGoal', () => {
    it('should create a goal successfully', async () => {
      const mockGoalData = {
        title: 'Test Goal',
        description: 'Test Description',
        owner_id: 'user-123',
        organization_id: 'org-123',
        period: 'quarterly',
        status: 'draft',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
      }

      const mockInsertedGoal = {
        id: 'goal-123',
        ...mockGoalData,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      mockSupabaseClient.single.mockResolvedValue({
        data: mockInsertedGoal,
        error: null,
      })

      const result = await goalsService.createGoal(mockGoalData)

      expect(result).toEqual(mockInsertedGoal)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('goals')
      expect(mockSupabaseClient.insert).toHaveBeenCalled()
      expect(mockSupabaseClient.select).toHaveBeenCalled()
    })

    it('should throw error when insert fails', async () => {
      const mockGoalData = {
        title: 'Test Goal',
        owner_id: 'user-123',
        organization_id: 'org-123',
        period: 'quarterly',
      }

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(goalsService.createGoal(mockGoalData)).rejects.toThrow(
        'Failed to insert into goals: Database error'
      )
    })
  })

  describe('updateGoal', () => {
    it('should update goal when user is owner', async () => {
      const goalId = 'goal-123'
      const userId = 'user-123'
      const updateData = {
        title: 'Updated Goal',
        description: 'Updated Description',
      }

      const existingGoal = {
        id: goalId,
        title: 'Old Goal',
        owner_id: userId,
        organization_id: 'org-123',
      }

      const updatedGoal = {
        ...existingGoal,
        ...updateData,
        updated_at: expect.any(String),
      }

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({
          data: existingGoal,
          error: null,
        })

      mockSupabaseClient.single.mockResolvedValue({
        data: updatedGoal,
        error: null,
      })

      const result = await goalsService.updateGoal(goalId, userId, updateData)

      expect(result).toMatchObject(updateData)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('goals')
    })

    it('should throw ForbiddenError when user is not owner', async () => {
      const goalId = 'goal-123'
      const userId = 'user-456' // Different user
      const updateData = { title: 'Updated Goal' }

      const existingGoal = {
        id: goalId,
        owner_id: 'user-123', // Original owner
        organization_id: 'org-123',
      }

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: existingGoal,
        error: null,
      })

      await expect(
        goalsService.updateGoal(goalId, userId, updateData)
      ).rejects.toThrow(ForbiddenError)
    })

    it('should throw NotFoundError when goal does not exist', async () => {
      const goalId = 'nonexistent-goal'
      const userId = 'user-123'
      const updateData = { title: 'Updated Goal' }

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      await expect(
        goalsService.updateGoal(goalId, userId, updateData)
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteGoal', () => {
    it('should soft delete goal when user is owner', async () => {
      const goalId = 'goal-123'
      const userId = 'user-123'

      const existingGoal = {
        id: goalId,
        owner_id: userId,
        organization_id: 'org-123',
      }

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: existingGoal,
        error: null,
      })

      mockSupabaseClient.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      await expect(goalsService.deleteGoal(goalId, userId)).resolves.not.toThrow()
    })

    it('should throw ForbiddenError when user is not owner', async () => {
      const goalId = 'goal-123'
      const userId = 'user-456'

      const existingGoal = {
        id: goalId,
        owner_id: 'user-123',
        organization_id: 'org-123',
      }

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: existingGoal,
        error: null,
      })

      await expect(goalsService.deleteGoal(goalId, userId)).rejects.toThrow(
        ForbiddenError
      )
    })
  })

  describe('getGoals', () => {
    it('should fetch goals with pagination', async () => {
      const organizationId = 'org-123'
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1' },
        { id: 'goal-2', title: 'Goal 2' },
      ]

      mockSupabaseClient.select.mockResolvedValueOnce({
        count: 10,
        error: null,
      })

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockGoals,
        error: null,
      })

      const result = await goalsService.getGoals(organizationId, {}, { page: 1, pageSize: 20 })

      expect(result.data).toEqual(mockGoals)
      expect(result.meta.page).toBe(1)
      expect(result.meta.totalItems).toBe(10)
    })
  })
})
