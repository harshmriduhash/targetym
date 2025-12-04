import { POST as razorpayHandler } from '@/app/api/webhooks/razorpay/route'
import { createClient } from '@/src/lib/supabase/server'

jest.mock('@/src/lib/supabase/server')

describe('Razorpay webhook handler', () => {
  const mockSupabase: any = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({}),
    select: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
  }

  beforeAll(() => {
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('returns 400 for invalid signature', async () => {
    // Create a fake Request without signature header
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) })
    const res = await razorpayHandler(req as any)
    expect(res.status).toBe(400)
  })
})
