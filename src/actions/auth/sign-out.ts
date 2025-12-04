'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface SignOutResponse {
  success: boolean
  error?: {
    message: string
  }
}

/**
 * Sign Out Server Action
 * Signs out the current user and redirects to home
 */
export async function signOut(): Promise<never> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
  }

  // Revalidate the layout to update auth state
  revalidatePath('/', 'layout')

  // Redirect to home page
  redirect('/')
}
