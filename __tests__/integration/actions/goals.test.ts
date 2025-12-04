import { createGoal } from '@/src/actions/goals/create-goal'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { goalsService } from '@/src/lib/services/goals.service'

// Mock dependencies
jest.mock('@/src/lib/auth/server-auth')
jest.mock('@/src/lib/services/goals.service')
jest.mock('@/src/lib/monitoring/logger')

describe('Goals Actions Integration Tests', () => {
  const mockAuthContext = {
    userId: 'user-123',
    organizationId: 'org-123',
    role: 'employee' as const,
  }

  beforeEach(() => {
    ;(getAuthContext as jest.Mock).mockResolvedValue(mockAuthContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createGoal', () => {
    it('should create a goal with valid input', async () => {
      const mockGoal = {
        id: 'goal-123',
        title: 'Test Goal',
        description: 'Test Description',
        owner_id: 'user-123',
        organization_id: 'org-123',
        period: 'quarterly',
        status: 'draft',
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-03-31T23:59:59Z',
        created_at: new Date().toISOString(),
      }

      ;(goalsService.createGoal as jest.Mock).mockResolvedValue(mockGoal)

      const input = {
        title: 'Test Goal',
        description: 'Test Description',
        status: 'draft' as const,
        period: 'quarterly' as const,
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-03-31T23:59:59Z',
        visibility: 'team' as const,
      }

      const result = await createGoal(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ id: 'goal-123' })
      }
      expect(goalsService.createGoal).toHaveBeenCalledWith({
        ...input,
        owner_id: 'user-123',
        organization_id: 'org-123',
      })
    })

    it('should return error for invalid input', async () => {
      const input = {
        title: 'AB', // Too short (min 3 chars)
        status: 'draft' as const,
        period: 'quarterly' as const,
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-03-31T23:59:59Z',
        visibility: 'team' as const,
      }

      const result = await createGoal(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.code).toBeTruthy()
      }
    })

    it('should return error when end_date is before start_date', async () => {
      const input = {
        title: 'Test Goal',
        status: 'draft' as const,
        period: 'quarterly' as const,
        start_date: '2025-03-31T00:00:00Z',
        end_date: '2025-01-01T00:00:00Z', // Before start_date
        visibility: 'team' as const,
      }

      const result = await createGoal(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('End date must be after start date')
      }
    })

    it('should handle authentication failure', async () => {
      ;(getAuthContext as jest.Mock).mockRejectedValue(
        new Error('Unauthorized')
      )

      const input = {
        title: 'Test Goal',
        status: 'draft' as const,
        period: 'quarterly' as const,
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-03-31T23:59:59Z',
        visibility: 'team' as const,
      }

      const result = await createGoal(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Unauthorized')
      }
    })

    it('should handle service failure', async () => {
      ;(goalsService.createGoal as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const input = {
        title: 'Test Goal',
        status: 'draft' as const,
        period: 'quarterly' as const,
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-03-31T23:59:59Z',
        visibility: 'team' as const,
      }

      const result = await createGoal(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeTruthy()
      }
    })
  })
})
