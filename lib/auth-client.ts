/**
 * Auth Client Wrapper
 *
 * This file provides a Better Auth-compatible API wrapper around Supabase Auth
 * for compatibility with existing auth pages
 */

import { authClient as supabaseAuthClient } from '@/src/lib/supabase/auth'

/**
 * Better Auth-compatible wrapper for Supabase Auth
 */
export const authClient = {
  signUp: {
    async email({ name, email, password, callbackURL }: {
      name: string
      email: string
      password: string
      callbackURL?: string
    }) {
      const { data, error } = await supabaseAuthClient.signUpWithEmail(
        email,
        password,
        { full_name: name }
      )
      return { data, error }
    }
  },

  signIn: {
    async email({ email, password, callbackURL }: {
      email: string
      password: string
      callbackURL?: string
    }) {
      return await supabaseAuthClient.signInWithEmail(email, password)
    },

    async social({ provider, callbackURL }: {
      provider: 'google' | 'github' | 'microsoft' | 'azure'
      callbackURL?: string
    }) {
      // Map microsoft to azure for Supabase
      const supabaseProvider = provider === 'microsoft' ? 'azure' : provider
      return await supabaseAuthClient.signInWithProvider(supabaseProvider as 'google' | 'github' | 'azure')
    }
  },

  async signOut() {
    return await supabaseAuthClient.signOut()
  }
}
