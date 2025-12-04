import { SupabaseClient } from '@supabase/supabase-js'

export const mockSupabaseClient = (): Partial<SupabaseClient> => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  } as any,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))
