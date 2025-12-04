import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/src/lib/supabase/server'

export async function getAuthContext() {
  // Get authenticated user from Clerk
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get user's organization from profiles table (Supabase)
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', userId)
    .single()

  if (!profile?.organization_id) {
    throw new Error('User organization not found')
  }

  return {
    userId,
    organizationId: profile.organization_id,
    role: profile.role,
  }
}
