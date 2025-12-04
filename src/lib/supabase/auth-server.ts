import 'server-only'
import { createClient as createServerClient } from '@/src/lib/supabase/server'

/**
 * Server-side authentication helpers
 */
export const authServer = {
  async getSession() {
    const supabase = await createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  async getUser() {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getAuthContext() {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's organization from profiles table
    const { data: profileRaw } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    const profile = profileRaw as unknown as { organization_id: string; role: string } | null

    if (!profile?.organization_id) {
      throw new Error('User organization not found')
    }

    return {
      userId: user.id,
      organizationId: profile.organization_id,
      role: profile.role,
    }
  },
}
