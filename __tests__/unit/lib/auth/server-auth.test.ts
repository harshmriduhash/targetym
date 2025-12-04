/**
 * @jest-environment node
 */

import { getAuthContext } from '@/src/lib/auth/server-auth'
import { createClient } from '@/src/lib/supabase/server'

jest.mock('@/src/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('Server Auth', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuthContext', () => {
    it('should return auth context with user profile', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValue({
        data: {
          organization_id: 'org-1',
          role: 'employee',
        },
        error: null,
      })

      const context = await getAuthContext()

      expect(context).toEqual({
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'employee',
      })
    })

    it('should throw error when user not logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      await expect(getAuthContext()).rejects.toThrow('Unauthorized')
    })

    it('should throw error when auth returns no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await expect(getAuthContext()).rejects.toThrow('Unauthorized')
    })

    it('should throw error when profile has no organization', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValue({
        data: {
          organization_id: null,
          role: 'employee',
        },
        error: null,
      })

      await expect(getAuthContext()).rejects.toThrow('User organization not found')
    })

    it('should throw error when profile not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      })

      await expect(getAuthContext()).rejects.toThrow('User organization not found')
    })

    it('should query profiles table with correct user id', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      })

      mockSupabase.single.mockResolvedValue({
        data: {
          organization_id: 'org-123',
          role: 'manager',
        },
        error: null,
      })

      await getAuthContext()

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.select).toHaveBeenCalledWith('organization_id, role')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('should work with different user roles', async () => {
      const roles = ['admin', 'hr', 'manager', 'employee']

      for (const role of roles) {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: {
            user: {
              id: `user-${role}`,
              email: `${role}@example.com`,
            },
          },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            organization_id: 'org-1',
            role: role,
          },
          error: null,
        })

        const context = await getAuthContext()

        expect(context.role).toBe(role)
        expect(context.userId).toBe(`user-${role}`)

        jest.clearAllMocks()
        ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
      }
    })

    it('should handle auth service errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth service unavailable'))

      await expect(getAuthContext()).rejects.toThrow('Auth service unavailable')
    })

    it('should handle database errors when fetching profile', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        error: null,
      })

      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'))

      await expect(getAuthContext()).rejects.toThrow('Database connection failed')
    })
  })
})
