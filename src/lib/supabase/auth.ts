import { createClient } from '@/src/lib/supabase/client'

/**
 * Client-side authentication helpers
 */
export const authClient = {
  async signInWithEmail(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signUpWithEmail(email: string, password: string, metadata?: any) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { data, error }
  },

  async signInWithProvider(provider: 'google' | 'github' | 'azure') {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any, // Supabase OAuth provider type
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async resetPassword(email: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  },

  async updatePassword(password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    return { data, error }
  },
}

