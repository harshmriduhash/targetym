import { GoalsService } from '@/src/lib/services/goals.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError, ForbiddenError } from '@/src/lib/utils/errors'

// Mock Supabase client
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/cache/redis', () => ({
  cacheGet: jest.fn(() => Promise.resolve(null)),
  cacheSet: jest.fn(() => Promise.resolve()),
  cacheDel: jest.fn(() => Promise.resolve()),
  cacheDelPattern: jest.fn(() => Promise.resolve()),
  cacheKey: jest.fn((...args) => args.join(':')),
  CachePrefix: {
    GOALS: 'goals',
    RECRUITMENT: 'recruitment',
    PERFORMANCE: 'performance',
  },
  CacheTTL: {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 900,
  },
}))
jest.mock('@/src/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  },
}))

describe('GoalsService', () => {
  let service: GoalsService
  let mockSupabaseQueryBuilderQueryBuilder: any

  beforeEach(() => {
    service = new GoalsService()

    // Create a mock query builder that chains properly
    mockSupabaseQueryBuilderQueryBuilder = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseQueryBuilderQueryBuilder)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createGoal', () => {
    it('should create a goal successfully', async () => {
      const mockGoal = {
        id: 'goal-123',
        title: 'Test Goal',
        description: 'Test Description',
        owner_id: 'user-123',
        organization_id: 'org-123',
        period: 'quarterly',
        status: 'draft',
        created_at: new Date().toISOString(),
      }

      mockSupabaseQueryBuilderQueryBuilder.single.mockResolvedValue({
        data: mockGoal,
        error: null,
      })

      const data = {
        title: 'Test Goal',
        description: 'Test Description',
        owner_id: 'user-123',
        organization_id: 'org-123',
        period: 'quarterly',
      }

      const result = await service.createGoal(data)

      expect(result).toEqual(mockGoal)
      expect(mockSupabaseQueryBuilderQueryBuilder.from).toHaveBeenCalledWith('goals')
      expect(mockSupabaseQueryBuilderQueryBuilder.insert).toHaveBeenCalled()
    })

    it('should throw error if create fails', async () => {
      mockSupabaseQueryBuilderQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as never)

      const data = {
        title: 'Test Goal',
        owner_id: 'user-123',
        organization_id: 'org-123',
        period: 'quarterly',
      }

      await expect(service.createGoal(data)).rejects.toThrow('Failed to create goal')
    })
  })

  describe('getGoals', () => {
    it('should fetch goals with filters', async () => {
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', organization_id: 'org-123' },
        { id: 'goal-2', title: 'Goal 2', organization_id: 'org-123' },
      ]

      mockSupabaseQueryBuilderQueryBuilder.eq.mockReturnThis()
      mockSupabaseQueryBuilderQueryBuilder.is.mockReturnThis()
      mockSupabaseQueryBuilderQueryBuilder.order.mockResolvedValue({
        data: mockGoals,
        error: null,
      } as never)

      const result = await service.getGoals('org-123', {
        status: 'active',
        owner_id: 'user-123',
      })

      expect(result).toEqual(mockGoals)
      expect(mockSupabaseQueryBuilderQueryBuilder.from).toHaveBeenCalledWith('goals')
      expect(mockSupabaseQueryBuilderQueryBuilder.eq).toHaveBeenCalledWith('organization_id', 'org-123')
      expect(mockSupabaseQueryBuilderQueryBuilder.eq).toHaveBeenCalledWith('status', 'active')
      expect(mockSupabaseQueryBuilderQueryBuilder.eq).toHaveBeenCalledWith('owner_id', 'user-123')
    })

    it('should return empty array when no goals found', async () => {
      mockSupabaseQueryBuilderQueryBuilder.order.mockResolvedValue({
        data: null,
        error: null,
      } as never)

      const result = await service.getGoals('org-123')

      expect(result).toEqual([])
    })
  })

  describe('getGoalById', () => {
    it('should fetch goal by ID', async () => {
      const mockGoal = {
        id: 'goal-123',
        title: 'Test Goal',
        organization_id: 'org-123',
      }

      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValue({
        data: mockGoal,
        error: null,
      } as never)

      const result = await service.getGoalById('goal-123')

      expect(result).toEqual(mockGoal)
      expect(mockSupabaseQueryBuilderQueryBuilder.select).toHaveBeenCalled()
    })

    it('should return null when goal not found', async () => {
      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      } as never)

      const result = await service.getGoalById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateGoal', () => {
    it('should update goal successfully', async () => {
      const existingGoal = {
        id: 'goal-123',
        owner_id: 'user-123',
        organization_id: 'org-123',
      }

      const updatedGoal = {
        ...existingGoal,
        title: 'Updated Title',
      }

      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValueOnce({
        data: existingGoal,
        error: null,
      } as never)

      mockSupabaseQueryBuilderQueryBuilder.single.mockResolvedValueOnce({
        data: updatedGoal,
        error: null,
      } as never)

      const result = await service.updateGoal(
        'goal-123',
        'user-123',
        { title: 'Updated Title' }
      )

      expect(result).toEqual(updatedGoal)
      expect(mockSupabaseQueryBuilderQueryBuilder.update).toHaveBeenCalled()
    })

    it('should throw NotFoundError when goal does not exist', async () => {
      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      } as never)

      await expect(
        service.updateGoal('nonexistent', 'user-123', {
          title: 'Updated',
        })
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ForbiddenError when user is not owner', async () => {
      const existingGoal = {
        id: 'goal-123',
        owner_id: 'other-user',
        organization_id: 'org-123',
      }

      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValue({
        data: existingGoal,
        error: null,
      } as never)

      await expect(
        service.updateGoal('goal-123', 'user-123', {
          title: 'Updated',
        })
      ).rejects.toThrow(ForbiddenError)
    })
  })

  describe('deleteGoal', () => {
    it('should soft delete goal successfully', async () => {
      const existingGoal = {
        id: 'goal-123',
        owner_id: 'user-123',
        organization_id: 'org-123',
      }

      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValue({
        data: existingGoal,
        error: null,
      } as never)

      mockSupabaseQueryBuilderQueryBuilder.eq.mockResolvedValue({
        data: null,
        error: null,
      } as never)

      await service.deleteGoal('goal-123', 'user-123')

      expect(mockSupabaseQueryBuilderQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        })
      )
    })

    it('should throw ForbiddenError when user is not owner', async () => {
      const existingGoal = {
        id: 'goal-123',
        owner_id: 'other-user',
        organization_id: 'org-123',
      }

      mockSupabaseQueryBuilderQueryBuilder.maybeSingle.mockResolvedValue({
        data: existingGoal,
        error: null,
      } as never)

      await expect(
        service.deleteGoal('goal-123', 'user-123')
      ).rejects.toThrow(ForbiddenError)
    })
  })
})
