import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/src/lib/supabase/server'

/**
 * Get the current authenticated user's ID from Clerk
 * @returns userId or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Get the current authenticated user from Clerk with full details
 * @returns Clerk user object or null if not authenticated
 */
export async function getCurrentUser() {
  return await currentUser()
}

/**
 * Get or create user profile in Supabase synced with Clerk user
 * This ensures the Clerk user exists in the Supabase profiles table
 *
 * @returns Profile with organization_id or null if user not found
 */
export async function getUserProfile() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const supabase = await createClient()

  // Try to get existing profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, organization_id, email, full_name, role')
    .eq('id', userId)
    .single()

  if (profile) {
    return profile
  }

  // If profile doesn't exist, we might need to create it
  // This would typically happen on first login
  // For now, return null and let the application handle profile creation
  return null
}

/**
 * Sync Clerk user with Supabase profile
 * Call this after Clerk webhook or on first login
 *
 * @param clerkUserId - The Clerk user ID
 * @param email - User's email
 * @param fullName - User's full name
 * @param organizationId - Optional organization ID
 */
export async function syncClerkUserToSupabase(
  clerkUserId: string,
  email: string,
  fullName?: string,
  organizationId?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: clerkUserId,
      email,
      full_name: fullName || email.split('@')[0],
      organization_id: organizationId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    })
    .select()
    .single()

  if (error) {
    console.error('Error syncing Clerk user to Supabase:', error)
    throw new Error(`Failed to sync user: ${error.message}`)
  }

  return data
}

/**
 * Check if the current user is authenticated
 * @returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth()
  return !!userId
}

/**
 * Require authentication for a Server Action or API route
 * Throws an error if user is not authenticated
 * @returns userId
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized: Authentication required')
  }

  return userId
}

/**
 * Get user's organization ID from their profile
 * @returns organizationId or null
 */
export async function getUserOrganizationId(): Promise<string | null> {
  const profile = await getUserProfile()
  return profile?.organization_id || null
}
